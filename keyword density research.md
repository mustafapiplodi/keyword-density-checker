# Building a Modern Keyword Density Checker: Complete Development Specification

**The keyword density metric has evolved from a primary ranking signal to one component of comprehensive content optimization.** Modern search algorithms like BERT and MUM prioritize semantic understanding over mechanical keyword counting, yet strategic keyword usage remains essential for signaling topical relevance. This specification provides everything needed to build a keyword density checker that aligns with 2024-2025 SEO best practices while incorporating advanced features like TF-IDF analysis, semantic keyword suggestions, and competitive intelligence.

## Current state of keyword density in SEO

**Keyword density is no longer a direct ranking factor, but natural keyword usage within a 0.5-2% range remains important for topic relevance signals.** Google's John Mueller stated definitively in 2024: "Keyword density is not a ranking factor. Never has been." However, industry research shows that strategic keyword placement and comprehensive topic coverage strongly correlate with higher rankings. The shift from "keyword optimization" to "topic optimization" is complete—modern SEO demands semantic understanding, entity-based content, and user intent alignment rather than hitting specific density percentages.

Modern search algorithms have fundamentally changed keyword strategy. **RankBrain** (2015) introduced machine learning to understand query intent beyond exact matches. **BERT** (2019) brought bidirectional natural language processing, analyzing context by examining words before and after each term, processing 70+ languages with contextual awareness. **MUM** (2021), 1,000x more powerful than BERT, provides multimodal understanding across text, images, and 75+ languages simultaneously. Together, these AI systems analyze semantic meaning, entity relationships, and topical authority—making crude keyword density calculations increasingly irrelevant while comprehensive, naturally-written content becomes paramount.

Research from Gotch SEO analyzing 250,000 search results found the average keyword density in top 10 results was just **0.04%**, with lower-ranking segments showing higher density. This counterintuitive finding suggests that lower density correlates with better rankings when content demonstrates quality and topical authority through comprehensive coverage rather than keyword repetition.

## Essential calculation formulas and algorithms

### Basic keyword density formula

The foundational calculation remains straightforward:

```
Keyword Density (%) = (Nkr / Tkn) × 100
```

Where Nkr equals the number of times the keyword appears and Tkn equals total words in the analyzed text. For a 1,000-word article with 10 keyword appearances, density equals 1%. Industry consensus suggests maintaining **1-2.5% density** for primary keywords, though this should result from natural writing rather than deliberate targeting.

### Multi-word phrase density calculation

Phrase density requires adjusting for the number of words in each phrase:

```
Phrase Density (%) = (Nkr × Nwp / Tkn) × 100
```

Where Nwp represents the number of words in the phrase. For "search engine optimization" appearing 4 times in 400 words: (4 × 3 / 400) × 100 = 3%. A more mathematically refined approach adjusts the total word count by removing excess phrase word counts: `(Nkr / (Tkn - Nkr × (Nwp - 1))) × 100`.

### TF-IDF scoring for semantic relevance

TF-IDF (Term Frequency-Inverse Document Frequency) represents a significant advancement over simple density, evaluating term importance relative to a document corpus. **This approach better mirrors how search engines actually assess content relevance.**

**Term Frequency (TF)** with log normalization:
```
TF(t,d) = log(1 + f(t,d)) / log(1 + total_words)
```

**Inverse Document Frequency (IDF)**:
```
IDF(t,D) = log(N / df(t))
```
Where N equals total documents in the corpus and df(t) equals documents containing the term.

**Combined TF-IDF Score**:
```
TF-IDF(t,d,D) = TF(t,d) × IDF(t,D)
```

TF-IDF reveals which terms are statistically important to a topic by scaling up meaningful terms while diminishing common words. Google likely uses TF-IDF or similar algorithms rather than simple keyword density. Tools like WebSite Auditor and TFIDFTool.com implement this by analyzing your content against top 10-20 competitors, identifying missed opportunities (terms you lack), terms needing improvement (under-used), and potential penalties (over-used terms).

### N-gram analysis for phrase detection

N-grams—contiguous sequences of N words—enable multi-word phrase analysis essential for modern SEO:

```python
def generate_ngrams(text, n):
    words = text.split()
    ngrams = []
    for i in range(len(words) - n + 1):
        ngram = ' '.join(words[i:i+n])
        ngrams.append(ngram)
    return ngrams
```

**N-gram frequency analysis** identifies common patterns in content and search queries:
```
Frequency(n-gram) = Count(n-gram) / Total number of n-grams
```

This technique powers keyword pattern discovery, search intent analysis, and competitor keyword comparison. SEO tools analyze 1-grams (single words), 2-grams (bigrams), 3-grams (trigrams), and sometimes 4-grams to capture complete keyword phrases used in search queries.

## Technical implementation architecture

### Text processing pipeline

A robust keyword density checker requires a **multi-stage preprocessing pipeline**:

