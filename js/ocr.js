/**
 * PDF Processor - OCR Module (Simplified Version)
 * Uses PDF.js for basic text extraction and simplified rendering
 */

/**
 * Performs text extraction on a PDF file with minimal OCR
 * @param {File} file - The PDF file to process
 * @returns {Promise<string>} - Promise resolving to extracted text
 */
async function performOCR(file) {
    try {
        // Basic file validation
        if (!file || file.type !== 'application/pdf') {
            throw new Error('Not a valid PDF file');
        }
        
        // Read the file as a data URL for simplicity
        const dataUrl = await readFileAsDataURL(file);
        
        // Initialize PDF.js worker if needed
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
        }
        
        // Create a temporary iframe to render PDF (avoids canvas and memory issues)
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        
        try {
            // Use fetch to load the PDF data directly from the data URL
            const response = await fetch(dataUrl);
            const pdfData = await response.arrayBuffer();
            
            // Load the PDF document with minimal options
            const loadingTask = pdfjsLib.getDocument({
                data: pdfData,
                disableFontFace: true,
                nativeImageDecoderSupport: 'none'
            });
            
            const pdf = await loadingTask.promise;
            
            // Limit to a reasonable number of pages
            const pageLimit = Math.min(pdf.numPages, 10);
            let extractedText = '';
            
            // Process each page for text only (no OCR)
            for (let i = 1; i <= pageLimit; i++) {
                try {
                    // Get page
                    const page = await pdf.getPage(i);
                    
                    // Extract text directly - simpler approach with less memory usage
                    const textContent = await page.getTextContent();
                    
                    // Process text items to preserve formatting
                    let pageText = '';
                    let lastY = null;
                    
                    for (const item of textContent.items) {
                        // Check if we need to add a line break
                        if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
                            pageText += '\n';
                        }
                        lastY = item.transform[5];
                        
                        // Add the text with its original spacing
                        pageText += item.str;
                    }
                    
                    // Add the page text with a line break between pages
                    extractedText += pageText + '\n\n';
                    
                    // Free up resources
                    page.cleanup();
                    
                } catch (pageError) {
                    console.error(`Error extracting text from page ${i}:`, pageError);
                }
                
                // Give the browser some breathing room between pages
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            // Cleanup
            pdf.destroy();
            
            // Return the extracted text with preserved formatting
            return extractedText.trim() || "No text could be extracted from this PDF.";
            
        } catch (pdfError) {
            console.error("PDF processing error:", pdfError);
            throw pdfError;
        } finally {
            // Clean up the iframe
            if (iframe && iframe.parentNode) {
                iframe.parentNode.removeChild(iframe);
            }
        }
    } catch (error) {
        console.error("PDF extraction failed:", error);
        return `Failed to extract text from PDF: ${error.message}`;
    }
}

/**
 * Reads a file as a data URL
 * @param {File} file - The file to read
 * @returns {Promise<string>} - Promise resolving to file contents as data URL
 */
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            resolve(e.target.result);
        };
        
        reader.onerror = (e) => {
            reject(new Error(`Error reading file: ${e.target.error}`));
        };
        
        reader.readAsDataURL(file);
    });
}

/**
 * Reads a file as an ArrayBuffer (kept for compatibility)
 * @param {File} file - The file to read
 * @returns {Promise<ArrayBuffer>} - Promise resolving to file contents as ArrayBuffer
 */
function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            resolve(e.target.result);
        };
        
        reader.onerror = (e) => {
            reject(new Error(`Error reading file: ${e.target.error}`));
        };
        
        reader.readAsArrayBuffer(file);
    });
}

/**
 * Shows a notification message
 * @param {string} message - The message to show
 */
function showNotification(message) {
    console.log("PDF Processor:", message);
} 