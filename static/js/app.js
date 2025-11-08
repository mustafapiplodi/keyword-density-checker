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

    // Phase 2: Display visualizations
    displayVisualization(results);

    // Phase 2: Display meta tag analysis (if available)
    if (results.meta_analysis) {
        displayMetaAnalysis(results.meta_analysis);
    }

    // Phase 2: Display prominence scores (if available)
    if (results.prominence_scores) {
        displayProminenceScores(results.prominence_scores);
    }
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

/**
 * Phase 2: Display visualizations with Chart.js
 */
function displayVisualization(results) {
    const visualizationsSection = document.getElementById('visualizations-section');

    // Show section
    visualizationsSection.classList.remove('hidden');

    // Get top 15 keywords for chart
    const topKeywords = results.single_words.slice(0, 15);

    // Destroy existing chart if it exists
    const canvas = document.getElementById('keyword-chart');
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
        existingChart.destroy();
    }

    // Create new chart
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topKeywords.map(item => item.term),
            datasets: [{
                label: 'Keyword Frequency',
                data: topKeywords.map(item => item.count),
                backgroundColor: topKeywords.map(item => {
                    switch(item.status) {
                        case 'critical': return 'rgba(239, 68, 68, 0.7)';
                        case 'warning': return 'rgba(245, 158, 11, 0.7)';
                        case 'caution': return 'rgba(251, 191, 36, 0.7)';
                        default: return 'rgba(16, 185, 129, 0.7)';
                    }
                }),
                borderColor: topKeywords.map(item => {
                    switch(item.status) {
                        case 'critical': return 'rgb(239, 68, 68)';
                        case 'warning': return 'rgb(245, 158, 11)';
                        case 'caution': return 'rgb(251, 191, 36)';
                        default: return 'rgb(16, 185, 129)';
                    }
                }),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Top 15 Keywords by Frequency'
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            const item = topKeywords[context.dataIndex];
                            return `Density: ${item.density}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Frequency'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Keywords'
                    }
                }
            }
        }
    });
}

/**
 * Phase 2: Display meta tag analysis
 */
function displayMetaAnalysis(metaAnalysis) {
    const metaSection = document.getElementById('meta-analysis-section');
    const metaContent = document.getElementById('meta-analysis-content');

    if (!metaAnalysis) return;

    metaSection.classList.remove('hidden');

    let html = '<div class="meta-tag-grid">';

    // Title Tag
    html += `<div class="meta-tag-card">
        <h4>Title Tag</h4>
        <p><strong>Content:</strong> ${metaAnalysis.title.text || '(Missing)'}</p>
        <ul class="meta-tag-list">`;

    metaAnalysis.title.present.forEach(kw => {
        html += `<li class="meta-present">${kw}</li>`;
    });
    metaAnalysis.title.missing.forEach(kw => {
        html += `<li class="meta-missing">${kw}</li>`;
    });
    html += `</ul></div>`;

    // Meta Description
    html += `<div class="meta-tag-card">
        <h4>Meta Description</h4>
        <p><strong>Content:</strong> ${metaAnalysis.meta_description.text || '(Missing)'}</p>
        <ul class="meta-tag-list">`;

    metaAnalysis.meta_description.present.forEach(kw => {
        html += `<li class="meta-present">${kw}</li>`;
    });
    metaAnalysis.meta_description.missing.forEach(kw => {
        html += `<li class="meta-missing">${kw}</li>`;
    });
    html += `</ul></div>`;

    // H1 Tags
    html += `<div class="meta-tag-card">
        <h4>H1 Tags (${metaAnalysis.h1.count})</h4>
        <ul class="meta-tag-list">`;

    metaAnalysis.h1.present.forEach(kw => {
        html += `<li class="meta-present">${kw}</li>`;
    });
    metaAnalysis.h1.missing.forEach(kw => {
        html += `<li class="meta-missing">${kw}</li>`;
    });
    html += `</ul></div>`;

    // H2 Tags
    html += `<div class="meta-tag-card">
        <h4>H2 Tags (${metaAnalysis.h2.count})</h4>
        <ul class="meta-tag-list">`;

    metaAnalysis.h2.present.forEach(kw => {
        html += `<li class="meta-present">${kw}</li>`;
    });
    metaAnalysis.h2.missing.forEach(kw => {
        html += `<li class="meta-missing">${kw}</li>`;
    });
    html += `</ul></div>`;

    html += '</div>';

    // Add recommendations if any
    if (metaAnalysis.recommendations && metaAnalysis.recommendations.length > 0) {
        html += '<h3 style="margin-top: 1.5rem;">Meta Tag Recommendations</h3>';
        metaAnalysis.recommendations.forEach(rec => {
            const className = rec.type === 'critical' ? 'recommendation-item critical' : 'recommendation-item warning';
            html += `<div class="${className}">
                <div class="rec-header ${rec.type}">${rec.issue}</div>
                <div class="rec-detail"><strong>Action:</strong> ${rec.action}</div>
            </div>`;
        });
    }

    metaContent.innerHTML = html;
}

/**
 * Phase 2: Display prominence scores
 */
function displayProminenceScores(prominenceScores) {
    const prominenceSection = document.getElementById('prominence-section');
    const prominenceContent = document.getElementById('prominence-content');

    if (!prominenceScores || prominenceScores.length === 0) return;

    prominenceSection.classList.remove('hidden');

    let html = '<div class="prominence-grid">';

    prominenceScores.forEach(score => {
        const ratingClass = score.rating.toLowerCase().replace(' ', '-');

        html += `<div class="prominence-card">
            <div class="prominence-keyword">"${score.keyword}"</div>
            <div class="prominence-score">${score.total_score}</div>
            <span class="prominence-rating ${ratingClass}">${score.rating}</span>

            <div class="prominence-breakdown">
                <div class="breakdown-item">
                    <span>Title Tag (10x)</span>
                    <span>${score.breakdown.title.count} × 10 = ${score.breakdown.title.score}</span>
                </div>
                <div class="breakdown-item">
                    <span>H1 (8x)</span>
                    <span>${score.breakdown.h1.count} × 8 = ${score.breakdown.h1.score}</span>
                </div>
                <div class="breakdown-item">
                    <span>First 100 Words (7x)</span>
                    <span>${score.breakdown.first_100_words.count} × 7 = ${score.breakdown.first_100_words.score}</span>
                </div>
                <div class="breakdown-item">
                    <span>H2/H3 (6x)</span>
                    <span>${score.breakdown.h2_h3.count} × 6 = ${score.breakdown.h2_h3.score}</span>
                </div>
                <div class="breakdown-item">
                    <span>URL (5x)</span>
                    <span>${score.breakdown.url.count} × 5 = ${score.breakdown.url.score}</span>
                </div>
                <div class="breakdown-item">
                    <span>Meta Description (4x)</span>
                    <span>${score.breakdown.meta_description.count} × 4 = ${score.breakdown.meta_description.score}</span>
                </div>
                <div class="breakdown-item">
                    <span>Body (1x)</span>
                    <span>${score.breakdown.body.count} × 1 = ${score.breakdown.body.score}</span>
                </div>
            </div>
        </div>`;
    });

    html += '</div>';
    prominenceContent.innerHTML = html;
}

// Phase 2: Competitor comparison tab switching
document.querySelectorAll('.comp-tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.comp-tab-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const tabName = button.getAttribute('data-tab');
        document.querySelectorAll('.comp-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-content`).classList.add('active');
    });
});