1. **HTML Removal:** Strip tags, scripts, styles, navigation elements using BeautifulSoup4 (Python) or Cheerio (JavaScript)
2. **Visible Text Extraction:** Focus on main content, excluding footers, sidebars, comments
3. **Tokenization:** Split into words using language-appropriate tokenizers (NLTK, spaCy, Natural, compromise.js)
4. **Normalization:** Convert to lowercase, handle contractions, remove special characters
5. **Stop Word Filtering:** Remove common function words (optional, context-dependent)
6. **Stemming/Lemmatization:** Reduce words to base forms for variant matching

### Stemming versus lemmatization decision matrix

**Stemming** (Porter, Snowball, Lancaster algorithms) provides fast, rule-based suffix removal. It produces non-dictionary words like "poni" from "ponies" but processes quickly. **Best for:** Search engines, performance-critical applications, real-time analysis.

**Lemmatization** (WordNet, spaCy) uses morphological analysis and part-of-speech tagging to return valid dictionary words. It's context-aware and more accurate but computationally expensive. **Best for:** Content where accuracy matters, chatbots, sentiment analysis, quality-focused tools.

For keyword density checkers, **stemming typically suffices** due to speed requirements and acceptable accuracy for variant detection. However, **lemmatization provides better results** when analyzing semantic relevance and generating content recommendations.

### HTML parsing implementation

Python implementation with BeautifulSoup4:

```python
from bs4 import BeautifulSoup
import requests

def extract_visible_text(url):
    response = requests.get(url, timeout=10)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Remove non-visible elements
    for script in soup(["script", "style", "noscript", "nav", "footer", "aside"]):
        script.extract()
    
    # Get main content
    main_content = (
        soup.find('main') or 
        soup.find('article') or 
        soup.find('div', class_='content') or
        soup.find('body')
    )
    
    # Extract and clean text
    text = main_content.get_text(separator=' ', strip=True)
    return text
```

For comprehensive URL analysis, extract metadata alongside body content:
- **Meta tags:** Description, keywords, robots directives
- **Alt text:** All image alt attributes
- **Headings:** H1-H6 hierarchical structure
- **Title:** Page title element

Advanced content extraction benefits from boilerplate removal libraries like **Trafilatura** (Python) which use machine learning to identify and extract main content while filtering navigation, advertisements, and other non-article elements.

### Client-side versus server-side architecture

**Hybrid architecture** provides optimal performance and user experience:

**Client-side JavaScript** handles:
- Light tokenization for documents under 50KB
- Real-time preview feedback during typing
- Basic keyword highlighting
- UI interactions and visualizations
- Offline capability via Service Workers

**Server-side Python/Node.js** processes:
- Complex NLP operations (lemmatization, POS tagging)
- URL fetching and HTML parsing
- Large document analysis (over 50KB)
- TF-IDF calculations requiring corpus comparison
- Batch processing for multiple URLs
- Database operations and historical tracking

This division leverages browser capabilities for immediate feedback while offloading computationally intensive operations to powerful servers with consistent performance.

### Performance optimization strategies

For large-scale analysis, implement:

**Chunking:** Process text in 10,000-word segments to avoid memory issues
**Streaming:** Line-by-line file processing for massive documents
**Caching:** LRU cache for tokenization results using content hashing
**Batch Processing:** Use spaCy's `.pipe()` method with multiprocessing
**Database Indexing:** Create indexes on keyword and density columns
**Web Workers:** Offload intensive client-side calculations to background threads

Python multiprocessing example:
```python
from multiprocessing import Pool
import spacy

def parallel_process(documents, num_workers=4):
    with Pool(num_workers) as pool:
        results = pool.map(process_document, documents)
    return results
```

### Recommended technology stack

**Python Production Environment:**
- **spaCy:** Fast (Cython-based), accurate, 50+ languages, production-ready
- **BeautifulSoup4 + lxml:** Industry standard HTML parsing
- **Trafilatura:** Advanced content extraction with boilerplate removal
- **Flask/FastAPI:** Lightweight web frameworks for API development

**JavaScript/Node.js Stack:**
- **NLP.js:** Full-featured, 40 languages, chatbot-oriented
- **Natural:** Traditional NLP tasks, stemming, TF-IDF
- **compromise.js:** Lightweight browser library, client-side processing
- **Cheerio:** jQuery-like HTML parsing for Node.js

