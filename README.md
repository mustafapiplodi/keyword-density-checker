# Keyword Density Checker

A modern, comprehensive keyword density checker web application for SEO content optimization. Analyzes content for keyword usage patterns, provides actionable recommendations, and helps avoid keyword stuffing while maintaining optimal SEO practices.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.9+-blue.svg)
![Flask](https://img.shields.io/badge/flask-3.0-green.svg)

## Features

### Core Functionality
- ✅ **Multi-source Analysis**: Analyze text input or URL content
- ✅ **N-gram Analysis**: 1-word, 2-word, 3-word, and 4-word phrase detection
- ✅ **Accurate Calculations**: Precise keyword density percentages
- ✅ **Color-coded Indicators**: Visual status for optimal, caution, warning, and critical densities
- ✅ **Smart Recommendations**: Actionable SEO suggestions with specific targets
- ✅ **Stop Word Filtering**: Toggle-able English stop word removal
- ✅ **Lemmatization**: Optional word normalization for better accuracy
- ✅ **CSV Export**: Download complete analysis results
- ✅ **Responsive Design**: Mobile-friendly interface

### Analysis Features
- **Total Word Count**: Accurate tokenized word counting
- **Unique Keywords**: Deduplicated term identification
- **Density Status**:
  - 🟢 Green (0.5-2.5%): Optimal usage
  - 🟡 Yellow (2.5-3%): Caution zone
  - 🟠 Orange (3-5%): Over-optimization warning
  - 🔴 Red (>5%): Keyword stuffing detected

### Recommendations System
- ❌ **Critical Issues**: Keyword stuffing detection with reduction targets
- ⚠️ **Warnings**: Over-optimization alerts with suggestions
- ✓ **Opportunities**: Optimal usage confirmation and enhancement tips

## Technology Stack

### Backend
- **Flask 3.0**: Lightweight Python web framework
- **spaCy 3.7**: Industrial-strength NLP library
- **BeautifulSoup4**: HTML parsing and content extraction
- **Trafilatura**: Advanced boilerplate removal
- **Requests**: HTTP library for URL fetching

### Frontend
- **HTML5/CSS3**: Semantic markup with responsive design
- **Vanilla JavaScript**: No framework dependencies
- **Modern CSS**: Grid, Flexbox, CSS variables
- **RESTful API**: JSON-based communication

## Installation

### Prerequisites
- Python 3.9 or higher
- pip (Python package manager)
- Virtual environment (recommended)

### Step 1: Clone the Repository
```bash
git clone https://github.com/mustafapiplodi/keyword-density-checker.git
cd keyword-density-checker
```

### Step 2: Create Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Download spaCy Language Model
```bash
python -m spacy download en_core_web_sm
```

## Usage

### Starting the Application

#### Development Mode
```bash
python app.py
```

The application will start on `http://localhost:5000`

#### Production Mode
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Using the Tool

1. **Choose Input Method**:
   - Click "Text Input" tab to paste content directly
   - Click "URL Input" tab to analyze a published webpage

2. **Configure Options**:
   - Toggle "Remove stop words" to filter common words
   - Toggle "Use lemmatization" for word normalization

3. **Analyze Content**:
   - Click "Analyze Content" button
   - Wait for processing (typically 2-5 seconds)

4. **Review Results**:
   - **Summary Dashboard**: Quick overview of total words, unique keywords, top keyword
   - **Recommendations Panel**: Critical issues, warnings, and opportunities
   - **Results Tables**: Detailed keyword analysis with density percentages
   - Use tabs to view 1-word, 2-word, 3-word, and 4-word phrases

5. **Export Data**:
   - Click "Export CSV" to download complete analysis results

## API Documentation

### POST /api/analyze

Analyze content for keyword density.

**Request Body:**
```json
{
  "source_type": "text",
  "content": "Your content here...",
  "remove_stopwords": true,
  "use_lemmatization": true
}
```

**Parameters:**
- `source_type` (string): Either "text" or "url"
- `content` (string): Text content or URL to analyze
- `remove_stopwords` (boolean, optional): Remove English stop words (default: true)
- `use_lemmatization` (boolean, optional): Use lemmatization (default: true)

**Response:**
```json
{
  "success": true,
  "results": {
    "total_words": 1547,
    "unique_words": 342,
    "single_words": [...],
    "two_word_phrases": [...],
    "three_word_phrases": [...],
    "four_word_phrases": [...],
    "recommendations": {
      "critical": [...],
      "warnings": [...],
      "opportunities": [...]
    },
    "metadata": {
      "title": "Page Title",
      "meta_description": "...",
      "h1": [...],
      "h2": [...],
      "url": "..."
    }
  }
}
```

## Project Structure

```
keyword-density-checker/
├── app.py                      # Flask application and analyzer logic
├── requirements.txt            # Python dependencies
├── README.md                   # This file
├── implementation.md           # Detailed implementation guide
├── keyword density research.md # Research documentation
├── static/
│   ├── css/
│   │   └── style.css          # Application styles
│   └── js/
│       └── app.js             # Frontend JavaScript
└── templates/
    └── index.html             # Main HTML template
```

## SEO Best Practices

### Optimal Keyword Density
- **Primary Keywords**: 0.5-2.5% density
- **Secondary Keywords**: 0.3-1.5% density
- **Avoid**: Densities above 3% (over-optimization risk)
- **Critical Threshold**: 5%+ indicates keyword stuffing

### Recommendations
1. **Natural Writing**: Write for humans first, optimize for search engines second
2. **Semantic Variations**: Use synonyms and related terms instead of exact repetition
3. **Keyword Placement**: Prioritize titles, headings, and first paragraph
4. **Content Quality**: Focus on comprehensive topic coverage over density targets
5. **Modern SEO**: Google's algorithms prioritize semantic understanding and user intent

## Development

### Running Tests
```bash
# Install test dependencies
pip install pytest pytest-cov

# Run tests
pytest tests/

# Run with coverage
pytest --cov=app tests/
```

### Code Quality
```bash
# Format code with black
black app.py

# Lint with flake8
flake8 app.py

# Type checking with mypy
mypy app.py
```

## Performance Optimization

The application includes several optimizations:
- **Efficient NLP**: spaCy's Cython-based implementation
- **Smart Parsing**: Trafilatura for accurate content extraction
- **Client-side Export**: CSV generation in browser for speed
- **Responsive UI**: Progressive disclosure and lazy loading
- **Error Handling**: Comprehensive validation and error messages

## Troubleshooting

### Common Issues

**Issue**: spaCy model not found
```bash
# Solution: Download the model
python -m spacy download en_core_web_sm
```

**Issue**: URL analysis fails
- Check internet connectivity
- Verify URL is publicly accessible
- Some websites may block automated requests

**Issue**: Analysis too slow
- Reduce content length (optimal: 500-5000 words)
- Disable lemmatization for faster processing
- Consider upgrading to larger server for production

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Advanced Features

### ✅ Implemented Features
- ✅ **Competitor Analysis**: Compare your content against competitor URLs
- ✅ **Batch Competitor Analysis**: Analyze multiple competitors simultaneously (up to 20)
- ✅ **TF-IDF Scoring**: Semantic relevance analysis across documents
- ✅ **Keyword Prominence Analysis**: Position-weighted scoring (title, H1, first 100 words, meta tags, URL)
- ✅ **Target Keyword Optimization**: Comprehensive optimization scoring (0-100) with actionable recommendations
- ✅ **Readability Metrics**: Flesch Reading Ease, Flesch-Kincaid Grade, Gunning Fog, SMOG Index
- ✅ **Content Structure Analysis**: Headings hierarchy, paragraphs, links, images analysis
- ✅ **Keyword Clustering**: Semantic grouping of related keywords
- ✅ **Meta Tag Analysis**: Title, meta description, heading tag optimization checks
- ✅ **PDF & CSV Export**: Professional reports with charts and recommendations

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact: support@example.com
- Documentation: https://docs.example.com

## Acknowledgments

Built with insights from:
- SEO industry best practices (2024-2025)
- Google's BERT and MUM algorithm research
- Modern NLP techniques and spaCy library
- User experience principles for web applications

---

**Built for SEO professionals, content creators, and digital marketers who demand accurate, actionable keyword analysis.**
