from flask import Flask, request, jsonify, render_template, send_file
from flask_cors import CORS
import spacy
from bs4 import BeautifulSoup
import requests
from collections import Counter
import trafilatura
import io
import csv
from typing import Dict, List, Tuple, Optional

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}})

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
    SPACY_AVAILABLE = True
except OSError:
    print("WARNING: spaCy model not found. Download with: python -m spacy download en_core_web_sm")
    print("Fallback mode: Using basic tokenization without NLP features")
    nlp = None
    SPACY_AVAILABLE = False


class KeywordDensityAnalyzer:
    """
    Comprehensive keyword density analyzer for SEO content optimization.
    Implements n-gram analysis, density calculations, and actionable recommendations.
    """

    def __init__(self):
        self.nlp = nlp
        self.stopwords = self._load_stopwords()

    def _load_stopwords(self) -> set:
        """Load English stopwords for filtering."""
        return {
            'a', 'about', 'above', 'across', 'after', 'afterwards', 'again', 'against',
            'all', 'almost', 'alone', 'along', 'already', 'also', 'although', 'always',
            'am', 'among', 'amongst', 'amount', 'an', 'and', 'another', 'any', 'anyhow',
            'anyone', 'anything', 'anyway', 'anywhere', 'are', 'around', 'as', 'at',
            'be', 'became', 'because', 'become', 'becomes', 'becoming', 'been', 'before',
            'beforehand', 'behind', 'being', 'below', 'beside', 'besides', 'between',
            'beyond', 'both', 'but', 'by', 'can', 'cannot', 'could', 'did', 'do', 'does',
            'doing', 'done', 'down', 'during', 'each', 'either', 'else', 'elsewhere',
            'enough', 'even', 'ever', 'every', 'everyone', 'everything', 'everywhere',
            'except', 'few', 'for', 'former', 'formerly', 'from', 'further', 'had', 'has',
            'have', 'having', 'he', 'hence', 'her', 'here', 'hers', 'herself', 'him',
            'himself', 'his', 'how', 'however', 'i', 'if', 'in', 'indeed', 'into', 'is',
            'it', 'its', 'itself', 'just', 'keep', 'keeps', 'kept', 'last', 'latter',
            'latterly', 'least', 'less', 'let', 'like', 'made', 'make', 'many', 'may',
            'maybe', 'me', 'meanwhile', 'might', 'mine', 'more', 'moreover', 'most',
            'mostly', 'much', 'must', 'my', 'myself', 'name', 'namely', 'neither', 'never',
            'nevertheless', 'next', 'no', 'nobody', 'none', 'noone', 'nor', 'not',
            'nothing', 'now', 'nowhere', 'of', 'off', 'often', 'on', 'once', 'one', 'only',
            'onto', 'or', 'other', 'others', 'otherwise', 'our', 'ours', 'ourselves',
            'out', 'over', 'own', 'part', 'per', 'perhaps', 'please', 'put', 'quite',
            'rather', 'really', 'regarding', 'said', 'same', 'say', 'see', 'seem',
            'seemed', 'seeming', 'seems', 'seen', 'several', 'shall', 'she', 'should',
            'since', 'so', 'some', 'somehow', 'someone', 'something', 'sometime',
            'sometimes', 'somewhere', 'still', 'such', 'than', 'that', 'the', 'their',
            'theirs', 'them', 'themselves', 'then', 'thence', 'there', 'thereafter',
            'thereby', 'therefore', 'therein', 'these', 'they', 'this', 'those', 'though',
            'through', 'throughout', 'thru', 'thus', 'to', 'together', 'too', 'toward',
            'towards', 'under', 'unless', 'until', 'up', 'upon', 'us', 'used', 'using',
            'various', 'very', 'via', 'was', 'we', 'well', 'were', 'what', 'whatever',
            'when', 'whence', 'whenever', 'where', 'whereafter', 'whereas', 'whereby',
            'wherein', 'whereupon', 'wherever', 'whether', 'which', 'while', 'whither',
            'who', 'whoever', 'whole', 'whom', 'whose', 'why', 'will', 'with', 'within',
            'without', 'would', 'yes', 'yet', 'you', 'your', 'yours', 'yourself', 'yourselves'
        }

    def extract_from_url(self, url: str) -> Tuple[str, Dict]:
        """
        Extract visible text and metadata from a URL.

        Args:
            url: The URL to extract content from

        Returns:
            Tuple of (main_text, metadata_dict)
        """
        try:
            # Add timeout and headers to avoid blocking
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(url, timeout=10, headers=headers)
            response.raise_for_status()

            # Parse HTML
            soup = BeautifulSoup(response.content, 'html.parser')

            # Extract metadata
            metadata = {
                'title': soup.title.string if soup.title else '',
                'meta_description': '',
                'h1': [],
                'h2': [],
                'h3': [],
                'url': url
            }

            # Get meta description
            meta_desc = soup.find('meta', {'name': 'description'})
            if meta_desc and meta_desc.get('content'):
                metadata['meta_description'] = meta_desc['content']

            # Get headings
            metadata['h1'] = [h.get_text(strip=True) for h in soup.find_all('h1')]
            metadata['h2'] = [h.get_text(strip=True) for h in soup.find_all('h2')]
            metadata['h3'] = [h.get_text(strip=True) for h in soup.find_all('h3')]

            # Use Trafilatura for better content extraction
            main_text = trafilatura.extract(response.content)

            # Fallback to BeautifulSoup if Trafilatura fails
            if not main_text:
                for element in soup(['script', 'style', 'nav', 'footer', 'aside']):
                    element.decompose()
                main = soup.find('main') or soup.find('article') or soup.find('body')
                if main:
                    main_text = main.get_text(separator=' ', strip=True)
                else:
                    main_text = soup.get_text(separator=' ', strip=True)

            return main_text, metadata

        except Exception as e:
            raise Exception(f"Error extracting URL content: {str(e)}")

    def preprocess_text(self, text: str, use_lemmatization: bool = True,
                       remove_stopwords: bool = True) -> Tuple[List[str], object]:
        """
        Preprocess text using spaCy NLP pipeline or fallback tokenization.

        Args:
            text: Input text to process
            use_lemmatization: Whether to lemmatize tokens
            remove_stopwords: Whether to remove stopwords

        Returns:
            Tuple of (token_list, spacy_doc or None)
        """
        if SPACY_AVAILABLE and self.nlp:
            # Process with spaCy
            doc = self.nlp(text.lower())

            tokens = []
            for token in doc:
                # Skip punctuation and whitespace
                if token.is_punct or token.is_space:
                    continue

                # Optionally skip stopwords
                if remove_stopwords and token.text in self.stopwords:
                    continue

                # Use lemma or raw text
                if use_lemmatization:
                    tokens.append(token.lemma_)
                else:
                    tokens.append(token.text)

            return tokens, doc
        else:
            # Fallback: Simple tokenization
            import re
            # Remove punctuation and split on whitespace
            text = text.lower()
            words = re.findall(r'\b[a-z]+\b', text)

            tokens = []
            for word in words:
                if remove_stopwords and word in self.stopwords:
                    continue
                tokens.append(word)

            return tokens, None

    def generate_ngrams(self, tokens: List[str], n: int) -> List[str]:
        """
        Generate n-grams from token list.

        Args:
            tokens: List of tokens
            n: Size of n-grams (1 for unigrams, 2 for bigrams, etc.)

        Returns:
            List of n-gram strings
        """
        ngrams = []
        for i in range(len(tokens) - n + 1):
            ngram = ' '.join(tokens[i:i+n])
            ngrams.append(ngram)
        return ngrams

    def calculate_densities(self, freq_dict: Counter, total_words: int,
                          top_n: int = 50) -> List[Dict]:
        """
        Calculate keyword density percentages.

        Args:
            freq_dict: Counter object with keyword frequencies
            total_words: Total word count
            top_n: Number of top keywords to return

        Returns:
            List of dictionaries with term, count, and density
        """
        results = []
        for term, count in freq_dict.most_common(top_n):
            density = round((count / total_words * 100), 2) if total_words > 0 else 0
            results.append({
                'term': term,
                'count': count,
                'density': density,
                'status': self._get_density_status(density)
            })
        return results

    def _get_density_status(self, density: float) -> str:
        """
        Determine color-coded status based on density percentage.

        Args:
            density: Density percentage

        Returns:
            Status string: 'optimal', 'caution', 'warning', or 'critical'
        """
        if density > 5:
            return 'critical'  # Red - keyword stuffing
        elif density > 3:
            return 'warning'   # Orange - over-optimization
        elif density > 2.5:
            return 'caution'   # Yellow - approaching high
        else:
            return 'optimal'   # Green - good usage

    def generate_recommendations(self, single_words: List[Dict],
                                total_words: int) -> Dict[str, List[Dict]]:
        """
        Generate actionable SEO recommendations based on keyword analysis.

        Args:
            single_words: List of single-word keyword data
            total_words: Total word count

        Returns:
            Dictionary with critical, warnings, and opportunities lists
        """
        recommendations = {
            'critical': [],
            'warnings': [],
            'opportunities': []
        }

        for item in single_words[:20]:  # Analyze top 20 keywords
            density = item['density']
            term = item['term']
            count = item['count']

            if density > 5:  # Critical over-optimization
                target_count = int(total_words * 0.025)  # Target 2.5%
                recommendations['critical'].append({
                    'keyword': term,
                    'issue': 'Keyword stuffing detected',
                    'current': f"{count} times ({density}%)",
                    'action': f"Reduce to {target_count} occurrences (2.5%)",
                    'tip': 'Use synonyms and related terms to avoid over-optimization'
                })

            elif density > 3:  # Warning zone
                target_count = int(total_words * 0.02)  # Target 2%
                recommendations['warnings'].append({
                    'keyword': term,
                    'issue': 'Approaching over-optimization',
                    'current': f"{count} times ({density}%)",
                    'action': f"Consider reducing to {target_count} occurrences (2%)",
                    'tip': 'Use keyword variations and LSI keywords'
                })

            elif 0.5 <= density <= 2.5:  # Optimal range
                recommendations['opportunities'].append({
                    'keyword': term,
                    'status': 'Good keyword usage',
                    'current': f"{count} times ({density}%)",
                    'suggestion': 'Maintain current usage - this is optimal',
                    'tip': 'Consider adding to subheadings for better prominence'
                })

        return recommendations

    def analyze_meta_tags(self, metadata: Dict, keywords: List[str]) -> Dict:
        """
        Analyze keyword presence in meta tags and headings.

        Args:
            metadata: Dictionary with title, meta_description, headings, etc.
            keywords: List of top keywords to check

        Returns:
            Dictionary with meta tag analysis
        """
        analysis = {
            'title': {'present': [], 'missing': [], 'text': metadata.get('title', '')},
            'meta_description': {'present': [], 'missing': [], 'text': metadata.get('meta_description', '')},
            'h1': {'present': [], 'missing': [], 'count': len(metadata.get('h1', []))},
            'h2': {'present': [], 'missing': [], 'count': len(metadata.get('h2', []))},
            'h3': {'present': [], 'missing': [], 'count': len(metadata.get('h3', []))},
            'url': {'present': [], 'missing': [], 'text': metadata.get('url', '')},
            'recommendations': []
        }

        # Check top 5 keywords
        top_keywords = keywords[:5] if len(keywords) >= 5 else keywords

        for kw in top_keywords:
            keyword = kw.lower()

            # Check title
            if keyword in metadata.get('title', '').lower():
                analysis['title']['present'].append(keyword)
            else:
                analysis['title']['missing'].append(keyword)

            # Check meta description
            meta_desc = metadata.get('meta_description', '')
            if isinstance(meta_desc, str) and keyword in meta_desc.lower():
                analysis['meta_description']['present'].append(keyword)
            else:
                analysis['meta_description']['missing'].append(keyword)

            # Check H1 tags
            h1_texts = ' '.join(metadata.get('h1', [])).lower()
            if keyword in h1_texts:
                analysis['h1']['present'].append(keyword)
            else:
                analysis['h1']['missing'].append(keyword)

            # Check H2 tags
            h2_texts = ' '.join(metadata.get('h2', [])).lower()
            if keyword in h2_texts:
                analysis['h2']['present'].append(keyword)
            else:
                analysis['h2']['missing'].append(keyword)

            # Check H3 tags
            h3_texts = ' '.join(metadata.get('h3', [])).lower()
            if keyword in h3_texts:
                analysis['h3']['present'].append(keyword)

            # Check URL
            if keyword in metadata.get('url', '').lower():
                analysis['url']['present'].append(keyword)
            else:
                analysis['url']['missing'].append(keyword)

        # Generate meta recommendations
        if not analysis['title']['text']:
            analysis['recommendations'].append({
                'type': 'critical',
                'issue': 'Missing title tag',
                'action': 'Add a descriptive title tag with primary keywords'
            })
        elif not analysis['title']['present']:
            analysis['recommendations'].append({
                'type': 'warning',
                'issue': 'No keywords in title tag',
                'action': 'Include primary keywords in title for better SEO'
            })

        if not analysis['meta_description']['text']:
            analysis['recommendations'].append({
                'type': 'warning',
                'issue': 'Missing meta description',
                'action': 'Add meta description with keywords (150-160 characters)'
            })

        if analysis['h1']['count'] == 0:
            analysis['recommendations'].append({
                'type': 'critical',
                'issue': 'Missing H1 tag',
                'action': 'Add an H1 heading with primary keywords'
            })
        elif analysis['h1']['count'] > 1:
            analysis['recommendations'].append({
                'type': 'warning',
                'issue': f'Multiple H1 tags ({analysis["h1"]["count"]})',
                'action': 'Use only one H1 tag per page for better SEO'
            })

        return analysis

    def calculate_prominence_score(self, keyword: str, text: str, metadata: Dict) -> Dict:
        """
        Calculate keyword prominence score based on position weighting.

        Position weights:
        - Title Tag: 10x
        - H1: 8x
        - First 100 words: 7x
        - H2/H3: 6x
        - URL slug: 5x
        - Meta Description: 4x
        - Body content: 1x

        Args:
            keyword: The keyword to analyze
            text: Main body text
            metadata: Meta tags and headings

        Returns:
            Dictionary with prominence score and breakdown
        """
        keyword_lower = keyword.lower()
        score = 0
        breakdown = {}

        # Title tag (10x)
        title_count = metadata.get('title', '').lower().count(keyword_lower)
        breakdown['title'] = {'count': title_count, 'weight': 10, 'score': title_count * 10}
        score += title_count * 10

        # H1 tags (8x)
        h1_text = ' '.join(metadata.get('h1', [])).lower()
        h1_count = h1_text.count(keyword_lower)
        breakdown['h1'] = {'count': h1_count, 'weight': 8, 'score': h1_count * 8}
        score += h1_count * 8

        # First 100 words (7x)
        words = text.split()[:100]
        first_100 = ' '.join(words).lower()
        first_100_count = first_100.count(keyword_lower)
        breakdown['first_100_words'] = {'count': first_100_count, 'weight': 7, 'score': first_100_count * 7}
        score += first_100_count * 7

        # H2/H3 tags (6x)
        h2_text = ' '.join(metadata.get('h2', [])).lower()
        h3_text = ' '.join(metadata.get('h3', [])).lower()
        h2_h3_count = h2_text.count(keyword_lower) + h3_text.count(keyword_lower)
        breakdown['h2_h3'] = {'count': h2_h3_count, 'weight': 6, 'score': h2_h3_count * 6}
        score += h2_h3_count * 6

        # URL slug (5x)
        url_count = metadata.get('url', '').lower().count(keyword_lower)
        breakdown['url'] = {'count': url_count, 'weight': 5, 'score': url_count * 5}
        score += url_count * 5

        # Meta description (4x)
        meta_desc = metadata.get('meta_description', '')
        if isinstance(meta_desc, str):
            meta_count = meta_desc.lower().count(keyword_lower)
        else:
            meta_count = 0
        breakdown['meta_description'] = {'count': meta_count, 'weight': 4, 'score': meta_count * 4}
        score += meta_count * 4

        # Body content (1x) - excluding first 100 words
        body_remainder = ' '.join(text.split()[100:]).lower()
        body_count = body_remainder.count(keyword_lower)
        breakdown['body'] = {'count': body_count, 'weight': 1, 'score': body_count * 1}
        score += body_count * 1

        return {
            'keyword': keyword,
            'total_score': score,
            'breakdown': breakdown,
            'rating': self._get_prominence_rating(score)
        }

    def _get_prominence_rating(self, score: int) -> str:
        """Get prominence rating based on score."""
        if score >= 50:
            return 'Excellent'
        elif score >= 30:
            return 'Good'
        elif score >= 15:
            return 'Fair'
        elif score >= 5:
            return 'Poor'
        else:
            return 'Very Poor'

    def compare_with_competitor(self, your_analysis: Dict, competitor_url: str) -> Dict:
        """
        Compare your content with a competitor's content.

        Args:
            your_analysis: Your content analysis results
            competitor_url: Competitor URL to analyze

        Returns:
            Comparison results with gaps and recommendations
        """
        try:
            # Analyze competitor
            competitor_text, competitor_metadata = self.extract_from_url(competitor_url)
            competitor_analysis = self.analyze(competitor_text, use_lemmatization=True, remove_stopwords=True)

            # Compare metrics
            comparison = {
                'your_stats': {
                    'total_words': your_analysis['total_words'],
                    'unique_words': your_analysis['unique_words'],
                    'top_keyword': your_analysis['single_words'][0] if your_analysis['single_words'] else None
                },
                'competitor_stats': {
                    'total_words': competitor_analysis['total_words'],
                    'unique_words': competitor_analysis['unique_words'],
                    'top_keyword': competitor_analysis['single_words'][0] if competitor_analysis['single_words'] else None
                },
                'keyword_gaps': [],
                'opportunities': [],
                'advantages': []
            }

            # Find keyword gaps (keywords competitor has that you don't)
            your_keywords = {item['term']: item for item in your_analysis['single_words'][:30]}
            competitor_keywords = {item['term']: item for item in competitor_analysis['single_words'][:30]}

            for term, data in competitor_keywords.items():
                if term not in your_keywords and data['density'] > 1:
                    comparison['keyword_gaps'].append({
                        'keyword': term,
                        'competitor_count': data['count'],
                        'competitor_density': data['density'],
                        'your_count': 0,
                        'recommendation': f"Consider adding '{term}' - competitor uses it {data['count']} times"
                    })

            # Find opportunities (keywords you underuse compared to competitor)
            for term in your_keywords:
                if term in competitor_keywords:
                    your_density = your_keywords[term]['density']
                    comp_density = competitor_keywords[term]['density']

                    if comp_density > your_density * 1.5 and comp_density <= 3:
                        comparison['opportunities'].append({
                            'keyword': term,
                            'your_density': your_density,
                            'competitor_density': comp_density,
                            'recommendation': f"Increase usage of '{term}' to match competitor"
                        })
                    elif your_density > comp_density * 1.5:
                        comparison['advantages'].append({
                            'keyword': term,
                            'your_density': your_density,
                            'competitor_density': comp_density,
                            'note': f"You use '{term}' more effectively than competitor"
                        })

            # Limit results
            comparison['keyword_gaps'] = sorted(comparison['keyword_gaps'],
                                              key=lambda x: x['competitor_density'],
                                              reverse=True)[:10]
            comparison['opportunities'] = sorted(comparison['opportunities'],
                                                key=lambda x: x['competitor_density'],
                                                reverse=True)[:10]
            comparison['advantages'] = sorted(comparison['advantages'],
                                             key=lambda x: x['your_density'],
                                             reverse=True)[:10]

            return comparison

        except Exception as e:
            return {
                'error': f"Failed to analyze competitor: {str(e)}"
            }

    def analyze(self, text: str, use_lemmatization: bool = True,
               remove_stopwords: bool = True, metadata: Dict = None,
               calculate_prominence: bool = False) -> Dict:
        """
        Perform comprehensive keyword density analysis.

        Args:
            text: Text to analyze
            use_lemmatization: Whether to use lemmatization
            remove_stopwords: Whether to remove stopwords
            metadata: Optional metadata for meta tag analysis
            calculate_prominence: Whether to calculate prominence scores

        Returns:
            Dictionary with complete analysis results
        """
        # Preprocess text
        tokens, doc = self.preprocess_text(text, use_lemmatization, remove_stopwords)
        total_words = len(tokens)

        if total_words == 0:
            return {
                'error': 'No valid words found in text',
                'total_words': 0
            }

        # Generate n-grams
        unigrams = tokens
        bigrams = self.generate_ngrams(tokens, 2)
        trigrams = self.generate_ngrams(tokens, 3)
        fourgrams = self.generate_ngrams(tokens, 4)

        # Calculate frequencies
        unigram_freq = Counter(unigrams)
        bigram_freq = Counter(bigrams)
        trigram_freq = Counter(trigrams)
        fourgram_freq = Counter(fourgrams)

        # Calculate densities
        results = {
            'total_words': total_words,
            'unique_words': len(unigram_freq),
            'single_words': self.calculate_densities(unigram_freq, total_words),
            'two_word_phrases': self.calculate_densities(bigram_freq, total_words),
            'three_word_phrases': self.calculate_densities(trigram_freq, total_words),
            'four_word_phrases': self.calculate_densities(fourgram_freq, total_words),
        }

        # Generate recommendations
        results['recommendations'] = self.generate_recommendations(
            results['single_words'], total_words
        )

        # Phase 2: Meta tag analysis
        if metadata:
            top_keywords = [item['term'] for item in results['single_words'][:5]]
            results['meta_analysis'] = self.analyze_meta_tags(metadata, top_keywords)

        # Phase 2: Prominence scoring for top keywords
        if calculate_prominence and metadata:
            results['prominence_scores'] = []
            for item in results['single_words'][:5]:
                prominence = self.calculate_prominence_score(item['term'], text, metadata)
                results['prominence_scores'].append(prominence)

        return results