**Framework Selection Rationale:** spaCy for production due to speed (5ms tokenization vs NLTK's 50ms for 1,000 words), while NLTK suits research and prototyping. For JavaScript, compromise.js excels in browser environments while NLP.js handles comprehensive Node.js applications.

## Advanced feature implementation

### Competitor analysis system

Modern keyword density checkers must analyze not just your content but also top-ranking competitors to provide actionable benchmarks. **This transforms raw data into strategic intelligence.**

Leading tools like Surfer SEO and Clearscope analyze the top 10-30 SERP results for target keywords, extracting:
- Word count ranges and averages
- Keyword density patterns across competitors
- Heading structure (H1-H6 distribution)
- Common themes, subtopics, and related terms
- Questions addressed and external sources cited

Implementation process:
1. Fetch top N results for target keyword via search API
2. Extract and parse content from each URL
3. Calculate keyword metrics for each competitor
4. Aggregate statistics (mean, median, ranges)
5. Compare user's content to competitive benchmarks
6. Generate specific recommendations based on gaps

This competitive intelligence reveals:
- **Keyword gaps:** Terms competitors rank for that you're missing
- **Over-optimization risks:** Areas where you exceed competitive norms
- **Content structure patterns:** Common organizational approaches in top content
- **Topic coverage requirements:** Subtopics essential for comprehensive coverage

### Semantic keyword suggestions (LSI keywords)

**Important clarification:** Google doesn't actually use Latent Semantic Indexing, despite widespread use of "LSI keywords" in SEO. The term has become shorthand for "semantically related keywords" identified through **Natural Language Processing** and **Knowledge Graph** entity relationships.

Modern semantic analysis identifies:
- Synonyms and variations of primary keywords
- Co-occurring terms in high-quality content
- Related entities and concepts
- Natural language patterns demonstrating topical depth

**Surfer SEO's NLP Terms** feature analyzes top-ranking content to identify semantically related phrases with recommended usage frequencies. **Clearscope**, backed by IBM Watson and Google NLP, organizes keywords into semantic groups with theme-based categorization. **MarketMuse** uses AI-powered topic modeling to suggest naturally-occurring related terms that prevent keyword stuffing while ensuring comprehensive coverage.

Implementation approaches:
- Analyze co-occurrence patterns in top-ranking content
- Extract entities using Google's Natural Language API or spaCy
- Query Knowledge Graph for related entities
- Mine "People Also Ask" and "Related Searches" from SERPs
- Apply word embedding models (Word2Vec, GloVe) for similarity detection

Statistical finding: Pages ranking for target keywords typically rank for 1,000+ semantically related keywords, demonstrating the importance of comprehensive semantic coverage over narrow keyword focus.

### Keyword prominence analysis with position weighting

**Keyword prominence—how visibly and strategically keywords appear in key page elements—matters more than overall density.** Google's algorithms weight keyword placement, giving higher signals to terms appearing in titles, headings, opening paragraphs, and URLs.

**Position-based weighting formula:**
```
Prominence Score = Σ (Position Weight × Frequency in Zone)

Zone weights:
- Title Tag: 10x
- H1: 8x
- First 100 words: 7x
- H2/H3: 6x
- URL slug: 5x
- Meta Description: 4x
- Image Alt Text: 3x
- Body content: 1x
```

This algorithmic approach mirrors how search engines assess topical focus. A keyword appearing once in the title carries more weight than five appearances buried in body paragraphs.

**Distance-based prominence refinement:**
```
Proximity Score = 1 / (Distance from Beginning + 1)
```

Keywords appearing earlier in each section receive higher prominence scores, rewarding front-loaded, user-friendly content structure.

Implementation in tools like Surfer SEO tracks keyword placement across all zones, providing specific recommendations: "Use keyword 2-3 times in H2 tags" or "Add to first paragraph for stronger prominence signal." Yoast SEO's WordPress plugin checks for keyword presence in title, meta description, first paragraph, subheadings, and URL slug, providing green/orange/red indicators.

### TF-IDF integration for content gaps

**TF-IDF analysis identifies statistically important terms by comparing your content against top-ranking competitors, revealing content gaps and optimization opportunities.**

Leading implementations:

**WebSite Auditor's TF-IDF Module:**
- Analyzes top 10 SERP results for target keywords
- Generates lists of topically relevant terms sorted by competitor usage
- Provides recommendations: "Add," "Use More," "Use Less"
- Visualizes with charts comparing your TF-IDF values to competitors
- Integrates WYSIWYG content editor for immediate optimization

**TFIDFTool.com categorization system:**
- **Missed Opportunities:** Terms you lack but competitors use
- **Needs Improvement:** Under-used terms relative to competition
- **Potential Penalty:** Over-used terms risking keyword stuffing
- **Google Optimized:** Properly-used terms matching competitive norms

**Best use cases for TF-IDF:**
1. **Page 2 Content:** Well-optimized content with authority needing a final push
2. **Declining Rankings:** Content slowly losing positions requiring relevance refresh
3. **Product Pages:** Commercial pages struggling to rank for money terms

Implementation requires maintaining a corpus of competitor content, calculating TF-IDF scores for all terms, comparing user content to aggregate competitor statistics, and generating specific term addition/reduction recommendations.

### Entity-based SEO and Knowledge Graph integration

**Modern search has shifted from matching strings (keywords) to understanding things (entities).** Google's Knowledge Graph connects entities—people, places, things, concepts—with their relationships, powering rich results, knowledge panels, and semantic understanding.

**Entity-based optimization strategies:**

**Schema Markup with @id properties** creates unified internal knowledge graphs:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://example.com/#organization",
  "name": "Example Company"
}

