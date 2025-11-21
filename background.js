
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
    fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // or 'gpt-4o', 'gpt-3.5-turbo', etc.
        messages: [
          { role: 'user', content: prompt }
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
});


