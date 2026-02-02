const searchInput = document.getElementById('searchAttempts');
const destroyInput = document.getElementById('destroyAttempts');
const searchError = document.getElementById('searchError');
const destroyError = document.getElementById('destroyError');
const calculateBtn = document.getElementById('calculateBtn');
const resultsDiv = document.getElementById('results');

const SEARCH_RATE = 3000;
const DESTROY_RATE = 1500;

calculateBtn.addEventListener('click', calculate);

// Allow Enter key to trigger calculation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        calculate();
    }
});

function validateInput(input, errorSpan) {
    const value = parseFloat(input.value);
    
    input.classList.remove('error');
    errorSpan.textContent = '';
    
    if (!input.value) {
        return 0; // Empty is treated as 0 attempts
    } else if (isNaN(value) || value < 0) {
        errorSpan.textContent = 'Must be a non-negative number';
        input.classList.add('error');
        return null;
    } else if (!Number.isInteger(value)) {
        errorSpan.textContent = 'Must be a whole number';
        input.classList.add('error');
        return null;
    }
    
    return value;
}

function validate() {
    const searchAttempts = validateInput(searchInput, searchError);
    const destroyAttempts = validateInput(destroyInput, destroyError);
    
    // Check if both are valid (not null)
    if (searchAttempts === null || destroyAttempts === null) {
        return null;
    }
    
    // At least one must have attempts
    if (searchAttempts === 0 && destroyAttempts === 0) {
        searchError.textContent = 'Enter at least one attempt';
        searchInput.classList.add('error');
        return null;
    }
    
    return { searchAttempts, destroyAttempts };
}

function calculate() {
    const result = validate();
    
    if (!result) {
        resultsDiv.classList.remove('visible');
        return;
    }
    
    const { searchAttempts, destroyAttempts } = result;
    
    // Probability of NOT getting the drop for each method
    const searchDry = searchAttempts > 0 ? Math.pow(1 - (1 / SEARCH_RATE), searchAttempts) : 1;
    const destroyDry = destroyAttempts > 0 ? Math.pow(1 - (1 / DESTROY_RATE), destroyAttempts) : 1;
    
    // Combined probability of going dry on both
    const combinedDry = searchDry * destroyDry;
    
    // Percentages
    const dryPercent = (combinedDry * 100).toFixed(4);
    const luckyPercent = ((1 - combinedDry) * 100).toFixed(2);
    
    const totalAttempts = searchAttempts + destroyAttempts;
    
    // Build results HTML
    let html = `<h2>Results</h2>`;
    html += `<p>With <span class="highlight">${searchAttempts.toLocaleString()}</span> searches and <span class="highlight">${destroyAttempts.toLocaleString()}</span> destroys (<span class="highlight">${totalAttempts.toLocaleString()}</span> total):</p>`;
    html += `<p>Only <span class="highlight">${dryPercent}%</span> of players would be as unlucky as you.</p>`;
    html += `<p><span class="highlight">${luckyPercent}%</span> of players would have received the Araxxor Pet by now.</p>`;
    
    resultsDiv.innerHTML = html;
    resultsDiv.classList.add('visible');
}