{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Jane Doe",
  "worksFor": {"@id": "https://example.com/#organization"}
}
```

The `@id` property links entities within your site, while `sameAs` properties link to external entity definitions (Wikidata, Wikipedia, LinkedIn), establishing entity identity and relationships.

**Benefits of entity-based optimization:**
- Improved content understanding by search engines
- Enhanced SERP visibility through knowledge panels and rich snippets
- Broader query coverage from entity relationship mapping
- Future-proofing for AI search interfaces (ChatGPT, Perplexity)

Tools like **WordLift** auto-generate schema markup and create knowledge graphs, **InLinks** provides automated entity-based internal linking, and **Google's Natural Language API** identifies entities with confidence scores for validation.

## Competitive landscape analysis

### Market leaders feature comparison

The keyword density checker market shows surprising homogeneity in basic features, with differentiation occurring through advanced capabilities and user experience quality.

**SEO Review Tools** stands out with its **search-based keyword density checker**—a unique feature analyzing top 10 Google results for any keyword, showing average keyword density across competitors. This transforms the tool from simple analysis into competitive intelligence. Additional differentiators include API access for bulk checking, Chrome extension, and integration with a suite of 75+ SEO tools. The clean, professional interface with no registration required and CSV export functionality makes it highly accessible.

**Copywritely** uniquely offers an **integrated online editor with real-time recalculation every 2 seconds**, enabling users to edit content directly while watching density metrics update live. Click-to-highlight functionality shows keyword locations in context. This workflow integration—combining analysis with fixing rather than requiring tool switching—represents a significant UX advancement. The tool includes plagiarism, readability, and grammar checkers for holistic content optimization.

**Small SEO Tools** provides extensive **visual indicators** showing keyword presence in title, description, and heading tags with color-coded flags. The tag cloud visualization and page load time measurement offer additional context. Support for 9 languages and 4-word phrase analysis (most tools stop at 3) expand functionality, though heavy advertising in the free version detracts from user experience.

**CheckSERP** emphasizes **customization** with adjustable stopword lists, word min-length filtering, and result limiters—rare features allowing personalization for specific use cases. The privacy-focused approach (claiming not to store content) addresses growing user concerns about data handling.

**PrePostSEO** uniquely accepts **file uploads** (.doc, .docx, .pdf, .txt), removing the copy-paste friction for document-based workflows. As part of a 95+ tool suite with Chrome extension integration, it offers convenience through ecosystem breadth, though interface quality and accuracy receive mixed reviews.

### Critical market gaps and differentiation opportunities

**AI-powered semantic analysis** represents the highest-priority opportunity. Current tools count words mechanically without understanding context or meaning. Modern tools should analyze semantic relevance, identify topic coverage gaps, suggest LSI keywords and related terms, understand user intent alignment, and provide entity recognition. This aligns with how Google's algorithms actually work—focusing on semantic understanding rather than keyword counting—creating sustainable competitive advantage.

**Real-time content optimization editors** remain rare despite their obvious value. Most tools analyze finished content, requiring switching between applications. Following Copywritely's lead but expanding capabilities, modern tools should offer full-featured editors with live optimization scores, inline AI-powered suggestions, synonym recommendations, and readability optimization alongside keyword density. Surfer SEO and MarketMuse demonstrate this approach's effectiveness in premium tools, creating opportunity for accessible alternatives.

**Competitive intelligence dashboards** are underdeveloped across the market. Only SEO Review Tools offers search-based analysis, yet comprehensive competitor tracking remains absent. Tools should analyze top 10-20 competitors automatically, provide side-by-side comparison tables, identify keyword gaps, show competitive benchmarks, track competitor changes over time, and optimize for SERP features like featured snippets. This transforms reactive analysis into proactive strategy.

**Smart recommendations engines** would address the common complaint that tools show numbers without actionable guidance. Rather than reporting "density is 2.5%," effective tools should specify "Remove 3 instances from paragraph 2," suggest alternative phrasing, provide optimal placement guidance ("add to H2 subheading"), identify topic coverage gaps, and recommend content structure improvements. This transforms data into strategy.

**Historical tracking and analytics** offer untapped value. No current tool provides temporal analysis of keyword density, yet tracking changes over time, correlating with ranking fluctuations, monitoring optimization impact, enabling A/B testing, and detecting content decay would provide powerful insights for ongoing optimization.

## UX design specification

### Data presentation and visualization

**Color-coded density indicators** provide instant comprehension:
- **Green (0.5-2.5%):** Optimal keyword usage
- **Yellow (2.5-3%):** Approaching over-optimization
- **Orange (3-5%):** Consider reducing usage
- **Red (>5%):** Over-optimization risk—keyword stuffing detected

**Tabular format remains standard** with multi-column tables showing keyword/phrase, frequency count, and density percentage. Separate tables for 1-word, 2-word, 3-word, and 4-word phrases maintain organization. Default sorting by frequency (highest first) with options for density % or alphabetical ordering meets user expectations.

**Supplementary visualizations** enhance comprehension:
- **Tag clouds** where keyword size indicates frequency and color intensity maps to density
- **Horizontal bar charts** for top 10-15 keywords
- **Comparison charts** showing target keyword versus competitors
- **Heat maps** displaying keyword distribution across content sections
- **Position indicators** showing keyword placement timeline through content

**F-pattern layout structure:**
1. **Top section:** Input area and summary dashboard with total word count, unique keywords, top keyword with density, overall optimization score (0-100), and quick status
2. **Middle section:** Primary results table with filtering controls
3. **Bottom section:** Detailed breakdowns and actionable recommendations

### Essential user controls and filters

**Must-have filters:**
- **Phrase length tabs:** 1-word | 2-word | 3-word | 4-word with combined view option
- **Stop word toggle:** Default ON with language-specific lists and custom list input
- **Keyword exclusion:** Text field for comma-separated terms with "quick exclude" buttons
- **Min/max frequency thresholds:** Hide keywords below specified occurrence counts

**Power user features:**
- **Position/location filters:** Checkboxes for Title | Meta | H1 | H2-H6 | Body | Alt Text
- **Density range sliders:** Show only problematic (>3%) or underutilized (<0.5%) keywords
- **Content section analysis:** Analyze introduction, body, or conclusion separately
- **Competitive comparison mode:** Side-by-side multi-URL analysis

**Interface design:**
- **Sticky filter bar** remaining visible during scrolling
- **Active filter count indicator** showing applied filters
- **Prominent "Reset all filters" button** for quick clearing
- **Smart defaults** auto-detecting language and removing non-content elements

### Actionable recommendations system

Effective recommendations follow priority-based formatting:

**Critical Issues (Red):**
```
❌ CRITICAL: Keyword stuffing detected
"SEO tools" appears 47 times (8.2% density)
→ ACTION: Reduce usage to 15-20 occurrences (2.5-3%)
→ TIP: Replace with synonyms: "optimization software", "search tools"
```

**Warnings (Yellow):**
```
⚠️ WARNING: Approaching over-optimization
"keyword research" appears 18 times (3.1% density)
→ ACTION: Consider reducing to 12-15 occurrences (2-2.5%)
→ TIP: Use variations: "keyword analysis", "search term research"
```

**Opportunities (Green):**
```
✓ OPPORTUNITY: Good keyword usage
"content optimization" appears 8 times (1.4% density)
→ SUGGESTION: Could increase to 10-12 occurrences if natural
→ TIP: Add to subheadings for better SEO signals
```

Recommendations should be **specific and implementable**—not just "too high" but "remove these 3 instances from paragraphs 2 and 5." For under-utilization, suggest exact placement: "Add to H2 subheading" or "Include in meta description." For missing on-page elements, provide examples: "Title example: 'Free Keyword Density Checker | Optimize Your Content'."

### Content creator workflow integration

**Real-world use cases inform design:**

**Pre-publication review:** Bloggers and content writers paste drafts before publishing to avoid keyword stuffing. **Requirements:** Fast analysis, text input option, clear pass/fail indicators, synonym suggestions.

**Competitor analysis:** SEO specialists analyze top-ranking competitor URLs to understand keyword strategy. **Requirements:** Bulk URL input, comparison view, export to spreadsheet, keyword gap identification.

**Content refresh:** Digital marketers update existing content to improve rankings. **Requirements:** Historical comparison, before/after view, integration with analytics, change tracking.

**Content brief creation:** Agencies analyze top 10 results to create data-driven writer briefs. **Requirements:** Batch analysis, keyword clustering, export to template format, competitive benchmarks.

**Input flexibility supports workflows:**
- **URL input** for published content analysis
- **Text input** for pre-publication drafts
- **File upload** (.txt, .doc, .docx) for document-based workflows
- **Browser extension** for one-click webpage analysis
- **WordPress plugin** for in-editor real-time checking
- **Google Docs add-on** for collaborative writing environments

### SEO positioning for organic traffic

**Target primary keywords** with high search volume:
- "keyword density checker" (~12,100 monthly searches)
- "keyword density tool" (~5,400 searches)
- "check keyword density" (~2,400 searches)
- "free keyword density checker" (~1,600 searches)

**Title tag optimization formula:**
```
[Primary Keyword] | [Benefit] | [Brand]
Example: "Keyword Density Checker | Free SEO Tool | YourBrand"
```

**Meta description template (155-160 characters):**
```
"Check keyword density instantly with our free tool. Analyze content for 
optimal keyword usage, avoid stuffing, and improve SEO rankings. Try now!"
```

**Content strategy for rankings:**
- Comprehensive guide section covering "What is Keyword Density?", calculation methods, ideal percentages, common mistakes, and stuffing versus optimization
- Comparison content evaluating free versus paid tools with feature tables
- Tutorial content including step-by-step guides with screenshots, embedded videos, downloadable PDFs, and case studies
- FAQ section with schema markup answering common questions
- Tool comparison tables showing competitive features

**Technical SEO requirements:**
- Page load time under 2.5 seconds (Largest Contentful Paint)
- Mobile-first responsive design
- Schema markup for WebApplication type
- Core Web Vitals optimization
- HTTPS with valid SSL certificate

## Comprehensive implementation pseudocode

### Complete keyword density analyzer

```python
from flask import Flask, request, jsonify
import spacy
from bs4 import BeautifulSoup
import requests
from collections import Counter

