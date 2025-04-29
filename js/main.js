// Add event listener for the summarize button
document.getElementById('summarizeBtn').addEventListener('click', async () => {
    try {
        // First perform OCR to get the text
        const extractedText = await performOCR(currentFile);
        
        // Show the extracted text in the result area
        document.getElementById('textResult').textContent = extractedText;
        
        // Show loading state for summarization
        document.getElementById('textResult').textContent = 'Generating summary...';
        
        // Perform summarization
        const summary = await summarizeText(extractedText);
        
        // Show the summary in the result area
        document.getElementById('textResult').textContent = summary;
        
        // Show success notification
        showNotification('Summary generated successfully!');
    } catch (error) {
        console.error('Summarization process failed:', error);
        document.getElementById('textResult').textContent = `Failed to generate summary: ${error.message}`;
    }
}); 