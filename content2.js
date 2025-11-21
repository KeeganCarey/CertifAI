const textboxes = document.querySelectorAll('input[type="text"], textarea');


textboxes.forEach(textbox => {
  console.log(textbox.value); // Access the value of each textbox
  
     textbox.style.backgroundColor = 'lightblue';
     textbox.value = "Business Information"

  if (textbox.id) {
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (label) console.log(label.textContent.trim());
  }
});