app = Flask(__name__)
nlp = spacy.load("en_core_web_sm")

class KeywordDensityAnalyzer:
    def __init__(self):
        self.nlp = nlp
        self.stopwords = self.load_stopwords()
    
    def extract_from_url(self, url):
        """Extract visible text from URL"""
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Remove non-visible elements
        for element in soup(['script', 'style', 'nav', 'footer', 'aside']):
            element.decompose()
        
        # Extract metadata
        metadata = {
            'title': soup.title.string if soup.title else '',
            'meta_description': soup.find('meta', {'name': 'description'}),
            'h1': [h.get_text() for h in soup.find_all('h1')],
            'h2': [h.get_text() for h in soup.find_all('h2')],
            'alt_texts': [img.get('alt', '') for img in soup.find_all('img')]
        }
        
        # Extract main content
        main = soup.find('main') or soup.find('article') or soup.find('body')
        text = main.get_text(separator=' ', strip=True)
        
        return text, metadata
    
    def analyze(self, text, target_keywords=None, use_lemmatization=True):
        """Perform comprehensive keyword density analysis"""
        doc = self.nlp(text.lower())
        
        # Tokenization with lemmatization
        if use_lemmatization:
            tokens = [token.lemma_ for token in doc 
                     if not token.is_stop and not token.is_punct]
        else:
            tokens = [token.text for token in doc 
                     if not token.is_stop and not token.is_punct]
        
        total_words = len(tokens)
        word_freq = Counter(tokens)
        
        # Generate n-grams for phrase analysis
        bigrams = self.generate_ngrams(tokens, 2)
        trigrams = self.generate_ngrams(tokens, 3)
        
        # Calculate densities
        results = {
            'total_words': total_words,
            'unique_words': len(word_freq),
            'single_words': self.calculate_densities(word_freq, total_words),
            'two_word_phrases': self.calculate_densities(
                Counter([' '.join(bg) for bg in bigrams]), total_words),
            'three_word_phrases': self.calculate_densities(
                Counter([' '.join(tg) for tg in trigrams]), total_words)
        }
        
        # Target keyword analysis if specified
        if target_keywords:
            results['target_analysis'] = self.analyze_targets(
                target_keywords, word_freq, total_words)
        
        # Generate recommendations
        results['recommendations'] = self.generate_recommendations(
            results['single_words'], total_words)
        
        return results
    
    def generate_ngrams(self, tokens, n):
        """Generate n-grams from token list"""
        return [tuple(tokens[i:i+n]) for i in range(len(tokens) - n + 1)]
    
    def calculate_densities(self, freq_dict, total):
        """Calculate density percentages"""
        return [{
            'term': term,
            'count': count,
            'density': round((count / total * 100), 2) if total > 0 else 0
        } for term, count in freq_dict.most_common(50)]
    
    def analyze_targets(self, targets, word_freq, total):
        """Analyze specific target keywords"""
        return [{
            'keyword': kw.lower().strip(),
            'count': word_freq.get(kw.lower().strip(), 0),
            'density': round((word_freq.get(kw.lower().strip(), 0) / total * 100), 2)
        } for kw in targets]
    
    def generate_recommendations(self, word_list, total_words):
        """Generate actionable recommendations"""
        recommendations = {
            'critical': [],
            'warnings': [],
            'opportunities': []
        }
        
        for item in word_list[:20]:
            density = item['density']
            
            if density > 5:  # Critical over-optimization
                recommendations['critical'].append({
                    'keyword': item['term'],
                    'issue': 'Keyword stuffing detected',
                    'current': f"{item['count']} times ({density}%)",
                    'action': f"Reduce to {int(total_words * 0.025)} occurrences (2.5%)",
                    'tip': 'Use synonyms and related terms'
                })
            elif density > 3:  # Warning
                recommendations['warnings'].append({
                    'keyword': item['term'],
                    'issue': 'Approaching over-optimization',
                    'current': f"{item['count']} times ({density}%)",
                    'action': f"Consider reducing to {int(total_words * 0.02)} occurrences",
                    'tip': 'Use keyword variations'
                })
            elif 0.5 <= density <= 2.5:  # Optimal
                recommendations['opportunities'].append({
                    'keyword': item['term'],
                    'status': 'Good keyword usage',
                    'current': f"{item['count']} times ({density}%)",
                    'suggestion': 'Maintain current usage'
                })
        
        return recommendations
    
    def load_stopwords(self):
        """Load English stopwords"""
        return {'a', 'an', 'the', 'is', 'are', 'was', 'were', 'in', 'on', 
                'at', 'to', 'for', 'of', 'with', 'and', 'but', 'or', 'not'}

