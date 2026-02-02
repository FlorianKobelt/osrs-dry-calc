const dropRateInput = document.getElementById('dropRate');
const attemptsInput = document.getElementById('attempts');
const dropsObtainedInput = document.getElementById('dropsObtained');
const dropRateError = document.getElementById('dropRateError');
const attemptsError = document.getElementById('attemptsError');
const dropsError = document.getElementById('dropsError');
const calculateBtn = document.getElementById('calculateBtn');
const resultsDiv = document.getElementById('results');

calculateBtn.addEventListener('click', calculate);

// Allow Enter key to trigger calculation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        calculate();
    }
});

// Calculate binomial probability P(X <= k) using log for numerical stability
function binomialCDF(n, k, p) {
    if (k < 0) return 0;
    if (k >= n) return 1;
    
    let sum = 0;
    let logP = Math.log(p);
    let log1P = Math.log(1 - p);
    
    for (let i = 0; i <= k; i++) {
        // Calculate log(C(n,i) * p^i * (1-p)^(n-i))
        let logProb = logCombination(n, i) + i * logP + (n - i) * log1P;
        sum += Math.exp(logProb);
    }
    
    return Math.min(sum, 1); // Cap at 1 due to floating point
}

// Calculate log of combination C(n, k) using log-gamma approximation
function logCombination(n, k) {
    if (k === 0 || k === n) return 0;
    return logFactorial(n) - logFactorial(k) - logFactorial(n - k);
}

// Log factorial using Stirling's approximation for large numbers
function logFactorial(n) {
    if (n <= 1) return 0;
    if (n < 20) {
        // Direct calculation for small numbers
        let result = 0;
        for (let i = 2; i <= n; i++) {
            result += Math.log(i);
        }
        return result;
    }
    // Stirling's approximation for large numbers
    return n * Math.log(n) - n + 0.5 * Math.log(2 * Math.PI * n);
}

function validate() {
    let isValid = true;
    
    // Clear previous errors
    dropRateInput.classList.remove('error');
    attemptsInput.classList.remove('error');
    dropsObtainedInput.classList.remove('error');
    dropRateError.textContent = '';
    attemptsError.textContent = '';
    dropsError.textContent = '';
    
    const dropRate = parseFloat(dropRateInput.value);
    const attempts = parseFloat(attemptsInput.value);
    const dropsObtained = dropsObtainedInput.value ? parseFloat(dropsObtainedInput.value) : 0;
    
    // Validate drop rate
    if (!dropRateInput.value) {
        dropRateError.textContent = 'Please enter a drop rate';
        dropRateInput.classList.add('error');
        isValid = false;
    } else if (isNaN(dropRate) || dropRate <= 0) {
        dropRateError.textContent = 'Must be a positive number';
        dropRateInput.classList.add('error');
        isValid = false;
    } else if (!Number.isInteger(dropRate)) {
        dropRateError.textContent = 'Must be a whole number';
        dropRateInput.classList.add('error');
        isValid = false;
    }
    
    // Validate attempts
    if (!attemptsInput.value) {
        attemptsError.textContent = 'Please enter number of attempts';
        attemptsInput.classList.add('error');
        isValid = false;
    } else if (isNaN(attempts) || attempts <= 0) {
        attemptsError.textContent = 'Must be a positive number';
        attemptsInput.classList.add('error');
        isValid = false;
    } else if (!Number.isInteger(attempts)) {
        attemptsError.textContent = 'Must be a whole number';
        attemptsInput.classList.add('error');
        isValid = false;
    }
    
    // Validate drops obtained (optional, defaults to 0)
    if (dropsObtainedInput.value) {
        if (isNaN(dropsObtained) || dropsObtained < 0) {
            dropsError.textContent = 'Must be a non-negative number';
            dropsObtainedInput.classList.add('error');
            isValid = false;
        } else if (!Number.isInteger(dropsObtained)) {
            dropsError.textContent = 'Must be a whole number';
            dropsObtainedInput.classList.add('error');
            isValid = false;
        }
    }
    
    return isValid;
}

function calculate() {
    if (!validate()) {
        resultsDiv.classList.remove('visible');
        return;
    }
    
    const dropRate = parseInt(dropRateInput.value);
    const attempts = parseInt(attemptsInput.value);
    const dropsObtained = dropsObtainedInput.value ? parseInt(dropsObtainedInput.value) : 0;
    const p = 1 / dropRate;
    
    // Expected number of drops
    const expectedDrops = attempts / dropRate;
    
    // Calculate probability of getting this many drops or fewer
    const unluckyProbability = binomialCDF(attempts, dropsObtained, p);
    
    // Percentage of players who would be this unlucky or worse
    const unluckyPercent = (unluckyProbability * 100).toFixed(4);
    
    // Percentage of players who would have more drops by now
    const luckierPercent = ((1 - unluckyProbability) * 100).toFixed(2);
    
    // Build result message
    let html = `<h2>Results</h2>`;
    html += `<p>With a <span class="highlight">1/${dropRate}</span> drop rate over <span class="highlight">${attempts.toLocaleString()}</span> attempts`;
    
    if (dropsObtained > 0) {
        html += ` with <span class="highlight">${dropsObtained}</span> drop${dropsObtained > 1 ? 's' : ''} obtained:</p>`;
    } else {
        html += ` with no drops:</p>`;
    }
    
    html += `<p>Expected drops: <span class="highlight">${expectedDrops.toFixed(2)}</span></p>`;
    html += `<p>Only <span class="highlight">${unluckyPercent}%</span> of players would be as unlucky as you.</p>`;
    html += `<p><span class="highlight">${luckierPercent}%</span> of players would have more than ${dropsObtained} drop${dropsObtained !== 1 ? 's' : ''} by now.</p>`;
    
    resultsDiv.innerHTML = html;
    resultsDiv.classList.add('visible');
}
