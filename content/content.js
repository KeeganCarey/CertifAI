let pdfjsLib;
let extractTextFromPDF;

// Initialize PDF.js
(async () => {
  pdfjsLib = await import(chrome.runtime.getURL('lib/pdf.mjs'));
  pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('lib/pdf.worker.mjs');
  
  extractTextFromPDF = async function(pdfData) {
    if (!pdfData) {  // Changed from pdfDataBase64
      throw new Error('No PDF data provided');
    }
    
    // Convert base64 to Uint8Array
    const binaryString = atob(pdfData);  // Changed from pdfDataBase64
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    console.log('PDF bytes length:', bytes.length);
    
    const pdf = await pdfjsLib.getDocument({data: bytes}).promise;
    let fullText = '';
    
    console.log('PDF pages:', pdf.numPages);
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    console.log('Extracted text length:', fullText.length);
    
    return fullText;
  };
})();

async function getCompletion(prompt, pdfData = null) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { 
        action: 'getCompletionOpenAI', 
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

async function fillFormFields(pdfData = null) {
  const textboxes = document.querySelectorAll('input[type="text"], textarea');

  for (const textbox of textboxes) {
    console.log(textbox.value);
    textbox.style.backgroundColor = 'lightblue';

    if (textbox.id) {
      const label = document.querySelector(`label[for="${textbox.id}"]`);
      if (label) {
        console.log(label.textContent.trim());
        
        try {
          let prompt = "/no-think You are filling out a government form for a small business." +
          "Using information from a business pdf, fill out the " +
            label.textContent.trim() + " to put inside of the form. RESPOND WITH ONLY THE ANSWER. " +
            "\nPDF: \n" + await extractTextFromPDF(pdfData);
          
          console.log("Prompt: \n" + prompt)
          const completion = await getCompletion(prompt);
          textbox.value = completion;
          textbox.style.backgroundColor = 'lightgreen';
        } catch (error) {
          console.error('Error filling field:', error);
          textbox.style.backgroundColor = 'lightcoral';
        }
      }
    }
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fillForm') {
    fillFormFields(request.pdfData);
    sendResponse({ success: true });
  }
});