analyzer = KeywordDensityAnalyzer()

@app.route('/api/analyze', methods=['POST'])
def analyze_endpoint():
    """API endpoint for keyword density analysis"""
    data = request.json
    
    try:
        if 'url' in data:
            text, metadata = analyzer.extract_from_url(data['url'])
        else:
            text = data.get('text', '')
            metadata = {}
        
        keywords = data.get('keywords', [])
        use_lemmatization = data.get('lemmatization', True)
        
        results = analyzer.analyze(text, keywords, use_lemmatization)
        results['metadata'] = metadata
        
        return jsonify({'success': True, 'results': results})
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

### TF-IDF implementation for competitive analysis

```python
import math
from collections import Counter

def calculate_tfidf_scores(documents):
    """Calculate TF-IDF scores across document corpus"""
    # Calculate TF for each document
    tf_matrix = []
    for doc in documents:
        words = doc.lower().split()
        word_count = Counter(words)
        total = len(words)
        tf_dict = {word: count/total for word, count in word_count.items()}
        tf_matrix.append(tf_dict)
    
    # Calculate IDF
    N = len(documents)
    all_words = set()
    for doc in documents:
        all_words.update(doc.lower().split())
    
    idf_dict = {}
    for word in all_words:
        df = sum(1 for doc in documents if word in doc.lower())
        idf_dict[word] = math.log(N / df) if df > 0 else 0
    
    # Calculate TF-IDF
    tfidf_matrix = []
    for tf_dict in tf_matrix:
        tfidf_dict = {
            word: tf_dict.get(word, 0) * idf_dict[word] 
            for word in all_words
        }
        tfidf_matrix.append(tfidf_dict)
    
    return tfidf_matrix, idf_dict

def compare_to_competitors(your_content, competitor_urls):
    """Compare your content TF-IDF to competitors"""
    # Fetch competitor content
    competitor_content = [fetch_content(url) for url in competitor_urls]
    all_content = [your_content] + competitor_content
    
    # Calculate TF-IDF
    tfidf_scores, idf = calculate_tfidf_scores(all_content)
    
    # Compare your content (index 0) to competitors
    your_scores = tfidf_scores[0]
    competitor_avg = {}
    
    for word in your_scores.keys():
        competitor_scores = [tfidf_scores[i].get(word, 0) 
                           for i in range(1, len(tfidf_scores))]
        competitor_avg[word] = sum(competitor_scores) / len(competitor_scores)
    
    # Identify gaps and opportunities
    gaps = []
    over_optimized = []
    well_optimized = []
    
    for word, your_score in your_scores.items():
        comp_score = competitor_avg.get(word, 0)
        
        if your_score < comp_score * 0.5 and comp_score > 0.01:
            gaps.append({'term': word, 'your_score': your_score, 
                        'comp_avg': comp_score, 'action': 'add_more'})
        elif your_score > comp_score * 2 and your_score > 0.05:
            over_optimized.append({'term': word, 'your_score': your_score,
                                  'comp_avg': comp_score, 'action': 'reduce'})
        else:
            well_optimized.append({'term': word, 'your_score': your_score,
                                  'comp_avg': comp_score, 'action': 'maintain'})
    
    return {
        'missed_opportunities': sorted(gaps, 
                                      key=lambda x: x['comp_avg'], 
                                      reverse=True)[:20],
        'over_optimized': sorted(over_optimized,
                                key=lambda x: x['your_score'],
                                reverse=True)[:10],
        'well_optimized': sorted(well_optimized,
                                key=lambda x: x['comp_avg'],
                                reverse=True)[:15]
    }
```

