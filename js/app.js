/**
 * PDF Processor - Main Application Script
 * Handles PDF upload functionality and UI interactions
 */

// Initialize the PDF.js library
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

// DOM Elements
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('pdf-upload');
const fileInfo = document.getElementById('file-info');
const extractBtn = document.getElementById('extract-btn');
const summarizeBtn = document.getElementById('summarize-btn');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');
const copyTextBtn = document.getElementById('copy-text-btn');
const copySummaryBtn = document.getElementById('copy-summary-btn');

// State variables
let currentFile = null;
let extractedText = '';
let pdfSummary = '';
let isProcessing = false; 
let lastProcessTime = 0; // Track the last time a file was processed

// Event Listeners
document.addEventListener('DOMContentLoaded', initApp);

/**
 * Initialize the application
 */
function initApp() {
    // Set up the file upload listeners
    setupFileUpload();
    
    // Set up tab switching
    setupTabs();
    
    // Set up copy buttons
    setupCopyButtons();
}

/**
 * Set up file upload functionality (file input and drag & drop)
 */
function setupFileUpload() {
    // Instead of attaching the click event to the upload area, 
    // use a dedicated button inside the upload area
    const uploadBtn = document.querySelector('.upload-btn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            // Only trigger if enough time has passed since last action
            const now = Date.now();
            if (now - lastProcessTime > 1000) { // 1 second cooldown
                fileInput.click();
            }
        });
    }
    
    // File input change event
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop events - these are separate from click interactions
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleFileDrop);
    
    // Action buttons
    extractBtn.addEventListener('click', handleExtractText);
    summarizeBtn.addEventListener('click', handleSummarizeText);
}

/**
 * Handle file selection from the file input
 * @param {Event} event - Change event from file input
 */
function handleFileSelect(event) {
    // Prevent processing if already handling a file or if called too soon after last process
    const now = Date.now();
    if (isProcessing || (now - lastProcessTime < 1000)) {
        return;
    }
    
    isProcessing = true;
    lastProcessTime = now;
    
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
        processSelectedFile(file);
    } else if (file) {
        showError('Please select a valid PDF file.');
    }
    
    // Reset processing flag after a small delay
    setTimeout(() => {
        isProcessing = false;
    }, 500);
}

/**
 * Handle dragover event for the drop area
 * @param {Event} event - The dragover event
 */
function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    uploadArea.classList.add('active');
}

/**
 * Handle dragleave event for the drop area
 * @param {Event} event - The dragleave event
 */
function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    uploadArea.classList.remove('active');
}

/**
 * Handle file drop event
 * @param {Event} event - The drop event
 */
function handleFileDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    uploadArea.classList.remove('active');
    
    // Prevent processing if already handling a file or if called too soon after last process
    const now = Date.now();
    if (isProcessing || (now - lastProcessTime < 1000)) {
        return;
    }
    
    isProcessing = true;
    lastProcessTime = now;
    
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
        processSelectedFile(file);
    } else if (file) {
        showError('Please drop a valid PDF file.');
    }
    
    // Reset processing flag after a small delay
    setTimeout(() => {
        isProcessing = false;
    }, 500);
}

/**
 * Process the selected PDF file
 * @param {File} file - The selected PDF file
 */
function processSelectedFile(file) {
    // Clear the file input to ensure change events fire even if the same file is selected
    fileInput.value = '';
    
    currentFile = file;
    
    // Update file info display
    const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    fileInfo.innerHTML = `
        <p><strong>File:</strong> ${file.name}</p>
        <p><strong>Size:</strong> ${fileSizeInMB} MB</p>
        <p><strong>Type:</strong> ${file.type}</p>
    `;
    
    // Enable action buttons
    extractBtn.disabled = false;
    summarizeBtn.disabled = false;
    
    // Clear previous results
    document.getElementById('text-result').innerHTML = '<p class="placeholder-text">Click "Extract Text" to process this PDF</p>';
    document.getElementById('summary-result').innerHTML = '<p class="placeholder-text">Click "Summarize Content" to generate a summary</p>';
    
    // Reset copy buttons
    copyTextBtn.disabled = true;
    copySummaryBtn.disabled = true;
    
    // Show a preview notification
    showNotification('PDF file selected. Ready for processing.');
}

/**
 * Handle the Extract Text button click
 */
