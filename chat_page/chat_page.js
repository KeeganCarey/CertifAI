// Enhanced chat_page.js with Markdown formatting, smooth UI, typing indicator, and fade-in

const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

let messages = []; // Store chat history
 

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
        messages.push({role: 'assistant', content: text});
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

    showTypingIndicator();

    try {
        const response = await getCompletion("/no-think " + message);

        removeTypingIndicator();
        addMessage(response, false);
    } catch (error) {
        removeTypingIndicator();
        addMessage('Error: ' + error.message, false);
    }
}

async function getCompletion(prompt) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { 
        action: 'getAIResponse', 
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