## Stop words reference list

Comprehensive English stop words list for filtering:

**Core function words (175+ terms):**
a, about, above, across, after, afterwards, again, against, all, almost, alone, along, already, also, although, always, am, among, amongst, amount, an, and, another, any, anyhow, anyone, anything, anyway, anywhere, are, around, as, at, be, became, because, become, becomes, becoming, been, before, beforehand, behind, being, below, beside, besides, between, beyond, both, but, by, can, cannot, can't, could, couldn't, did, didn't, do, does, doesn't, doing, done, don't, down, during, each, either, else, elsewhere, enough, even, ever, every, everyone, everything, everywhere, except, few, for, former, formerly, from, further, had, has, hasn't, have, haven't, having, he, he'd, he'll, hence, he's, her, here, here's, hers, herself, him, himself, his, how, however, how's, I, I'd, I'll, I'm, I've, if, in, indeed, into, is, isn't, it, it's, its, itself, just, keep, keeps, kept, last, latter, latterly, least, less, let, let's, like, made, make, many, may, maybe, me, meanwhile, might, mine, more, moreover, most, mostly, much, must, mustn't, my, myself, name, namely, neither, never, nevertheless, next, no, nobody, none, noone, nor, not, nothing, now, nowhere, of, off, often, on, once, one, only, onto, or, other, others, otherwise, our, ours, ourselves, out, over, own, part, per, perhaps, please, put, quite, rather, really, regarding, said, same, say, see, seem, seemed, seeming, seems, seen, several, shall, shan't, she, she'd, she'll, she's, should, shouldn't, since, so, some, somehow, someone, something, sometime, sometimes, somewhere, still, such, than, that, that's, the, their, theirs, them, themselves, then, thence, there, thereafter, thereby, therefore, therein, there's, thereupon, these, they, they'd, they'll, they're, they've, this, those, though, through, throughout, thru, thus, to, together, too, toward, towards, under, unless, until, up, upon, us, used, using, various, very, via, was, wasn't, we, we'd, we'll, well, we're, were, weren't, we've, what, whatever, what's, when, whence, whenever, when's, where, whereafter, whereas, whereby, wherein, where's, whereupon, wherever, whether, which, while, whither, who, whoever, whole, whom, who's, whose, why, why's, will, with, within, without, won't, would, wouldn't, yes, yet, you, you'd, you'll, your, you're, yours, yourself, yourselves, you've