// Phase 2: Competitor comparison handler
const compareBtn = document.getElementById('compare-btn');
const competitorUrlInput = document.getElementById('competitor-url');
const competitorLoading = document.getElementById('competitor-loading');
const competitorError = document.getElementById('competitor-error');
const competitorResults = document.getElementById('competitor-results');

compareBtn.addEventListener('click', async () => {
    const competitorUrl = competitorUrlInput.value.trim();

    if (!competitorUrl) {
        showCompetitorError('Please enter a competitor URL');
        return;
    }

    if (!isValidUrl(competitorUrl)) {
        showCompetitorError('Please enter a valid URL');
        return;
    }

    if (!currentResults) {
        showCompetitorError('Please analyze your content first');
        return;
    }

    // Show loading
    competitorLoading.classList.remove('hidden');
    competitorError.classList.add('hidden');
    competitorResults.classList.add('hidden');
    compareBtn.disabled = true;

    try {
        const response = await fetch('/api/compare-competitor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                your_content: currentSourceType === 'url' ? urlInput.value : textInput.value,
                competitor_url: competitorUrl,
                source_type: currentSourceType
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Comparison failed');
        }

        displayCompetitorComparison(data.comparison);
        competitorResults.classList.remove('hidden');

    } catch (error) {
        showCompetitorError(error.message);
    } finally {
        competitorLoading.classList.add('hidden');
        compareBtn.disabled = false;
    }
});

