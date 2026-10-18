import io
import re
import pypdf
from docx import Document

def extract_text(file):
    """
    Extracts plain text from an uploaded file (PDF, DOCX, or TXT).
    Operates entirely in-memory using io.BytesIO.
    """
    if file is None:
        return ""

    filename = getattr(file, 'filename', '').lower()
    try:
        file_content = file.read()
    except Exception as e:
        print(f"[ERROR] Failed to read file content for {filename}: {e}", flush=True)
        return ""

    try:
        if filename.endswith('.pdf'):
            pdf_reader = pypdf.PdfReader(io.BytesIO(file_content))
            text = "".join([page.extract_text() + "\n" for page in pdf_reader.pages if page.extract_text()])
            return text.strip()
        elif filename.endswith('.docx'):
            doc = Document(io.BytesIO(file_content))
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            return text.strip()
        elif filename.endswith('.txt'):
            return file_content.decode('utf-8', errors='ignore').strip()
    except Exception as e:
        print(f"[ERROR] Extraction error for {filename}: {e}", flush=True)
        return ""
    return ""

def parse_email(text):
    """
    Extracts the first valid email address found in the text using regex.
    """
    if not text:
        return None
    match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
    return match.group(0) if match else None