# Initialize analyzer
analyzer = KeywordDensityAnalyzer()


@app.route('/')
def index():
    """Render the main application page."""
    return render_template('index.html')


@app.route('/api/analyze', methods=['POST'])
def analyze_endpoint():
    """
    API endpoint for keyword density analysis.

    Accepts JSON with:
        - source_type: 'url' or 'text'
        - content: URL or text content
        - use_lemmatization: boolean (optional, default True)
        - remove_stopwords: boolean (optional, default True)

    Returns:
        JSON with analysis results or error
    """
    try:
        data = request.json

        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400

        source_type = data.get('source_type', 'text')
        content = data.get('content', '')
        use_lemmatization = data.get('use_lemmatization', True)
        remove_stopwords = data.get('remove_stopwords', True)

        if not content:
            return jsonify({'success': False, 'error': 'No content provided'}), 400

        # Extract content based on source type
        metadata = {}
        if source_type == 'url':
            text, metadata = analyzer.extract_from_url(content)
        else:
            text = content

        # Validate text length
        if len(text) < 50:
            return jsonify({
                'success': False,
                'error': 'Content too short. Minimum 50 characters required.'
            }), 400

        if len(text) > 500000:  # 500K character limit
            return jsonify({
                'success': False,
                'error': 'Content too long. Maximum 500,000 characters allowed.'
            }), 400

        # Phase 2: Check if advanced features are requested
        calculate_prominence = data.get('calculate_prominence', source_type == 'url')

        # Perform analysis with Phase 2 features
        results = analyzer.analyze(
            text,
            use_lemmatization,
            remove_stopwords,
            metadata=metadata if metadata else None,
            calculate_prominence=calculate_prominence
        )

        if 'error' in results:
            return jsonify({'success': False, 'error': results['error']}), 400

        # Add metadata if available
        results['metadata'] = metadata

        return jsonify({'success': True, 'results': results})

    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Analysis failed: {str(e)}'
        }), 500


