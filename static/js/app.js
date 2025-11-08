/**
 * Keyword Density Checker - Frontend Application
 * Handles user interactions, API calls, and dynamic UI updates
 */

// Global state
let currentResults = null;
let currentSourceType = 'text';

// DOM Elements
const textTab = document.getElementById('text-tab');
const urlTab = document.getElementById('url-tab');
const textInput = document.getElementById('text-input');
const urlInput = document.getElementById('url-input');
const analyzeBtn = document.getElementById('analyze-btn');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');
const resultsContainer = document.getElementById('results-container');
const exportCsvBtn = document.getElementById('export-csv-btn');
const removeStopwordsCheckbox = document.getElementById('remove-stopwords');
const useLemmatizationCheckbox = document.getElementById('use-lemmatization');

// Tab switching functionality
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        // Update active state
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Show corresponding tab content
        const tabName = button.getAttribute('data-tab');
        currentSourceType = tabName;

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    });
});

// Result tab switching
document.querySelectorAll('.result-tab-button').forEach(button => {
    button.addEventListener('click', () => {
        // Update active state
        document.querySelectorAll('.result-tab-button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Show corresponding result content
        const tabName = button.getAttribute('data-tab');
        document.querySelectorAll('.result-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-results`).classList.add('active');
    });
});

// Analyze button click handler
analyzeBtn.addEventListener('click', async () => {
    // Clear previous errors
    hideError();

    // Get content based on source type
    let content = '';
    if (currentSourceType === 'text') {
        content = textInput.value.trim();
        if (!content) {
            showError('Please enter some text to analyze');
            return;
        }
    } else {
        content = urlInput.value.trim();
        if (!content) {
            showError('Please enter a URL to analyze');
            return;
        }
        // Basic URL validation
        if (!isValidUrl(content)) {
            showError('Please enter a valid URL (e.g., https://example.com)');
            return;
        }
    }

    // Get options
    const removeStopwords = removeStopwordsCheckbox.checked;
    const useLemmatization = useLemmatizationCheckbox.checked;

    // Show loading state
    showLoading();
    hideResults();

    try {
        // Make API call
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                source_type: currentSourceType,
                content: content,
                remove_stopwords: removeStopwords,
                use_lemmatization: useLemmatization
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Analysis failed');
        }

        // Store results
        currentResults = data.results;

        // Display results
        displayResults(data.results);
        showResults();

    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
});

// Export CSV button handler
exportCsvBtn.addEventListener('click', () => {
    if (!currentResults) {
        showError('No results to export');
        return;
    }

    // Generate CSV content
    let csvContent = 'Keyword/Phrase,Type,Count,Density %,Status\n';

    // Add single words
    currentResults.single_words.forEach(item => {
        csvContent += `"${item.term}",1-word,${item.count},${item.density},${item.status}\n`;
    });

    // Add 2-word phrases
    currentResults.two_word_phrases.forEach(item => {
        csvContent += `"${item.term}",2-word,${item.count},${item.density},${item.status}\n`;
    });

    // Add 3-word phrases
    currentResults.three_word_phrases.forEach(item => {
        csvContent += `"${item.term}",3-word,${item.count},${item.density},${item.status}\n`;
    });

    // Add 4-word phrases
    currentResults.four_word_phrases.forEach(item => {
        csvContent += `"${item.term}",4-word,${item.count},${item.density},${item.status}\n`;
    });

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'keyword-density-analysis.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
});

/**
 * Display analysis results in the UI
 */
function displayResults(results) {
    // Update summary dashboard
    document.getElementById('total-words').textContent = results.total_words.toLocaleString();
    document.getElementById('unique-words').textContent = results.unique_words.toLocaleString();

    if (results.single_words && results.single_words.length > 0) {
        const topKeyword = results.single_words[0];
        document.getElementById('top-keyword').textContent = topKeyword.term;
        document.getElementById('top-density').textContent = topKeyword.density + '%';
    }

    // Update recommendation counts
    const recommendations = results.recommendations;
    document.getElementById('critical-count').textContent = recommendations.critical.length;
    document.getElementById('warnings-count').textContent = recommendations.warnings.length;
    document.getElementById('opportunities-count').textContent = recommendations.opportunities.length;

    // Display recommendations
    displayRecommendations(recommendations);

    // Populate result tables
    populateTable('1-word-tbody', results.single_words);
    populateTable('2-word-tbody', results.two_word_phrases);
    populateTable('3-word-tbody', results.three_word_phrases);
    populateTable('4-word-tbody', results.four_word_phrases);
}

/**
 * Display recommendations with color coding
 */
function displayRecommendations(recommendations) {
    const criticalContainer = document.getElementById('critical-recommendations');
    const warningContainer = document.getElementById('warning-recommendations');
    const opportunityContainer = document.getElementById('opportunity-recommendations');

    // Clear previous recommendations
    criticalContainer.innerHTML = '';
    warningContainer.innerHTML = '';
    opportunityContainer.innerHTML = '';

    // Display critical issues
    if (recommendations.critical.length > 0) {
        criticalContainer.innerHTML = '<h3 style="color: #991b1b; margin-bottom: 1rem;">❌ Critical Issues</h3>';
        recommendations.critical.forEach(rec => {
            const item = createRecommendationItem(rec, 'critical');
            criticalContainer.appendChild(item);
        });
    }

    // Display warnings
    if (recommendations.warnings.length > 0) {
        warningContainer.innerHTML = '<h3 style="color: #92400e; margin-bottom: 1rem;">⚠️ Warnings</h3>';
        recommendations.warnings.forEach(rec => {
            const item = createRecommendationItem(rec, 'warning');
            warningContainer.appendChild(item);
        });
    }

    // Display opportunities
    if (recommendations.opportunities.length > 0) {
        opportunityContainer.innerHTML = '<h3 style="color: #065f46; margin-bottom: 1rem;">✓ Opportunities</h3>';
        recommendations.opportunities.forEach(rec => {
            const item = createRecommendationItem(rec, 'optimal');
            opportunityContainer.appendChild(item);
        });
    }
}

/**
 * Create a recommendation item element
 */
function createRecommendationItem(rec, type) {
    const div = document.createElement('div');
    div.className = `recommendation-item ${type}`;

    const header = document.createElement('div');
    header.className = `rec-header ${type}`;
    header.textContent = `"${rec.keyword}"`;
    div.appendChild(header);

    if (rec.issue) {
        const issue = document.createElement('div');
        issue.className = 'rec-detail';
        issue.innerHTML = `<strong>${rec.issue}</strong>`;
        div.appendChild(issue);
    }

    if (rec.status) {
        const status = document.createElement('div');
        status.className = 'rec-detail';
        status.innerHTML = `<strong>${rec.status}</strong>`;
        div.appendChild(status);
    }

    const current = document.createElement('div');
    current.className = 'rec-detail';
    current.textContent = `Current: ${rec.current}`;
    div.appendChild(current);

    if (rec.action) {
        const action = document.createElement('div');
        action.className = 'rec-detail';
        action.innerHTML = `<strong>Action:</strong> ${rec.action}`;
        div.appendChild(action);
    }

    if (rec.suggestion) {
        const suggestion = document.createElement('div');
        suggestion.className = 'rec-detail';
        suggestion.innerHTML = `<strong>Suggestion:</strong> ${rec.suggestion}`;
        div.appendChild(suggestion);
    }

    if (rec.tip) {
        const tip = document.createElement('div');
        tip.className = 'rec-tip';
        tip.textContent = `💡 Tip: ${rec.tip}`;
        div.appendChild(tip);
    }

    return div;
}

/**
 * Populate a results table with data
 */
function populateTable(tbodyId, data) {
    const tbody = document.getElementById(tbodyId);
    tbody.innerHTML = '';

    if (!data || data.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="4" style="text-align: center; color: #6b7280;">No results found</td>';
        tbody.appendChild(tr);
        return;
    }

    data.forEach(item => {
        const tr = document.createElement('tr');

        // Term
        const termTd = document.createElement('td');
        termTd.textContent = item.term;
        tr.appendChild(termTd);

        // Count
        const countTd = document.createElement('td');
        countTd.textContent = item.count;
        tr.appendChild(countTd);

        // Density
        const densityTd = document.createElement('td');
        densityTd.textContent = item.density + '%';
        tr.appendChild(densityTd);

        // Status
        const statusTd = document.createElement('td');
        const badge = document.createElement('span');
        badge.className = `status-badge ${item.status}`;
        badge.textContent = item.status;
        statusTd.appendChild(badge);
        tr.appendChild(statusTd);

        tbody.appendChild(tr);
    });
}

/**
 * UI Helper Functions
 */
function showLoading() {
    loading.classList.remove('hidden');
    analyzeBtn.disabled = true;
}

function hideLoading() {
    loading.classList.add('hidden');
    analyzeBtn.disabled = false;
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
}

function showResults() {
    resultsContainer.classList.remove('hidden');
    // Scroll to results
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function hideResults() {
    resultsContainer.classList.add('hidden');
}

/**
 * Validate URL format
 */
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Keyword Density Checker initialized');
});
