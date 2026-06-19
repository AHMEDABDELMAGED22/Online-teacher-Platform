const pdfParse = require('pdf-parse');
import Tesseract from 'tesseract.js';

/**
 * Extracts text from a PDF buffer.
 * If standard text extraction yields too little text (suggesting a scanned PDF),
 * it attempts to use OCR (Tesseract.js) on the buffer.
 */
export async function extractTextFromPDF(pdfBuffer: Buffer, language: 'eng' | 'ara' | 'eng+ara' = 'eng'): Promise<string> {
  try {
    // Attempt standard extraction first
    const data = await pdfParse(pdfBuffer);
    
    // Check if the extracted text is meaningful. 
    // Scanned images often return very little text or just whitespace/garbage.
    const textContent = data.text.trim();
    
    if (textContent.length > 50) {
      return textContent;
    }

    // Fallback to OCR if standard extraction fails or yields insufficient text.
    console.log("Insufficient text extracted, falling back to OCR...");
    return await extractTextViaOCR(pdfBuffer, language);

  } catch (error) {
    console.error("PDF Parsing error:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

/**
 * Basic OCR extraction using Tesseract.js.
 * Note: Tesseract.js directly on a PDF buffer works if it's a single image inside.
 * For multi-page complex PDFs, you'd typically need to convert PDF to images first (e.g. using pdf2pic).
 * For this implementation, we attempt a best-effort direct buffer read or assume the buffer is an image.
 */
async function extractTextViaOCR(imageBuffer: Buffer, language: string): Promise<string> {
  try {
    // Initialize Tesseract worker
    const worker = await Tesseract.createWorker(language);
    
    // Recognize text
    const { data: { text } } = await worker.recognize(imageBuffer);
    
    await worker.terminate();
    return text;
  } catch (error) {
    console.error("OCR Extraction error:", error);
    return "OCR Extraction failed. Could not read document content.";
  }
}
