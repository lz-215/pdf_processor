# PDF Processor Backend Service

This is a Node.js backend service for the PDF Processor application that handles communication with the Claude AI API for text summarization.

## Features

- Securely stores API keys on the server side
- Handles requests to Claude AI API
- Provides a RESTful API for the frontend
- Includes error handling and logging
- CORS support for frontend integration

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   CLAUDE_API_KEY=your_api_key_here
   CLAUDE_API_URL=https://api.anthropic.com/v1/messages
   CLAUDE_MODEL=claude-3-sonnet-20240229
   CORS_ORIGIN=http://localhost:5500
   ```

   Note: Replace `your_api_key_here` with your actual Claude API key and adjust the CORS_ORIGIN to match your frontend URL.

## Running the server

Development mode (with auto-restart):
```
npm run dev
```

Production mode:
```
npm start
```

## API Endpoints

### GET /api/health
Health check endpoint to verify the server is running.

**Response:**
```json
{
  "status": "ok"
}
```

### POST /api/summarize
Endpoint to summarize text using Claude AI.

**Request Body:**
```json
{
  "text": "Text to be summarized..."
}
```

**Response:**
```json
{
  "summary": "Generated summary..."
}
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- 400 Bad Request: Missing or invalid parameters
- 500 Internal Server Error: Server-side issues or Claude API errors

Error responses include details about what went wrong to aid in debugging.

## Implementation Notes

- The server uses Express.js for handling HTTP requests
- CORS is configured to only allow requests from the specified origin
- The request payload limit is set to 10MB to handle large texts
- All API keys are stored securely in environment variables 