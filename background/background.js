
// LISTENER COMMANDS
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getCompletion') {
    fetch('http://100.102.38.119:1235/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen3-14b',
        messages: [{ role: 'user', content: request.prompt }],
        max_tokens: 1024,
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
        error: error.message 
      });
    });
    
    return true; // Keep message channel open for async response
  }

  if (request.action === 'getCompletionOpenAI') {
    const API_KEY = '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';
    fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', 
        messages: [
          { role: 'user', content: request.prompt }
        ],
        max_tokens: 1000
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
        error: error.message 
      });
    });
    
    return true;
  }

  if (request.action === 'chat') {
        fetch('http://localhost:1234/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'qwen3-14b',
                messages: [{ role: 'user', content: request.message }],
                temperature: 0.7
            })
        })
        .then(response => response.json())
        .then(data => {
            sendResponse({ text: data.choices[0].message.content });
        })
        .catch(error => {
            sendResponse({ text: 'Error: ' + error.message });
        });
        
        return true; // Keep the message channel open for async response
    }

    
});