function handleExtractText() {
    if (!currentFile) {
        showError('Please select a PDF file first.');
        return;
    }
    
    // Show the extracted text tab
    switchTab('extracted-text');
    
    // Show loading indicator
    const loadingIndicator = document.querySelector('#extracted-text .loading-indicator');
    loadingIndicator.classList.remove('hidden');
    
    // We'll implement the actual OCR in ocr.js, but we'll call it from here
    if (typeof performOCR === 'function') {
        performOCR(currentFile)
            .then(text => {
                extractedText = text;
                displayExtractedText(text);
                copyTextBtn.disabled = false;
                loadingIndicator.classList.add('hidden');
            })
            .catch(error => {
                showError('Failed to extract text: ' + error.message);
                loadingIndicator.classList.add('hidden');
            });
    } else {
        // Fallback if OCR function is not yet implemented
        setTimeout(() => {
            extractedText = 'OCR functionality will be implemented in ocr.js.\n\nThis is placeholder text to demonstrate the UI.\n\nActual text extraction will work when the OCR module is complete.';
            displayExtractedText(extractedText);
            copyTextBtn.disabled = false;
            loadingIndicator.classList.add('hidden');
        }, 2000);
    }
}

/**
 * Handle the Summarize Content button click
 */
function handleSummarizeText() {
    if (!currentFile) {
        showError('Please select a PDF file first.');
        return;
    }
    
    // Show the summary tab
    switchTab('summary');
    
    // Show loading indicator
    const loadingIndicator = document.querySelector('#summary .loading-indicator');
    loadingIndicator.classList.remove('hidden');
    
    // First extract the text if not already done
    const extractPromise = extractedText ? 
        Promise.resolve(extractedText) : 
        (typeof performOCR === 'function' ? 
            performOCR(currentFile) : 
            Promise.resolve('Sample extracted text for summarization.'));
    
    extractPromise
        .then(text => {
            // We'll implement the actual summarization in summarizer.js
            if (typeof summarizeText === 'function') {
                return summarizeText(text);
            } else {
                // Fallback if summarize function is not yet implemented
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve('Summarization functionality will be implemented in summarizer.js.\n\nThis is a placeholder summary to demonstrate the UI.\n\nActual summarization will work when the summarization module is complete.');
                    }, 2000);
                });
            }
        })
        .then(summary => {
            pdfSummary = summary;
            displaySummary(summary);
            copySummaryBtn.disabled = false;
            loadingIndicator.classList.add('hidden');
        })
        .catch(error => {
            showError('Failed to generate summary: ' + error.message);
            loadingIndicator.classList.add('hidden');
        });
}

/**
 * Display the extracted text in the UI
 * @param {string} text - The extracted text to display
 */
function displayExtractedText(text) {
    const textResult = document.getElementById('text-result');
    textResult.textContent = text || 'No text could be extracted from this PDF.';
    if (!text) {
        textResult.classList.add('empty-result');
    } else {
        textResult.classList.remove('empty-result');
    }
}

/**
 * Display the summary in the UI
 * @param {string} summary - The summary to display
 */
function displaySummary(summary) {
    const summaryResult = document.getElementById('summary-result');
    summaryResult.textContent = summary || 'Could not generate a summary for this PDF.';
    if (!summary) {
        summaryResult.classList.add('empty-result');
    } else {
        summaryResult.classList.remove('empty-result');
    }
}

/**
 * Set up the tab switching functionality
 */
function setupTabs() {
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
}

/**
 * Switch to the specified tab
 * @param {string} tabId - The ID of the tab to switch to
 */
function switchTab(tabId) {
    // Update active tab button
    tabButtons.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Update active tab pane
    tabPanes.forEach(pane => {
        if (pane.id === tabId) {
            pane.classList.add('active');
        } else {
            pane.classList.remove('active');
        }
    });
}

/**
 * Set up copy buttons functionality
 */
function setupCopyButtons() {
    copyTextBtn.addEventListener('click', () => {
        copyToClipboard(extractedText, 'Extracted text copied to clipboard!');
    });
    
    copySummaryBtn.addEventListener('click', () => {
        copyToClipboard(pdfSummary, 'Summary copied to clipboard!');
    });
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @param {string} successMessage - Message to show on success
 */
function copyToClipboard(text, successMessage) {
    if (!text) return;
    
    // Create a temporary textarea element to copy from
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    
    textarea.select();
    try {
        document.execCommand('copy');
        showNotification(successMessage);
    } catch (err) {
        showError('Failed to copy text: ' + err.message);
    }
    
    document.body.removeChild(textarea);
}

/**
 * Show an error message to the user
 * @param {string} message - The error message to display
 */
function showError(message) {
    console.error(message);
    // In a full implementation, we would show a proper error notification
    alert(message);
}

/**
 * Show a notification message to the user
 * @param {string} message - The notification message to display
 */
function showNotification(message) {
    console.log(message);
    // In a full implementation, we would show a proper notification toast
    // For now, just log to console
}

// Add a class to indicate JS is loaded and running
document.body.classList.add('js-enabled'); 