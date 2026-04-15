document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('certification-list');
    const statusMsg = document.getElementById('status-message');
    
    // Path to your JSON file
    const JSON_PATH = './certifications/oakland.json';

    // 1. Fetch the Data
    fetch(JSON_PATH)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            statusMsg.style.display = 'none'; // Hide loading message
            renderCertifications(data);
        })
        .catch(error => {
            console.error('Error fetching certifications:', error);
            statusMsg.innerHTML = `
                <div style="color: #c0392b; background: #fadbd8; padding: 15px; border-radius: 8px;">
                    <strong>Error loading data:</strong><br>
                    ${error.message}<br><br>
                    <em>Note: To load local JSON files, you usually need to run a local server 
                    (e.g., python -m http.server) rather than opening the file directly.</em>
                </div>
            `;
        });

    // 2. Render the List
    function renderCertifications(certifications) {
        if (!certifications || certifications.length === 0) {
            listContainer.innerHTML = '<p>No certifications found.</p>';
            return;
        }

        certifications.forEach((cert, index) => {
            const card = document.createElement('div');
            card.className = 'cert-card';
            card.id = `cert-${index}`;

            // Create Requirement List HTML
            const reqListHtml = cert.requirements
                .map(req => `<li>${req}</li>`)
                .join('');

            // Build Card HTML
            card.innerHTML = `
                <div class="card-header">
                    <h2>${cert.name}</h2>
                </div>
                
                <div class="card-body">
                    <p class="summary">${cert.summary}</p>
                    
                    <div class="requirements-box">
                        <h3>Requirements</h3>
                        <ul>${reqListHtml}</ul>
                    </div>
                </div>

                <div class="card-footer">
                    <a href="${cert.url}" target="_blank" class="btn btn-link">
                        Visit Official Website &rarr;
                    </a>
                    <button class="btn btn-select" id="btn-${index}">
                        Select Certification
                    </button>
                </div>
            `;

            // Append to DOM
            listContainer.appendChild(card);

            // Add Click Event for Selection
            const selectBtn = card.querySelector(`#btn-${index}`);
            selectBtn.addEventListener('click', () => handleSelection(index, cert.name));
        });
    }

    // 3. Handle Selection
    function handleSelection(selectedIndex, certName) {
        // Remove 'selected' class from all cards
        const allCards = document.querySelectorAll('.cert-card');
        const allBtns = document.querySelectorAll('.btn-select');
        
        allCards.forEach(card => card.classList.remove('selected'));
        allBtns.forEach(btn => btn.textContent = 'Select Certification');

        // Add 'selected' class to the clicked card
        const selectedCard = document.getElementById(`cert-${selectedIndex}`);
        const selectedBtn = document.getElementById(`btn-${selectedIndex}`);
        
        if (selectedCard) {
            selectedCard.classList.add('selected');
            selectedBtn.textContent = 'Selected ✓';
            
            // Visual feedback
            // In a real app, this is where you would save the selection to a database or local storage
            console.log(`User selected: ${certName}`);
            alert(`You have selected: ${certName}`);
        }
    }
});