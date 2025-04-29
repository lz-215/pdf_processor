# PDF Processor

A web-based application for processing PDF documents with OCR and summarization capabilities.

## Features

- **PDF Content Extraction**: Extract text from PDF documents using OCR technology
- **PDF Summarization**: Generate concise summaries of PDF content
- **Independent Feature Usage**: Features can be used independently or together (summarization automatically extracts content first)

## Technology Stack

- HTML/CSS/JavaScript (Frontend)
- PDF.js for PDF rendering
- Tesseract.js for OCR functionality
- OpenAI API for text summarization

## Setup Instructions

1. Clone this repository
2. Open `index.html` in your browser to use the application locally
3. For OCR and summarization features, ensure you have an internet connection
4. For API-based features:
   - Navigate to the `backend` directory
   - Copy `.env.example` to `.env` and add your API keys
   - Run `npm install` to install backend dependencies
   - Start the backend server with `node server.js`

## Usage Instructions

### PDF Content Extraction
1. Click on "Upload PDF" button
2. Select a PDF file from your device
3. Click on "Extract Content" button
4. View the extracted text from your PDF

### PDF Summarization
1. Click on "Upload PDF" button
2. Select a PDF file from your device
3. Click on "Summarize PDF" button
4. View the summary of your PDF content

## Environment Configuration

The backend requires the following environment variables in a `.env` file:

- `PORT`: The port on which the backend server runs
- `CLAUDE_API_KEY`: Your Anthropic Claude API key
- `CLAUDE_API_URL`: The API endpoint for Claude
- `CLAUDE_MODEL`: The Claude model to use
- `CORS_ORIGIN`: The allowed origin for CORS

## Project Structure

```
PDF_processor/
├── index.html           # Main application page
├── css/                 # Stylesheet files
│   └── styles.css       # Main stylesheet
├── js/                  # JavaScript files
│   ├── app.js           # Main application logic
│   ├── ocr.js           # OCR functionality
│   └── summarizer.js    # Summarization functionality
├── backend/             # Backend server
│   ├── server.js        # API server
│   ├── .env.example     # Example environment variables
│   └── package.json     # Backend dependencies
├── vendor/              # Third-party libraries
│   ├── pdf.js/          # PDF.js library
│   └── tesseract.js/    # Tesseract.js for OCR
└── README.md            # Project documentation
```

## License

MIT 