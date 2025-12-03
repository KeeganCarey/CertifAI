/*
This script mainly handles api calls to the different AI providers


It
*/



// LISTENER COMMANDS
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getAIResponse") {
    chrome.storage.local.get(
      ["ai_provider", "openai_key", "lmstudio_port"],
      (settings) => {
        let endpoint = "";
        let headers = { "Content-Type": "application/json" };
        let model = "qwen3-14b";

        // Decide which provider to use
        switch (settings.ai_provider) {

          // OpenAI API CALL
          case "openai":
            if (!settings.openai_key) {
              sendResponse({ success: false, content: "No OpenAI API Key Saved", error: "No OpenAI API Key Saved" });
              return;
            }
            headers["Authorization"] = `Bearer ${settings.openai_key}`;

            endpoint = "https://api.openai.com/v1/chat/completions";
            model = "gpt-3.5-turbo";
            break;

          // LMStudio API CALL
          case "lmstudio":
            if (!settings.lmstudio_port) {
              sendResponse({ success: false, content: "No LMStudio Port Selected", error: "No LMStudio Port Selected" });
              return;
            }
            const port = settings.lmstudio_port;
            endpoint = `http://localhost:${port}/v1/chat/completions`;
            break;
        
          // REMOTE API CALL
          case "remote":
          default:
            endpoint = "http://100.102.38.119:1235/v1/chat/completions";
            model = "qwen3-14b";
            break;
        }

        fetch(endpoint, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            model: model,
            messages: request.messages,
            max_tokens: request.max_tokens || 1028,
          }),
        })
        .then(response => response.json())
        .then(data => {
          sendResponse({ 
            success: true,
            content: data.choices[0].message.content
          });
        })
        .catch(error => {
          sendResponse({ 
            success: false,
            content: error.message,
            error: error.message 
          });
        });
      }
    );

    return true; // keep async channel open
  };



  if (request.action === "getStreamedAIResponse") {
    (async () => {
        try {
            const settings = await new Promise((resolve) =>
                chrome.storage.local.get(["ai_provider", "openai_key", "lmstudio_port"], resolve)
            );

            let endpoint = "";
            let headers = { "Content-Type": "application/json" };
            let model = "qwen3-14b";

            switch (settings.ai_provider) {
                case "openai":
                    if (!settings.openai_key) {

                        // make sure error is also streamed to chat page
                        chrome.runtime.sendMessage({ action: "aiChunk",
                          chunk: "{\"error\": {\"message\" : \"No OpenAI API Key Saved\"}}", 
                          tabId: sender.tab.id});

                        sendResponse({ success: false, error: "No OpenAI API Key Saved" });

                        return;
                    }
                    headers["Authorization"] = `Bearer ${settings.openai_key}`;
                    endpoint = "https://api.openai.com/v1/chat/completions";
                    model = "gpt-3.5-turbo";
                    break;
                case "lmstudio":
                    if (!settings.lmstudio_port) {

                        // make sure error is also streamed to chat page
                        chrome.runtime.sendMessage({ action: "aiChunk",
                          chunk: "{\"error\": {\"message\" : \"No LMStudio Port Selected\"}}", 
                          tabId: sender.tab.id});

                        sendResponse({ success: false, error: "No LMStudio Port Selected" });
                        return;
                    }
                    endpoint = `http://localhost:${settings.lmstudio_port}/v1/chat/completions`;
                    break;
                default:
                    endpoint = "http://100.102.38.119:1235/v1/chat/completions";
                    model = "qwen3-14b";
                    break;
            }

            const response = await fetch(endpoint, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    model,
                    messages: request.messages,
                    max_tokens: request.max_tokens || 1028,
                    stream: true
                })
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");

            function read() {
                reader.read().then(({ done, value }) => {
                    if (done) {
                        sendResponse({ success: true, done: true });
                        return;
                    }

                    const chunk = decoder.decode(value, { stream: true });
                    chrome.runtime.sendMessage({ action: "aiChunk", chunk, tabId: sender.tab.id });
                    read();
                });
            }

            read();
        } catch (err) {
            chrome.runtime.sendMessage({ action: "aiChunk",
                          chunk: "{\"error\": {\"message\" : \"" + err.message +"\"}}", 
                          tabId: sender.tab.id});
            sendResponse({ success: false, error: err.message });
        }
    })();

    // Keep the message channel open for async sendResponse
    return true;
  }


  // Get Tab ID
  if (request.action === "getTabId") {
        sendResponse({ tabId: sender.tab.id });
    }
});


