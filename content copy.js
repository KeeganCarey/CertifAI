// Function to get label for an input
function getLabelForInput(input) {
  console.log("1")
  // Method 1: Check if input has an ID and find label with matching 'for' attribute
  if (input.id) {
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (label) return label.textContent.trim();
  }
  
  console.log("2")
  // Method 2: Check if input is inside a label
  const parentLabel = input.closest('label');
  if (parentLabel) {
    // Get only the label's direct text, not including the input's value
    return Array.from(parentLabel.childNodes)
      .filter(node => node.nodeType === Node.TEXT_NODE)
      .map(node => node.textContent.trim())
      .join(' ');
  }
  console.log("3")
  // Method 3: Check for aria-label attribute
  if (input.getAttribute('aria-label')) {
    return input.getAttribute('aria-label');
  }

  console.log("4")
  // Method 4: Check for placeholder
  if (input.placeholder) {
    return input.placeholder;
  }
  
  console.log("5")
  // Method 5: Check for name attribute
  if (input.name) {
    return input.name;
  }
  
  return 'No label found';
}

// Function to check if input is a text-entry field
function isTextInput(input) {
  // For textarea, always include
  if (input.tagName === 'TEXTAREA') return true;
  
  // For inputs, only include text-entry types
  const textTypes = ['text', 'email', 'password', 'search', 'tel', 'url', 'number', 'date', 'time', 'datetime-local', 'month', 'week'];
  const type = input.type || 'text';
  
  return textTypes.includes(type) && input.offsetParent !== null; // Also check if visible
}

// Function to collect all labels (only for text inputs)
function collectInputLabels() {
  const allInputs = document.querySelectorAll('input, textarea');
  const textInputs = Array.from(allInputs).filter(isTextInput);
  const labels = [];
  
  console.log(`Found ${textInputs.length} text input fields`);
  
  textInputs.forEach((input, index) => {
    const label = getLabelForInput(input);
    if (label && label !== 'No label found') {
      labels.push(label);
      console.log(`Input ${index + 1}: ${label}`);
    }
  });
  
  console.log('\n=== All Labels ===');
  console.log(labels);
  
  return labels;
}

// Initial collection
const allLabels = collectInputLabels();

