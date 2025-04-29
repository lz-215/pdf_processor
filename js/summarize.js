/**
 * PDF Processor - Summarization Module
 * Uses backend service for text summarization
 */

const BACKEND_URL = 'http://localhost:3001';

/**
 * Summarizes text using backend service
 * @param {string} text - The text to summarize
 * @returns {Promise<string>} - Promise resolving to the summary
 */
async function summarizeText(text) {
    try {
        // First check if backend is available
        const isBackendAvailable = await checkBackendConnection();
        if (!isBackendAvailable) {
            console.warn('Backend service unavailable, using fallback summarization');
            return localSummarize(text);
        }

        // Use the backend service for summarization
        const response = await fetch(`${BACKEND_URL}/api/summarize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });

        // Process the response
        const data = await response.json();
        
        if (!response.ok) {
            console.error('Backend error:', data);
            throw new Error(data.details || data.error || 'Failed to generate summary');
        }

        return data.summary;
    } catch (error) {
        console.warn('Backend summarization failed, using fallback:', error);
        // Fallback to local summarization
        return localSummarize(text);
    }
}

/**
 * Checks if the backend service is available
 * @returns {Promise<boolean>} - Promise resolving to true if backend is available
 */
async function checkBackendConnection() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/health`, {
            method: 'GET',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.ok;
    } catch (error) {
        console.error('Backend health check failed:', error);
        return false;
    }
}

/**
 * Fallback local summarization method
 * @param {string} text - The text to summarize
 * @returns {string} - The summary
 */
function localSummarize(text) {
    try {
        // Split text into sentences with better punctuation handling
        const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
        
        // Calculate target length (50% of original text maximum)
        const targetLength = Math.floor(text.length * 0.5);
        
        // Split text into words and count frequencies, ignoring common words
        const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        const wordFrequencies = {};
        words.forEach(word => {
            if (!commonWords.has(word)) {
                wordFrequencies[word] = (wordFrequencies[word] || 0) + 1;
            }
        });

        // Calculate sentence scores based on multiple factors
        const sentenceScores = sentences.map(sentence => {
            const wordsInSentence = sentence.toLowerCase().match(/\b\w+\b/g) || [];
            
            // Calculate frequency score (importance of words)
            const frequencyScore = wordsInSentence.reduce((sum, word) => {
                return sum + (wordFrequencies[word] || 0);
            }, 0);
            
            // Calculate position score (sentences at start/end are often important)
            const positionScore = sentences.indexOf(sentence) === 0 || 
                               sentences.indexOf(sentence) === sentences.length - 1 ? 2 : 1;
            
            // Calculate length score (normalized)
            const lengthScore = Math.min(sentence.length / 50, 3);
            
            return { 
                sentence, 
                score: (frequencyScore * 2 + positionScore + lengthScore),
                length: sentence.length,
                position: sentences.indexOf(sentence)
            };
        });

        // Sort sentences by score
        const sortedSentences = sentenceScores.sort((a, b) => b.score - a.score);

        // Select sentences until we reach target length
        let currentLength = 0;
        const selectedSentences = [];
        
        for (const item of sortedSentences) {
            if (currentLength + item.length <= targetLength) {
                selectedSentences.push({
                    text: item.sentence.trim(),
                    position: item.position
                });
                currentLength += item.length;
            }
        }

        // If we haven't selected any sentences, take at least the top 3
        if (selectedSentences.length === 0) {
            selectedSentences.push(...sortedSentences.slice(0, 3).map(item => ({
                text: item.sentence.trim(),
                position: item.position
            })));
        }

        // Sort selected sentences by original position to maintain context
        selectedSentences.sort((a, b) => a.position - b.position);

        // Group sentences into paragraphs (every 3-4 sentences)
        const paragraphs = [];
        let paragraph = [];
        
        selectedSentences.forEach((item, index) => {
            paragraph.push(item.text);
            
            // Start new paragraph every 3-4 sentences or if it's the last sentence
            if (paragraph.length >= 3 || index === selectedSentences.length - 1) {
                paragraphs.push(paragraph.join(' '));
                paragraph = [];
            }
        });

        // Format the summary with paragraphs
        const summary = `📝 Summary\n\n${paragraphs.join('\n\n')}`;

        return summary || "No significant content found to summarize.";
    } catch (error) {
        console.error('Local summarization failed:', error);
        return `Summary could not be generated. Extracted text: ${text.substring(0, 500)}...`;
    }
}

/**
 * Shows a notification message
 * @param {string} message - The message to show
 */
function showNotification(message) {
    console.log("PDF Processor:", message);
} 