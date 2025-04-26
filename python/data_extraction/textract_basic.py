import os
import sys
import boto3
import cv2
import fitz  # PyMuPDF
import pandas as pd
from PIL import Image
from dotenv import load_dotenv
from langchain_core.documents import Document
from reportlab.lib.pagesizes import letter, LETTER
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table as RLTable, Preformatted
from reportlab.lib.units import inch
from reportlab.lib import colors
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables from .env
load_dotenv()

# AWS credentials from environment variables
AWS_ACCESS_KEY_ID='AKIASDTDX2LEVEWBVIXP'
AWS_SECRET_ACCESS_KEY='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'
AWS_DEFAULT_REGION='ap-northeast-1'
AWS_REGION='us-east-1'

if not AWS_ACCESS_KEY_ID or not AWS_SECRET_ACCESS_KEY:
    logger.error("AWS credentials not found in environment variables")
    sys.exit(1)

# Initialize AWS Textract client
textract = boto3.client(
    'textract',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
)

def extract_text_and_tables_to_pdf(
    image_bytes,
    story,
    styles
):
    """
    Uses AWS Textract to analyze image bytes for text and tables,
    appending Preformatted text and RLTable objects into the provided story list,
    preserving reading order, whitespace, and avoiding duplicate table text.
    """
    response = textract.analyze_document(
        Document={'Bytes': image_bytes},
        FeatureTypes=['TABLES', 'FORMS']
    )
    blocks = response['Blocks']

    # Build lookup for table cell IDs and bounding boxes
    table_blocks = [b for b in blocks if b['BlockType']=='TABLE']
    table_info = []
    for tbl in table_blocks:
        bbox = tbl['Geometry']['BoundingBox']
        cell_ids = []
        for rel in tbl.get('Relationships', []):
            if rel['Type']=='CHILD':
                cell_ids.extend(rel['Ids'])
        table_info.append({'id': tbl['Id'], 'bbox': bbox, 'cell_ids': cell_ids})

    # Gather LINE and TABLE entries with their vertical position
    items = []
    for b in blocks:
        if b['BlockType'] == 'LINE':
            items.append({'type': 'LINE', 'top': b['Geometry']['BoundingBox']['Top'], 'block': b})
        elif b['BlockType'] == 'TABLE':
            items.append({'type': 'TABLE', 'top': b['Geometry']['BoundingBox']['Top'], 'block': b})
    items.sort(key=lambda x: x['top'])

    table_counter = 0
    for item in items:
        if item['type'] == 'LINE':
            line_box = item['block']['Geometry']['BoundingBox']
            inside_table = any(
                tbl['bbox']['Top'] <= line_box['Top'] <= tbl['bbox']['Top'] + tbl['bbox']['Height']
                for tbl in table_info
            )
            if inside_table:
                continue
            # Preserve original formatting and whitespace
            text = item['block']['Text']
            story.append(Preformatted(text, styles['Code']))
            story.append(Spacer(1, 4))
        else:
            table_counter += 1
            tbl = item['block']
            cell_ids = next((t['cell_ids'] for t in table_info if t['id']==tbl['Id']), [])
            cell_blocks = [c for c in blocks if c['Id'] in cell_ids and c['BlockType']=='CELL']
            if not cell_blocks:
                continue
            max_row = max(c['RowIndex'] for c in cell_blocks)
            max_col = max(c['ColumnIndex'] for c in cell_blocks)
            table_data = [['' for _ in range(max_col)] for _ in range(max_row)]
            for cell in cell_blocks:
                r, c = cell['RowIndex']-1, cell['ColumnIndex']-1
                text = ''
                for rel in cell.get('Relationships', []):
                    if rel['Type']=='CHILD':
                        for wid in rel['Ids']:
                            word = next((w for w in blocks if w['Id']==wid and w['BlockType']=='WORD'), None)
                            if word:
                                text += word['Text'] + ' '
                table_data[r][c] = text.strip()

            story.append(Spacer(1, 8))
            story.append(Paragraph(f"Table {table_counter}", styles['Heading4']))
            rl_table = RLTable(table_data, hAlign='LEFT')
            rl_table.setStyle([
                ('GRID', (0,0), (-1,-1), 0.5, colors.black),
                ('BACKGROUND', (0,0), (-1,0), colors.lightgrey)
            ])
            story.append(rl_table)
            story.append(Spacer(1, 8))


def extract_img_content(img_path):
    """Extract text and tables from image and return story elements"""
    logger.info(f"Processing image: {img_path}")
    try:
        with open(img_path, 'rb') as image_file:
            img_bytes = image_file.read()
        styles = getSampleStyleSheet()
        story = []
        extract_text_and_tables_to_pdf(img_bytes, story, styles)
        return story, styles
    except Exception as e:
        logger.error(f"Error extracting content from image: {e}")
        return [], getSampleStyleSheet()

# Other extractors unchanged: extract_word_content, extract_pdf_content, extract_excel_content

def create_pdf_from_story(story, styles, output_pdf_path):
    logger.info(f"Creating PDF at: {output_pdf_path}")
    try:
        doc = SimpleDocTemplate(
            output_pdf_path,
            pagesize=letter,
            rightMargin=72, leftMargin=72,
            topMargin=72, bottomMargin=72
        )
        doc.build(story)
        logger.info("PDF created successfully")
        return True
    except Exception as e:
        logger.error(f"Error creating PDF: {e}")
        return False


def process_file(input_path, output_pdf_path):
    _, ext = os.path.splitext(input_path.lower())
    if ext in ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif']:
        story, styles = extract_img_content(input_path)
        return create_pdf_from_story(story, styles, output_pdf_path)
    # ... other branches call existing extract functions and wrap into story
    else:
        logger.error(f"Unsupported file format: {ext}")
        return False

if __name__ == "__main__":
    input_path = 'data_extraction/image.png'
    output = 'data_extraction/output.pdf'
    if os.path.isfile(input_path):
        output_path = output or f"{os.path.splitext(input_path)[0]}_output.pdf"
        if process_file(input_path, output_path):
            logger.info(f"Successfully created PDF: {output_path}")
        else:
            logger.error("Failed to create PDF")
    elif os.path.isdir(input_path):
        # output_dir = output or os.path.join(input_path, "pdf_output")
        # count = process_directory(input_path, output_dir)
        # logger.info(f"Created {count} PDFs in {output_dir}")
        print("Directory processing not implemented in this snippet.")
    else:
        logger.error(f"Input path does not exist: {input_path}")