**Implementation note:** Modern SEO best practices suggest **minimal stop word filtering** for content visible to users. Google's algorithms understand context and don't require stop word removal. Filter stop words primarily for internal analysis and keyword extraction, not for content displayed to readers or search engines.

## Development roadmap and priorities

### Phase 1: MVP (Months 1-2)
- Basic URL and text input processing
- 1-word, 2-word, 3-word keyword analysis
- Simple table display with sorting
- Color-coded density indicators (green/yellow/orange/red)
- Stop word filtering with default English list
- CSV export functionality
- **Success metric:** 100+ daily active users, 85%+ analysis completion rate

### Phase 2: Enhanced analysis (Months 3-4)
- Advanced filtering (phrase length, density ranges, position)
- Comprehensive recommendation system with priority categorization
- Meta tag and heading presence detection
- Keyword prominence analysis with position weighting
- Single competitor URL comparison
- Basic visualization (bar charts, tag clouds)
- **Success metric:** 500+ daily users, 15%+ account creation rate

### Phase 3: Integration ecosystem (Months 5-6)
- WordPress plugin with real-time editor checking
- Chrome/Firefox browser extensions
- Google Docs add-on for collaborative writing
- RESTful API with documentation
- User accounts with analysis history
- Pro tier launch ($19/month)
- **Success metric:** 2,000+ users, 5%+ free-to-pro conversion

### Phase 4: Competitive intelligence (Months 7-8)
- Batch competitor analysis (top 10-20 URLs)
- TF-IDF scoring with gap identification
- Side-by-side comparison tables
- Semantic keyword suggestions (LSI keywords)
- Historical tracking and trend analysis
- Team workspaces with collaboration features
- **Success metric:** 5,000+ users, 10%+ paid tier adoption

### Phase 5: AI-powered optimization (Months 9-12)
- Advanced semantic analysis using NLP
- Entity recognition and Knowledge Graph integration
- Automated content optimization suggestions
- Predictive analytics for ranking potential
- Content decay alerts and refresh recommendations
- White-label reporting for agencies
- **Success metric:** 10,000+ users, $50K+ MRR

## Critical success factors

**Technical excellence:** Sub-3-second analysis time, 99.9% uptime, accurate calculations verified against industry standards, mobile-responsive design, and WCAG 2.1 AA accessibility compliance establish credibility.

**User experience superiority:** Clean interface without intrusive ads, intuitive workflow requiring minimal learning, progressive disclosure hiding complexity until needed, clear visual hierarchy guiding attention, and helpful error messages maintaining trust.

**Actionable insights:** Transform raw data into specific guidance—not "density too high" but "remove 7 instances from paragraphs 2, 5, and 8." Provide synonym suggestions, placement recommendations, and competitive benchmarks enabling immediate action.

**Modern SEO alignment:** Reflect 2024-2025 best practices emphasizing semantic relevance over mechanical density, integrate entity-based optimization, acknowledge keyword density as one factor among many, and educate users about comprehensive content quality.

**Strategic positioning:** Target high-volume keywords like "keyword density checker" through comprehensive content, technical SEO excellence, and superior user experience. Build authority through original research, comprehensive guides, and tool comparison content attracting natural backlinks.

**Freemium balance:** Generous free tier (10 analyses daily, core features, no registration) captures market share while compelling premium features (unlimited analyses, competitor comparison, historical tracking, API access, team collaboration) drive conversion at reasonable price points ($19-79/month).

**Privacy and trust:** Clear data handling policies, no storage of sensitive content, transparent methodology explaining calculations, regular updates maintaining algorithmic relevance, and responsive support building long-term user relationships.

## Conclusion: Building for 2025 and beyond

The keyword density checker for 2025 must transcend its origins as a mechanical word-counting tool, evolving into a comprehensive content optimization platform aligned with modern search algorithms. **Success requires balancing simplicity for beginners with depth for professionals, transforming raw metrics into actionable strategies, and integrating seamlessly into content creation workflows.**

This specification provides everything needed to build a market-leading tool: proven algorithms with implementation code, current SEO best practices grounded in 2024-2025 research, competitive intelligence revealing differentiation opportunities, comprehensive UX guidelines ensuring usability, and strategic positioning maximizing organic visibility.

The market awaits a tool that treats keyword density as one component of holistic content quality—combining basic density checking with semantic analysis, competitive intelligence, real-time optimization, entity-based SEO, and AI-powered recommendations. Build this tool, and you'll capture users frustrated with outdated checkers, SEO professionals needing modern analysis, content creators seeking workflow integration, and agencies requiring client reporting capabilities.

**The future of keyword density checking lies not in counting words more accurately, but in understanding content more deeply.** Implement this specification to build that future.