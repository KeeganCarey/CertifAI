const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

function addMessage(text, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'assistant'}`;
    messageDiv.textContent = text;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function sendMessage() {
    console.log('Send button clicked');
    const message = userInput.value.trim();
    if (!message) return;
    
    addMessage(message, true);
    userInput.value = '';
    
    try {
        // Send to background script to make the API call
        const response = await getCompletion("/no-think "+message);
        console.log('Received response:', response);
        addMessage(response, false);
    } catch (error) {
        addMessage('Error: ' + error.message, false);
    }
}

async function getCompletion(prompt, pdfData = null) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { 
        action: 'getCompletion', 
        prompt: prompt,
        pdfData: pdfData 
      },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (response.success) {
          resolve(response.content);
        } else {
          reject(new Error(response.error));
        }
      }
    );
  });
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
    console.log(e);
});