from flask import Flask, request, jsonify, render_template, send_file
from flask_cors import CORS
import spacy
from bs4 import BeautifulSoup
import requests
from collections import Counter
import trafilatura
import io
import csv
import math
import concurrent.futures
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

    def extract_from_url(self, url: str) -> Tuple[str, Dict, str]:
        """
        Extract visible text, metadata, and HTML from a URL.

        Args:
            url: The URL to extract content from

        Returns:
            Tuple of (main_text, metadata_dict, html_content)
        """
        try:
            # Add timeout and headers to avoid blocking
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(url, timeout=10, headers=headers)
            response.raise_for_status()

            # Store HTML for structure analysis
            html_content = response.text

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

            return main_text, metadata, html_content

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
            competitor_text, competitor_metadata, _ = self.extract_from_url(competitor_url)
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

    def calculate_readability_scores(self, text: str) -> Dict:
        """
        Calculate multiple readability metrics.

        Returns:
            Dictionary with readability scores
        """
        import re

        # Clean text
        clean_text = re.sub(r'\s+', ' ', text).strip()

        # Count sentences
        sentences = re.split(r'[.!?]+', clean_text)
        sentences = [s.strip() for s in sentences if s.strip()]
        num_sentences = len(sentences)

        # Count words
        words = re.findall(r'\b[a-zA-Z]+\b', clean_text)
        num_words = len(words)

        # Count syllables
        def count_syllables(word):
            word = word.lower()
            count = 0
            vowels = 'aeiouy'
            if word[0] in vowels:
                count += 1
            for index in range(1, len(word)):
                if word[index] in vowels and word[index - 1] not in vowels:
                    count += 1
            if word.endswith('e'):
                count -= 1
            if count == 0:
                count += 1
            return count

        num_syllables = sum(count_syllables(word) for word in words)

        # Count complex words (3+ syllables)
        complex_words = [word for word in words if count_syllables(word) >= 3]
        num_complex_words = len(complex_words)

        # Avoid division by zero
        if num_sentences == 0 or num_words == 0:
            return {
                'error': 'Not enough content for readability analysis'
            }

        # Calculate metrics
        avg_sentence_length = num_words / num_sentences
        avg_syllables_per_word = num_syllables / num_words
        avg_word_length = sum(len(word) for word in words) / num_words

        # Flesch Reading Ease (0-100, higher = easier)
        flesch_reading_ease = 206.835 - (1.015 * avg_sentence_length) - (84.6 * avg_syllables_per_word)
        flesch_reading_ease = max(0, min(100, flesch_reading_ease))  # Clamp to 0-100

        # Flesch-Kincaid Grade Level
        flesch_kincaid_grade = (0.39 * avg_sentence_length) + (11.8 * avg_syllables_per_word) - 15.59
        flesch_kincaid_grade = max(0, flesch_kincaid_grade)

        # Gunning Fog Index
        percent_complex = (num_complex_words / num_words) * 100
        gunning_fog = 0.4 * (avg_sentence_length + percent_complex)

        # SMOG Index (requires 30+ sentences ideally)
        if num_sentences >= 30:
            smog_index = 1.0430 * math.sqrt(num_complex_words * (30 / num_sentences)) + 3.1291
        else:
            smog_index = 1.0430 * math.sqrt(num_complex_words) + 3.1291

        # Interpret Flesch Reading Ease
        if flesch_reading_ease >= 90:
            reading_level = "Very Easy (5th grade)"
        elif flesch_reading_ease >= 80:
            reading_level = "Easy (6th grade)"
        elif flesch_reading_ease >= 70:
            reading_level = "Fairly Easy (7th grade)"
        elif flesch_reading_ease >= 60:
            reading_level = "Standard (8th-9th grade)"
        elif flesch_reading_ease >= 50:
            reading_level = "Fairly Difficult (10th-12th grade)"
        elif flesch_reading_ease >= 30:
            reading_level = "Difficult (College)"
        else:
            reading_level = "Very Difficult (College graduate)"

        return {
            'flesch_reading_ease': round(flesch_reading_ease, 2),
            'flesch_kincaid_grade': round(flesch_kincaid_grade, 2),
            'gunning_fog_index': round(gunning_fog, 2),
            'smog_index': round(smog_index, 2),
            'reading_level': reading_level,
            'statistics': {
                'total_sentences': num_sentences,
                'total_words': num_words,
                'total_syllables': num_syllables,
                'complex_words': num_complex_words,
                'avg_sentence_length': round(avg_sentence_length, 2),
                'avg_syllables_per_word': round(avg_syllables_per_word, 2),
                'avg_word_length': round(avg_word_length, 2)
            },
            'recommendations': self._generate_readability_recommendations(
                flesch_reading_ease, avg_sentence_length, percent_complex
            )
        }

    def _generate_readability_recommendations(self, flesch_score, avg_sentence_length, percent_complex):
        """Generate readability improvement suggestions."""
        recommendations = []

        if flesch_score < 60:
            recommendations.append({
                'type': 'readability',
                'severity': 'warning',
                'message': 'Content may be too difficult for general audience',
                'suggestion': 'Aim for Flesch score of 60+ by using shorter sentences and simpler words'
            })

        if avg_sentence_length > 20:
            recommendations.append({
                'type': 'sentence_length',
                'severity': 'warning',
                'message': f'Average sentence length ({avg_sentence_length:.1f} words) is high',
                'suggestion': 'Break long sentences into shorter ones (aim for 15-20 words)'
            })

        if percent_complex > 15:
            recommendations.append({
                'type': 'vocabulary',
                'severity': 'info',
                'message': f'{percent_complex:.1f}% of words are complex (3+ syllables)',
                'suggestion': 'Consider using simpler alternatives where possible'
            })

        return recommendations

    def analyze_content_structure(self, text: str, html: str = None) -> Dict:
        """
        Analyze content structure including headings, paragraphs, links, images.

        Args:
            text: Plain text content
            html: Optional HTML content for advanced analysis

        Returns:
            Dictionary with structure analysis
        """
        import re
        from bs4 import BeautifulSoup

        structure = {
            'paragraphs': {},
            'sentences': {},
            'links': {},
            'images': {},
            'headings': {},
            'multimedia': {}
        }

        # Paragraph analysis
        paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
        paragraph_lengths = [len(p.split()) for p in paragraphs]

        if paragraph_lengths:
            structure['paragraphs'] = {
                'total': len(paragraphs),
                'avg_words': round(sum(paragraph_lengths) / len(paragraph_lengths), 2),
                'min_words': min(paragraph_lengths),
                'max_words': max(paragraph_lengths),
                'short_paragraphs': len([p for p in paragraph_lengths if p < 50]),
                'long_paragraphs': len([p for p in paragraph_lengths if p > 150])
            }

        # Sentence analysis
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        sentence_lengths = [len(s.split()) for s in sentences]

        if sentence_lengths:
            short_sentences = len([s for s in sentence_lengths if s <= 10])
            medium_sentences = len([s for s in sentence_lengths if 10 < s <= 20])
            long_sentences = len([s for s in sentence_lengths if s > 20])

            structure['sentences'] = {
                'total': len(sentences),
                'avg_words': round(sum(sentence_lengths) / len(sentence_lengths), 2),
                'short': short_sentences,
                'medium': medium_sentences,
                'long': long_sentences,
                'variety_score': round((short_sentences + medium_sentences + long_sentences) / len(sentences) * 100, 2)
            }

        # HTML structure analysis
        if html:
            soup = BeautifulSoup(html, 'html.parser')

            # Heading analysis
            headings = {}
            for i in range(1, 7):
                h_tags = soup.find_all(f'h{i}')
                if h_tags:
                    headings[f'h{i}'] = {
                        'count': len(h_tags),
                        'texts': [h.get_text().strip() for h in h_tags][:5]  # First 5
                    }

            # Validate heading hierarchy
            heading_issues = []
            if 'h1' in headings and headings['h1']['count'] > 1:
                heading_issues.append('Multiple H1 tags found (should be one)')
            if 'h1' not in headings:
                heading_issues.append('No H1 tag found')

            structure['headings'] = {
                'data': headings,
                'issues': heading_issues,
                'total_headings': sum(h['count'] for h in headings.values())
            }

            # Link analysis
            links = soup.find_all('a', href=True)
            internal_links = []
            external_links = []

            for link in links:
                href = link.get('href', '')
                if href.startswith('http://') or href.startswith('https://'):
                    external_links.append(href)
                elif href.startswith('/') or not href.startswith('#'):
                    internal_links.append(href)

            structure['links'] = {
                'total': len(links),
                'internal': len(internal_links),
                'external': len(external_links),
                'external_urls': external_links[:10]  # First 10
            }

            # Image analysis
            images = soup.find_all('img')
            images_with_alt = [img for img in images if img.get('alt')]
            images_without_alt = len(images) - len(images_with_alt)

            structure['images'] = {
                'total': len(images),
                'with_alt': len(images_with_alt),
                'without_alt': images_without_alt,
                'alt_text_coverage': round(len(images_with_alt) / len(images) * 100, 2) if images else 0
            }

            # Multimedia detection
            videos = soup.find_all(['video', 'iframe'])
            video_count = len([v for v in videos if 'youtube' in str(v) or 'vimeo' in str(v) or v.name == 'video'])

            structure['multimedia'] = {
                'videos': video_count,
                'has_multimedia': video_count > 0 or len(images) > 0
            }

        return structure

    def calculate_tfidf(self, documents: List[str], keywords: List[str] = None) -> Dict:
        """
        Calculate TF-IDF scores for keywords across multiple documents.

        Args:
            documents: List of text documents to analyze
            keywords: Optional list of specific keywords to score

        Returns:
            Dictionary with TF-IDF scores for each keyword
        """
        if not documents:
            return {'error': 'No documents provided'}

        # Tokenize all documents
        all_tokens = []
        for doc_text in documents:
            tokens, _ = self.preprocess_text(doc_text, use_lemmatization=True, remove_stopwords=True)
            all_tokens.append(tokens)

        # Calculate document frequency (DF) for each term
        num_docs = len(documents)
        document_frequency = Counter()

        for tokens in all_tokens:
            unique_tokens = set(tokens)
            for token in unique_tokens:
                document_frequency[token] += 1

        # Calculate TF-IDF scores for the first document (your content)
        if not all_tokens or not all_tokens[0]:
            return {'error': 'No valid tokens found'}

        main_doc_tokens = all_tokens[0]
        total_terms = len(main_doc_tokens)
        term_frequency = Counter(main_doc_tokens)

        tfidf_scores = []

        # If specific keywords provided, only calculate for those
        terms_to_score = keywords if keywords else term_frequency.keys()

        for term in terms_to_score:
            if term not in term_frequency:
                continue

            # TF = (term count in document) / (total terms in document)
            tf = term_frequency[term] / total_terms

            # IDF = log(total documents / documents containing term)
            df = document_frequency.get(term, 1)
            idf = math.log(num_docs / df)

            # TF-IDF = TF × IDF
            tfidf = tf * idf

            tfidf_scores.append({
                'term': term,
                'tf': round(tf, 4),
                'idf': round(idf, 4),
                'tfidf': round(tfidf, 4),
                'count': term_frequency[term],
                'document_frequency': df,
                'uniqueness': 'high' if df == 1 else 'medium' if df <= num_docs / 2 else 'low'
            })

        # Sort by TF-IDF score
        tfidf_scores.sort(key=lambda x: x['tfidf'], reverse=True)

        return {
            'total_documents': num_docs,
            'scores': tfidf_scores[:50],  # Top 50 terms
            'analysis': {
                'unique_terms': len([s for s in tfidf_scores if s['uniqueness'] == 'high']),
                'common_terms': len([s for s in tfidf_scores if s['uniqueness'] == 'low']),
                'average_tfidf': round(sum(s['tfidf'] for s in tfidf_scores[:20]) / min(20, len(tfidf_scores)), 4) if tfidf_scores else 0
            }
        }

    def batch_competitor_analysis(self, your_content: str, competitor_urls: List[str],
                                  is_url: bool = False) -> Dict:
        """
        Analyze multiple competitor URLs and provide aggregated insights.

        Args:
            your_content: Your text content or URL
            competitor_urls: List of competitor URLs (max 20)
            is_url: Whether your_content is a URL

        Returns:
            Dictionary with batch analysis results
        """
        if not competitor_urls:
            return {'error': 'No competitor URLs provided'}

        if len(competitor_urls) > 20:
            return {'error': 'Maximum 20 competitor URLs allowed'}

        # Extract your content
        try:
            if is_url:
                your_text, your_metadata, _ = self.extract_from_url(your_content)
            else:
                your_text = your_content
                your_metadata = {}

            your_analysis = self.analyze(your_text, use_lemmatization=True, remove_stopwords=True)
        except Exception as e:
            return {'error': f'Failed to analyze your content: {str(e)}'}

        # Analyze competitors concurrently
        competitor_results = []
        failed_urls = []

        def analyze_competitor_url(url):
            try:
                comp_text, comp_metadata, _ = self.extract_from_url(url)
                comp_analysis = self.analyze(comp_text, use_lemmatization=True, remove_stopwords=True)
                return {
                    'url': url,
                    'analysis': comp_analysis,
                    'metadata': comp_metadata,
                    'success': True
                }
            except Exception as e:
                return {
                    'url': url,
                    'error': str(e),
                    'success': False
                }

        # Use thread pool for concurrent fetching (max 5 concurrent)
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            future_to_url = {executor.submit(analyze_competitor_url, url): url for url in competitor_urls}

            for future in concurrent.futures.as_completed(future_to_url):
                result = future.result()
                if result['success']:
                    competitor_results.append(result)
                else:
                    failed_urls.append(result)

        if not competitor_results:
            return {
                'error': 'All competitor analyses failed',
                'failed_urls': failed_urls
            }

        # Aggregate competitor data
        all_competitor_keywords = Counter()
        keyword_appearances = {}  # Track how many competitors use each keyword
        competitor_densities = {}  # Track densities across competitors

        for comp in competitor_results:
            for kw in comp['analysis']['single_words'][:30]:
                term = kw['term']
                all_competitor_keywords[term] += kw['count']

                if term not in keyword_appearances:
                    keyword_appearances[term] = 0
                    competitor_densities[term] = []

                keyword_appearances[term] += 1
                competitor_densities[term].append(kw['density'])

        # Find your keywords
        your_keywords = {kw['term']: kw for kw in your_analysis['single_words'][:30]}

        # Calculate keyword gaps (in many competitors but not yours)
        keyword_gaps = []
        for term, appearances in keyword_appearances.items():
            if term not in your_keywords and appearances >= len(competitor_results) * 0.5:
                avg_density = sum(competitor_densities[term]) / len(competitor_densities[term])
                keyword_gaps.append({
                    'keyword': term,
                    'competitor_count': appearances,
                    'avg_density': round(avg_density, 2),
                    'importance_score': round(appearances * avg_density, 2)
                })

        keyword_gaps.sort(key=lambda x: x['importance_score'], reverse=True)

        # Find common keywords (in all/most competitors)
        common_keywords = []
        for term, appearances in keyword_appearances.items():
            if appearances >= len(competitor_results) * 0.7:  # In 70%+ of competitors
                avg_density = sum(competitor_densities[term]) / len(competitor_densities[term])
                your_density = your_keywords.get(term, {}).get('density', 0)

                common_keywords.append({
                    'keyword': term,
                    'competitor_count': appearances,
                    'avg_competitor_density': round(avg_density, 2),
                    'your_density': round(your_density, 2),
                    'gap': round(avg_density - your_density, 2)
                })

        common_keywords.sort(key=lambda x: abs(x['gap']), reverse=True)

        # Find your unique strengths
        your_strengths = []
        for term, kw_data in your_keywords.items():
            if term not in keyword_appearances or keyword_appearances[term] < len(competitor_results) * 0.3:
                your_strengths.append({
                    'keyword': term,
                    'your_density': kw_data['density'],
                    'competitor_usage': keyword_appearances.get(term, 0)
                })

        your_strengths.sort(key=lambda x: x['your_density'], reverse=True)

        # Calculate TF-IDF scores across all documents
        all_documents = [your_text] + [comp['analysis'].get('text', '') for comp in competitor_results if 'text' in comp['analysis']]

        # If we don't have the raw text, use keywords as proxy
        if len(all_documents) == 1:
            all_documents = []

        tfidf_result = {}
        if all_documents and len(all_documents) > 1:
            top_keywords = [kw['term'] for kw in your_analysis['single_words'][:20]]
            tfidf_result = self.calculate_tfidf(all_documents, keywords=top_keywords)

        return {
            'success': True,
            'analyzed_competitors': len(competitor_results),
            'failed_competitors': len(failed_urls),
            'failed_urls': failed_urls,
            'keyword_gaps': keyword_gaps[:20],
            'common_keywords': common_keywords[:20],
            'your_unique_strengths': your_strengths[:15],
            'tfidf_scores': tfidf_result.get('scores', [])[:15] if tfidf_result else [],
            'summary': {
                'total_competitor_keywords': len(all_competitor_keywords),
                'gaps_identified': len(keyword_gaps),
                'common_keywords_found': len(common_keywords),
                'your_unique_keywords': len(your_strengths),
                'recommendation': self._generate_batch_recommendation(keyword_gaps, common_keywords, your_strengths)
            },
            'competitors': [
                {
                    'url': comp['url'],
                    'title': comp['metadata'].get('title', 'N/A'),
                    'total_words': comp['analysis']['total_words']
                }
                for comp in competitor_results
            ]
        }

    def _generate_batch_recommendation(self, gaps, common, strengths):
        """Generate strategic recommendation based on batch analysis."""
        rec = []

        if len(gaps) > 10:
            rec.append(f"⚠️ {len(gaps)} keyword gaps identified - competitors are targeting keywords you're missing")

        if len(common) > 5:
            top_gap = common[0] if common else None
            if top_gap and abs(top_gap['gap']) > 2:
                rec.append(f"🎯 Focus on '{top_gap['keyword']}' - used by {top_gap['competitor_count']} competitors with avg density {top_gap['avg_competitor_density']}%")

        if len(strengths) > 5:
            rec.append(f"✅ You have {len(strengths)} unique keywords - maintain this differentiation")

        return ' | '.join(rec) if rec else 'Your content is well-aligned with competitors'

    def analyze(self, text: str, use_lemmatization: bool = True,
               remove_stopwords: bool = True, metadata: Dict = None,
               calculate_prominence: bool = False,
               calculate_readability: bool = False,
               analyze_structure: bool = False,
               html_content: str = None) -> Dict:
        """
        Perform comprehensive keyword density analysis.

        Args:
            text: Text to analyze
            use_lemmatization: Whether to use lemmatization
            remove_stopwords: Whether to remove stopwords
            metadata: Optional metadata for meta tag analysis
            calculate_prominence: Whether to calculate prominence scores
            calculate_readability: Whether to calculate readability scores
            analyze_structure: Whether to analyze content structure
            html_content: Optional HTML content for structure analysis

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

        # Phase 5: Readability analysis
        if calculate_readability:
            readability = self.calculate_readability_scores(text)
            if 'error' not in readability:
                results['readability_scores'] = readability

        # Phase 5: Content structure analysis
        if analyze_structure and html_content:
            structure = self.analyze_content_structure(text, html_content)
            results['content_structure'] = structure

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
        html_content = None
        if source_type == 'url':
            text, metadata, html_content = analyzer.extract_from_url(content)
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

        # Phase 5: Check if readability and structure analysis are requested
        calculate_readability = data.get('calculate_readability', True)  # Default enabled
        analyze_structure = data.get('analyze_structure', source_type == 'url')

        # Perform analysis with all features
        results = analyzer.analyze(
            text,
            use_lemmatization,
            remove_stopwords,
            metadata=metadata if metadata else None,
            calculate_prominence=calculate_prominence,
            calculate_readability=calculate_readability,
            analyze_structure=analyze_structure,
            html_content=html_content
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
            your_text, your_metadata, _ = analyzer.extract_from_url(your_content)
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


@app.route('/api/tfidf-analysis', methods=['POST'])
def tfidf_analysis():
    """
    Calculate TF-IDF scores comparing your content against competitors.

    Accepts JSON with:
        - your_content: Your text or URL
        - competitor_urls: List of competitor URLs
        - source_type: 'url' or 'text'

    Returns:
        JSON with TF-IDF scores
    """
    try:
        data = request.json

        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400

        your_content = data.get('your_content', '')
        competitor_urls = data.get('competitor_urls', [])
        source_type = data.get('source_type', 'text')

        if not your_content:
            return jsonify({'success': False, 'error': 'Your content is required'}), 400

        if not competitor_urls:
            return jsonify({'success': False, 'error': 'At least one competitor URL required'}), 400

        # Extract your content
        if source_type == 'url':
            your_text, _, _ = analyzer.extract_from_url(your_content)
        else:
            your_text = your_content

        # Extract competitor content
        documents = [your_text]
        failed_urls = []

        for url in competitor_urls[:10]:  # Max 10 for TF-IDF
            try:
                comp_text, _, _ = analyzer.extract_from_url(url)
                documents.append(comp_text)
            except Exception as e:
                failed_urls.append({'url': url, 'error': str(e)})

        if len(documents) < 2:
            return jsonify({
                'success': False,
                'error': 'Failed to fetch competitor content'
            }), 400

        # Calculate TF-IDF
        tfidf_result = analyzer.calculate_tfidf(documents)

        if 'error' in tfidf_result:
            return jsonify({'success': False, 'error': tfidf_result['error']}), 400

        return jsonify({
            'success': True,
            'tfidf': tfidf_result,
            'documents_analyzed': len(documents),
            'failed_urls': failed_urls
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'TF-IDF analysis failed: {str(e)}'
        }), 500


@app.route('/api/batch-competitor-analysis', methods=['POST'])
def batch_competitor_analysis_endpoint():
    """
    Analyze multiple competitors at once and provide aggregated insights.

    Accepts JSON with:
        - your_content: Your text or URL
        - competitor_urls: List of 2-20 competitor URLs
        - source_type: 'url' or 'text'

    Returns:
        JSON with comprehensive batch analysis
    """
    try:
        data = request.json

        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400

        your_content = data.get('your_content', '')
        competitor_urls = data.get('competitor_urls', [])
        source_type = data.get('source_type', 'text')

        if not your_content:
            return jsonify({'success': False, 'error': 'Your content is required'}), 400

        if not competitor_urls or len(competitor_urls) < 2:
            return jsonify({
                'success': False,
                'error': 'At least 2 competitor URLs required'
            }), 400

        if len(competitor_urls) > 20:
            return jsonify({
                'success': False,
                'error': 'Maximum 20 competitor URLs allowed'
            }), 400

        # Perform batch analysis
        is_url = source_type == 'url'
        results = analyzer.batch_competitor_analysis(your_content, competitor_urls, is_url)

        if 'error' in results:
            return jsonify({'success': False, 'error': results['error']}), 400

        return jsonify(results)

    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Batch analysis failed: {str(e)}'
        }), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
