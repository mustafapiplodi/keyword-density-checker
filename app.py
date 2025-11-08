from flask import Flask, request, jsonify, render_template, send_file
import spacy
from bs4 import BeautifulSoup
import requests
from collections import Counter
import trafilatura
import io
import csv
from typing import Dict, List, Tuple, Optional

app = Flask(__name__)

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

    def analyze(self, text: str, use_lemmatization: bool = True,
               remove_stopwords: bool = True) -> Dict:
        """
        Perform comprehensive keyword density analysis.

        Args:
            text: Text to analyze
            use_lemmatization: Whether to use lemmatization
            remove_stopwords: Whether to remove stopwords

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

        # Perform analysis
        results = analyzer.analyze(text, use_lemmatization, remove_stopwords)

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


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
