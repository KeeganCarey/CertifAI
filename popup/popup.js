let pdfText = null;

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fillButton = document.getElementById('fillButton');

const modelSelect = document.getElementById("modelSelect");
const openaiSettings = document.getElementById("openaiSettings");
const lmstudioSettings = document.getElementById("lmstudioSettings");
const openaiKeyInput = document.getElementById("openaiKey");
const lmPortInput = document.getElementById("lmPort");

/* -----------------------------
   LOAD SAVED MODEL SETTINGS
--------------------------------*/
chrome.storage.local.get(
  ["ai_provider", "openai_key", "lmstudio_port"],
  (data) => {

    if (data.ai_provider) modelSelect.value = data.ai_provider;
    if (data.openai_key) openaiKeyInput.value = data.openai_key;
    if (data.lmstudio_port) lmPortInput.value = data.lmstudio_port;

    updateModelVisibility();
  }
);

/* -----------------------------
   SAVE MODEL SETTINGS ON CHANGE
--------------------------------*/
modelSelect.addEventListener("change", () => {
  chrome.storage.local.set({ ai_provider: modelSelect.value });
  updateModelVisibility();
});

openaiKeyInput.addEventListener("input", () => {
  chrome.storage.local.set({ openai_key: openaiKeyInput.value });
});

lmPortInput.addEventListener("input", () => {
  chrome.storage.local.set({ lmstudio_port: lmPortInput.value });
});

/* -----------------------------
   SHOW / HIDE INPUTS
--------------------------------*/
function updateModelVisibility() {
  const provider = modelSelect.value;

  openaiSettings.classList.add("hidden");
  lmstudioSettings.classList.add("hidden");

  if (provider === "openai") openaiSettings.classList.remove("hidden");
  if (provider === "lmstudio") lmstudioSettings.classList.remove("hidden");
}

/* --------------------------------
   PDF UPLOAD + FORM FILL LOGIC
---------------------------------*/

// Click upload area to trigger input
uploadArea.addEventListener('click', () => {
  fileInput.click();
});

//TODO THIS IS TESTING DONT FORGEET THISSSSSSSSSSSS HWEGUIGHWIPGHWIPGWHIPG
// Open chat button
document.getElementById('openChatButton').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('chat_page/chat_page.html') });
  chrome.tabs.create({ url: chrome.runtime.getURL('certification_explorer/certification_explorer.html') });
});

// Process PDF selection
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.type !== 'application/pdf') {
    status.textContent = 'Please select a PDF file';
    status.className = 'error';
    return;
  }

  status.textContent = 'Reading PDF...';
  status.className = '';

  try {
    const base64 = await fileToBase64(file);
    pdfText = base64;

    uploadArea.innerHTML = `
      <p>${file.name}</p>
      <p style="font-size: 12px;">Click to change</p>
    `;

    status.textContent = 'PDF loaded successfully!';
    status.className = 'success';

  } catch (error) {
    console.error('Error reading PDF:', error);
    status.textContent = 'Error reading PDF';
    status.className = 'error';
  }
});

// Fill form button
fillButton.addEventListener('click', async () => {
  fillButton.disabled = true;
  status.textContent = 'Filling form...';
  status.className = '';

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.sendMessage(tab.id, {
      action: 'fillForm',
      pdfData: pdfText
    }, (response) => {

      if (chrome.runtime.lastError) {
        status.textContent = 'Error: ' + chrome.runtime.lastError.message;
        status.className = 'error';
      } else {
        status.textContent = 'Form filled successfully!';
        status.className = 'success';
      }

      fillButton.disabled = false;
    });

  } catch (error) {
    console.error('Error:', error);
    status.textContent = 'Error filling form';
    status.className = 'error';
    fillButton.disabled = false;
  }
});

// Utility: file → base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
