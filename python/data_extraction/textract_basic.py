import os
import sys
import boto3
import cv2
import fitz  # PyMuPDF
import pandas as pd
from PIL import Image
from dotenv import load_dotenv
from langchain_core.documents import Document
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.units import inch
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables from .env file
load_dotenv()

# AWS credentials from environment variables
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_REGION = os.getenv('AWS_REGION', 'us-east-1')

if not AWS_ACCESS_KEY_ID or not AWS_SECRET_ACCESS_KEY:
    logger.error("AWS credentials not found in .env file")
    sys.exit(1)

# Initialize AWS Textract client
textract = boto3.client(
    'textract',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
)

def extract_img_content(img_path):
    """Extract text from image using AWS Textract"""
    logger.info(f"Processing image: {img_path}")
    
    try:
        # Read image file
        with open(img_path, 'rb') as image_file:
            img_bytes = image_file.read()
        
        # Call Textract
        response = textract.detect_document_text(Document={'Bytes': img_bytes})
        
        # Extract text
        text = []
        for item in response['Blocks']:
            if item['BlockType'] == 'LINE':
                text.append(item['Text'])
        
        return text
    except Exception as e:
        logger.error(f"Error extracting text from image: {e}")
        return []

def extract_word_content(word_path):
    """Extract content from Word document"""
    logger.info(f"Processing Word document: {word_path}")
    
    try:
        result = ""
        doc = fitz.open(word_path)
        for page in doc:
            tabs = page.find_tables()
            if len(tabs.tables) > 0:
                for i in range(len(tabs.tables)):
                    result += tabs[i].to_markdown()
            else:
                result += page.get_text()
        
        lc_doc = Document(page_content=result, metadata={"source": "Document docx"})
        return lc_doc
    except Exception as e:
        logger.error(f"Error extracting text from Word document: {e}")
        return Document(page_content="", metadata={"source": "Error"})

def extract_pdf_content(pdf_path):
    """Extract content from PDF file"""
    logger.info(f"Processing PDF: {pdf_path}")
    
    try:
        doc = fitz.open(pdf_path)
        result = ""
        for page in doc:
            tabs = page.find_tables()
            if len(tabs.tables) > 0:
                for i in range(len(tabs.tables)):
                    result += tabs[i].to_markdown()
            else:
                result += page.get_text()
        
        lc_doc = Document(page_content=result, metadata={"source": "Document pdf"})
        return lc_doc
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")
        return Document(page_content="", metadata={"source": "Error"})

def extract_excel_content(excel_path):
    """Extract content from Excel file"""
    logger.info(f"Processing Excel: {excel_path}")
    
    try:
        result = ""
        df = pd.read_excel(excel_path)
        result += df.to_markdown()
        lc_doc = Document(page_content=result, metadata={"source": "Document excel"})
        return lc_doc
    except Exception as e:
        logger.error(f"Error extracting content from Excel: {e}")
        return Document(page_content="", metadata={"source": "Error"})

def create_pdf_from_text(text_content, output_pdf_path):
    """Create PDF file from extracted text"""
    logger.info(f"Creating PDF at: {output_pdf_path}")
    
    try:
        doc = SimpleDocTemplate(
            output_pdf_path,
            pagesize=letter,
            rightMargin=72, leftMargin=72,
            topMargin=72, bottomMargin=72
        )
        
        styles = getSampleStyleSheet()
        story = []
        
        if isinstance(text_content, list):
            # Handle list of strings (from image extraction)
            for line in text_content:
                if line.strip():  # Skip empty lines
                    story.append(Paragraph(line, styles["Normal"]))
                    story.append(Paragraph("<br/><br/>", styles["Normal"]))
        else:
            # Handle Document object
            content = text_content.page_content
            paragraphs = content.split('\n')
            for para in paragraphs:
                if para.strip():  # Skip empty paragraphs
                    story.append(Paragraph(para, styles["Normal"]))
                    story.append(Paragraph("<br/>", styles["Normal"]))
        
        doc.build(story)
        logger.info(f"PDF created successfully")
        return True
    except Exception as e:
        logger.error(f"Error creating PDF: {e}")
        return False

def process_file(input_path, output_pdf_path):
    """Process a file based on its extension and create PDF output"""
    _, ext = os.path.splitext(input_path.lower())
    
    if ext in ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif']:
        content = extract_img_content(input_path)
        return create_pdf_from_text(content, output_pdf_path)
    elif ext == '.docx':
        content = extract_word_content(input_path)
        return create_pdf_from_text(content, output_pdf_path)
    elif ext == '.pdf':
        content = extract_pdf_content(input_path)
        return create_pdf_from_text(content, output_pdf_path)
    elif ext in ['.xlsx', '.xls']:
        content = extract_excel_content(input_path)
        return create_pdf_from_text(content, output_pdf_path)
    else:
        logger.error(f"Unsupported file format: {ext}")
        return False

def process_directory(input_dir, output_dir):
    """Process all supported files in a directory"""
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    processed_count = 0
    for filename in os.listdir(input_dir):
        input_path = os.path.join(input_dir, filename)
        if os.path.isfile(input_path):
            name, ext = os.path.splitext(filename)
            output_path = os.path.join(output_dir, f"{name}.pdf")
            if process_file(input_path, output_path):
                processed_count += 1
    
    logger.info(f"Processed {processed_count} files")
    return processed_count

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Convert images and documents to PDF using AWS Textract')
    parser.add_argument('input', help='Input file or directory path')
    parser.add_argument('--output', help='Output file or directory path')
    
    args = parser.parse_args()
    
    input_path = args.input
    
    if os.path.isfile(input_path):
        # Process a single file
        if args.output:
            output_path = args.output
        else:
            name, _ = os.path.splitext(input_path)
            output_path = f"{name}_output.pdf"
        
        if process_file(input_path, output_path):
            logger.info(f"Successfully created PDF: {output_path}")
        else:
            logger.error("Failed to create PDF")
    
    elif os.path.isdir(input_path):
        # Process a directory
        if args.output:
            output_dir = args.output
        else:
            output_dir = os.path.join(input_path, "pdf_output")
        
        count = process_directory(input_path, output_dir)
        logger.info(f"Created {count} PDFs in {output_dir}")
    
    else:
        logger.error(f"Input path does not exist: {input_path}")