@app.route('/api/export-csv', methods=['POST'])
def export_csv():
    """
    Export analysis results to CSV format.

    Accepts JSON with analysis results.
    Returns CSV file download.
    """
    try:
        data = request.json
        results = data.get('results', {})

        # Create CSV in memory
        output = io.StringIO()
        writer = csv.writer(output)

        # Write headers
        writer.writerow(['Keyword/Phrase', 'Type', 'Count', 'Density %', 'Status'])

        # Write single words
        for item in results.get('single_words', []):
            writer.writerow([
                item['term'],
                '1-word',
                item['count'],
                item['density'],
                item['status']
            ])

        # Write 2-word phrases
        for item in results.get('two_word_phrases', []):
            writer.writerow([
                item['term'],
                '2-word',
                item['count'],
                item['density'],
                item['status']
            ])

        # Write 3-word phrases
        for item in results.get('three_word_phrases', []):
            writer.writerow([
                item['term'],
                '3-word',
                item['count'],
                item['density'],
                item['status']
            ])

        # Write 4-word phrases
        for item in results.get('four_word_phrases', []):
            writer.writerow([
                item['term'],
                '4-word',
                item['count'],
                item['density'],
                item['status']
            ])

        # Prepare file for download
        output.seek(0)
        return send_file(
            io.BytesIO(output.getvalue().encode('utf-8')),
            mimetype='text/csv',
            as_attachment=True,
            download_name='keyword-density-analysis.csv'
        )

    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Export failed: {str(e)}'
        }), 500


@app.route('/api/compare-competitor', methods=['POST'])
def compare_competitor():
    """
    Compare your content with a competitor's content.

    Accepts JSON with:
        - your_content: Your text content or URL
        - competitor_url: Competitor's URL to analyze
        - source_type: 'url' or 'text' for your content

    Returns:
        JSON with comparison results
    """
    try:
        data = request.json

        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400

        your_content = data.get('your_content', '')
        competitor_url = data.get('competitor_url', '')
        source_type = data.get('source_type', 'text')

        if not your_content or not competitor_url:
            return jsonify({
                'success': False,
                'error': 'Both your_content and competitor_url are required'
            }), 400

        # Analyze your content
        if source_type == 'url':
            your_text, your_metadata = analyzer.extract_from_url(your_content)
        else:
            your_text = your_content
            your_metadata = {}

        your_analysis = analyzer.analyze(your_text, use_lemmatization=True, remove_stopwords=True)

        # Compare with competitor
        comparison = analyzer.compare_with_competitor(your_analysis, competitor_url)

        if 'error' in comparison:
            return jsonify({'success': False, 'error': comparison['error']}), 400

        return jsonify({'success': True, 'comparison': comparison})

    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Comparison failed: {str(e)}'
        }), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
