let pdfText = null;

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fillButton = document.getElementById('fillButton');
const status = document.getElementById('status');

// Click upload area to trigger file input
uploadArea.addEventListener('click', () => {
  fileInput.click();
});

// Handle file selection
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
    // Convert PDF to base64
    const base64 = await fileToBase64(file);
    pdfText = base64;
    
    uploadArea.innerHTML = `<p>${file.name}</p><p style="font-size: 12px;">Click to change</p>`;
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
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Send message to content script with PDF data
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

// Convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Extract base64 data (remove data:application/pdf;base64, prefix)
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}