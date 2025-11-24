// Enhanced chat_page.js with Markdown formatting, smooth UI, typing indicator, and fade-in

const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

let messages = []; // Store chat history
let tabId = null;
chrome.runtime.sendMessage({ action: "getTabId" }, (response) => {
      tabId = response.tabId;
});

// Adds messages with smooth fade animation + Markdown render for assistant
function addMessage(text, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'assistant'}`;
    messageDiv.style.opacity = 0;

    if (isUser) {
        // User messages are plain text
        messageDiv.textContent = text;
        messages.push({role: 'user', content: text});
    } else {
        // Render assistant messages with Markdown → sanitized HTML
        const html = DOMPurify.sanitize(marked.parse(text));
        messageDiv.innerHTML = html;
        // messages.push({role: 'assistant', content: text}); // Handled in streaming
    }

    // Limit message history to last 20 messages
    if (messages.length > 20) {
        messages = messages.slice(-20);
    }

    chatContainer.appendChild(messageDiv);

    // Fade-in effect
    setTimeout(() => {
        messageDiv.style.transition = "opacity 0.3s ease";
        messageDiv.style.opacity = 1;
    }, 10);

    // Auto-scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Creates a temporary typing indicator
function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'message assistant';
    indicator.id = 'typing-indicator';
    indicator.textContent = 'AI is typing…';
    indicator.style.opacity = 0.6;

    chatContainer.appendChild(indicator);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, true);
    userInput.value = '';

    // showTypingIndicator();

    try {
      addMessage("", false);
      const response = await getCompletion("/no-think " + message);

        // removeTypingIndicator();
        
    } catch (error) {
        removeTypingIndicator();
        addMessage('Error: ' + error.message, false);
    }
}

async function getCompletion(prompt) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { 
        action: 'getStreamedAIResponse', 
        messages: messages,
        max_tokens: 1028
      },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(response.content)
        // if (response.success) {
        //   resolve(response.content);
        // } else {
        //   reject(new Error(response.error));
        // }
      }
    );
  });
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});



// Listen for streamed AI response chunks
let jsonBuffer = "";
let messageBuffer = "";
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "aiChunk") {

      // console.log("target tabId:", msg.tabId, "this tabId:", tabId);
      if (msg.tabId !== tabId) return; // Ignore chunks not for this tab

      let isDone = false;
      let lastMsg = chatContainer.querySelector('.message.assistant:last-child');
      if (!lastMsg) {
          return;
      }

      // display error message to end user
      if (msg.error) {
        lastMsg.innerHTML = DOMPurify.sanitize(marked.parse(msg.error));
        
        chatContainer.scrollTop = chatContainer.scrollHeight;
        // messages.push({role: 'assistant', content: msg.error});
        messageBuffer = "";
        jsonBuffer = "";
        return
      }

      

      let chunkStr = jsonBuffer + msg.chunk;
      jsonBuffer = "";

      if (!chunkStr) return;
      // console.log("Received chunk:", chunkStr);

      // split the chunks by the "data:" header
      chunks = chunkStr.split(("data:"))

      chunkStr = "";
      chunks.forEach(chunk => {
        // console.log("Processing sub-chunk:", chunk);

        // Message is DONE
        if (chunk.trim() == '[DONE]') {
          isDone = true;
          console.log("Message complete.");
          return;
        }

        // Parse JSON chunk
        if (!(chunk.trim() === "")) {
          try {
            const chunkJson = JSON.parse(chunk.trim());
            chunkStr += chunkJson.choices[0].delta?.content || "";
            chunkStr += chunkJson.choices[0].delta?.reasoning_content || ""; // for thinking models

          } catch (err) {

            if (err instanceof SyntaxError) {
                // console.log("Incomplete chunk, buffering:", chunk.trim()); //buffer incomplete chunk
                jsonBuffer = chunk;
                return
            } else {
              console.error("Failed to parse chunk:", err, chunk.trim());
            }

          }
        }
          
        });

        // Update message
        // console.log("Appending chunk to message:", chunkStr);
        messageBuffer += chunkStr;
        lastMsg.innerHTML = DOMPurify.sanitize(marked.parse(messageBuffer));
        
        chatContainer.scrollTop = chatContainer.scrollHeight;

        // clean up finalized message
        if (isDone) {
          messages.push({role: 'assistant', content: messageBuffer});
          messageBuffer = "";
          jsonBuffer = "";
        }
    }
});