function displayCompetitorComparison(comparison) {
    // Display stats
    const yourStatsEl = document.getElementById('your-stats');
    const competitorStatsEl = document.getElementById('competitor-stats');

    yourStatsEl.innerHTML = `
        <div class="stat-item">
            <span>Total Words:</span>
            <strong>${comparison.your_stats.total_words.toLocaleString()}</strong>
        </div>
        <div class="stat-item">
            <span>Unique Keywords:</span>
            <strong>${comparison.your_stats.unique_words.toLocaleString()}</strong>
        </div>
        ${comparison.your_stats.top_keyword ? `
        <div class="stat-item">
            <span>Top Keyword:</span>
            <strong>${comparison.your_stats.top_keyword.term} (${comparison.your_stats.top_keyword.density}%)</strong>
        </div>
        ` : ''}
    `;

    competitorStatsEl.innerHTML = `
        <div class="stat-item">
            <span>Total Words:</span>
            <strong>${comparison.competitor_stats.total_words.toLocaleString()}</strong>
        </div>
        <div class="stat-item">
            <span>Unique Keywords:</span>
            <strong>${comparison.competitor_stats.unique_words.toLocaleString()}</strong>
        </div>
        ${comparison.competitor_stats.top_keyword ? `
        <div class="stat-item">
            <span>Top Keyword:</span>
            <strong>${comparison.competitor_stats.top_keyword.term} (${comparison.competitor_stats.top_keyword.density}%)</strong>
        </div>
        ` : ''}
    `;

    // Display keyword gaps
    const gapsContent = document.getElementById('gaps-content');
    if (comparison.keyword_gaps && comparison.keyword_gaps.length > 0) {
        gapsContent.innerHTML = comparison.keyword_gaps.map(gap => `
            <div class="keyword-gap-item">
                <div class="gap-keyword">${gap.keyword}</div>
                <div class="gap-stats">
                    <span>Competitor: ${gap.competitor_count} times (${gap.competitor_density}%)</span>
                    <span>You: ${gap.your_count} times</span>
                </div>
                <div class="gap-recommendation">${gap.recommendation}</div>
            </div>
        `).join('');
    } else {
        gapsContent.innerHTML = '<p>No significant keyword gaps found!</p>';
    }

    // Display opportunities
    const opportunitiesContent = document.getElementById('opportunities-content');
    if (comparison.opportunities && comparison.opportunities.length > 0) {
        opportunitiesContent.innerHTML = comparison.opportunities.map(opp => `
            <div class="opportunity-item">
                <div class="gap-keyword">${opp.keyword}</div>
                <div class="gap-stats">
                    <span>Your density: ${opp.your_density}%</span>
                    <span>Competitor density: ${opp.competitor_density}%</span>
                </div>
                <div class="gap-recommendation">${opp.recommendation}</div>
            </div>
        `).join('');
    } else {
        opportunitiesContent.innerHTML = '<p>No optimization opportunities found!</p>';
    }

    // Display advantages
    const advantagesContent = document.getElementById('advantages-content');
    if (comparison.advantages && comparison.advantages.length > 0) {
        advantagesContent.innerHTML = comparison.advantages.map(adv => `
            <div class="advantage-item">
                <div class="gap-keyword">${adv.keyword}</div>
                <div class="gap-stats">
                    <span>Your density: ${adv.your_density}%</span>
                    <span>Competitor density: ${adv.competitor_density}%</span>
                </div>
                <div class="gap-recommendation">${adv.note}</div>
            </div>
        `).join('');
    } else {
        advantagesContent.innerHTML = '<p>No clear advantages identified.</p>';
    }
}

function showCompetitorError(message) {
    competitorError.textContent = message;
    competitorError.classList.remove('hidden');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Keyword Density Checker Phase 2 initialized');
});
