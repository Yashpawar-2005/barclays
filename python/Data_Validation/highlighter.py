import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import boto3
import fitz  # PyMuPDF
import json
import re
import requests
import tempfile
from typing import List, Dict, Any, Tuple, Optional
import concurrent.futures
from config import *
from sqlalchemy import select,insert,update
from dotenv import load_dotenv
import datetime
# Load environment variables
load_dotenv()

def download_file_from_url(url,save_path):
    r = requests.get(url)
    if r.status_code!=200:
        raise Exception(f"Failed to download file {url}")
    with open(save_path,"wb") as f:
        f.write(r.content)


class PDFChunker:
    """Class to handle chunking of PDF documents."""
    
    def __init__(self, pdf_path: str, chunk_size: int = 800, overlap: int = 150):
        """
        Initialize the PDF chunker.
        
        Args:
            pdf_path: Path to the PDF file
            chunk_size: Maximum size of each chunk in characters
            overlap: Number of characters to overlap between chunks
        """
        self.pdf_path = pdf_path
        self.chunk_size = chunk_size
        self.overlap = overlap
        self.doc = fitz.open(pdf_path)
    
    def extract_text_with_positions(self) -> List[Dict[str, Any]]:
        """
        Extract text from PDF with position information.
        
        Returns:
            List of dictionaries containing text and position information
        """
        text_blocks = []
        
        for page_num, page in enumerate(self.doc):
            # Extract text with position information
            blocks = page.get_text("dict")['blocks']
            
            for block in blocks:
                if 'lines' in block:
                    for line in block['lines']:
                        for span in line['spans']:
                            text_blocks.append({
                                'text': span['text'],
                                'page': page_num,
                                'bbox': span['bbox'],  # [x0, y0, x1, y1]
                                'font': span['font'],
                                'size': span['size']
                            })
        
        return text_blocks
    
    def create_chunks(self) -> List[Dict[str, Any]]:
        """
        Create chunks from the PDF with position information.
        
        Returns:
            List of dictionaries containing chunked text with position information
        """
        text_blocks = self.extract_text_with_positions()
        chunks = []
        
        current_chunk = []
        current_text = ""
        current_blocks = []
        
        for block in text_blocks:
            # Add the current block to the current chunk
            current_blocks.append(block)
            current_text += block['text'] + " "
            
            # If we've reached the chunk size, create a new chunk
            if len(current_text) >= self.chunk_size:
                chunks.append({
                    'text': current_text,
                    'blocks': current_blocks,
                    'pages': sorted(set(b['page'] for b in current_blocks))
                })
                
                # Create overlap for the next chunk
                overlap_text = current_text[-self.overlap:]
                overlap_blocks = []
                overlap_len = 0
                
                # Find blocks that are part of the overlap
                for b in reversed(current_blocks):
                    if overlap_len < self.overlap:
                        overlap_blocks.insert(0, b)
                        overlap_len += len(b['text']) + 1
                    else:
                        break
                
                # Start the new chunk with the overlap
                current_text = overlap_text
                current_blocks = overlap_blocks
        
        # Add the last chunk if it's not empty
        if current_text:
            chunks.append({
                'text': current_text,
                'blocks': current_blocks,
                'pages': sorted(set(b['page'] for b in current_blocks))
            })
        
        return chunks
    
    def close(self):
        """Close the PDF document."""
        self.doc.close()


class LlamaDiscrepancyIdentifier:
    """Class to identify discrepancies in text using AWS Llama API."""
    
    def __init__(self, llama_url: Optional[str] = None):
        """
        Initialize the Llama discrepancy identifier.
        
        Args:
            llama_url: URL for the AWS Llama API (defaults to environment variable)
        """
        self.llama_url = llama_url or os.getenv("LLAMA_MODEL_URL")
        if not self.llama_url:
            raise ValueError("LLAMA_MODEL_URL environment variable not set")
    
    def create_prompt(self, chunk_text: str, termsheet_data: Dict[str, Any]) -> str:
        """
        Create a prompt for the LLM to identify discrepancies.
        
        Args:
            chunk_text: Text chunk from the PDF
            termsheet_data: Dictionary containing termsheet data
            
        Returns:
            Prompt string for the LLM
        """
        # Convert termsheet data to a readable format
        termsheet_str = json.dumps(termsheet_data, indent=2)
        
        prompt = f"""You are an expert in identifying discrepancies between legal documents. 

I will provide you with a chunk of text from a PDF document and data from a termsheet.
Your task is to identify any discrepancies between the text and the termsheet data.

For each discrepancy you find:
1. Extract the exact text from the PDF chunk that contains the discrepancy
2. Identify which termsheet field it relates to
3. Explain the discrepancy
4. Rate the severity from 1-10 (1 being minor, 10 being critical)

Respond with ONLY a JSON object in this exact format:
{{
    "discrepancies": [
        {{
            "text_to_highlight": "exact text from PDF that should be highlighted",
            "related_termsheet_field": "field name from termsheet",
            "termsheet_value": "value from termsheet",
            "document_value": "value found in document",
            "explanation": "brief explanation of the discrepancy",
            "severity": severity_score
        }}
    ]
}}

If no discrepancies are found, respond with: {{"discrepancies": []}}

Here's the chunk of text from the PDF:
===== PDF TEXT =====
{chunk_text}
===== END PDF TEXT =====

Here's the termsheet data:
===== TERMSHEET DATA =====
{termsheet_str}
===== END TERMSHEET DATA =====

Important: Your response must be ONLY a valid JSON object starting with {{ and ending with }}. Do not add any explanations or formatting outside of the JSON structure.
"""
        return prompt
    
    def identify_discrepancies(self, chunk_text: str, termsheet_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Identify discrepancies in the chunk using the LLM.
        
        Args:
            chunk_text: Text chunk from the PDF
            termsheet_data: Dictionary containing termsheet data
            
        Returns:
            List of discrepancies identified by the LLM
        """
        prompt = self.create_prompt(chunk_text, termsheet_data)
        
        # Call the LLM API
        response = self.call_llama_api(prompt)
        
        # Parse and return the discrepancies
        try:
            # Extract the JSON portion using regex
            json_match = re.search(r'({.*})', response, re.DOTALL)
            if json_match:
                json_text = json_match.group(1)
                result = json.loads(json_text)
                return result.get('discrepancies', [])
            else:
                print(f"No JSON found in response: {response[:200]}...")
                return []
        except (json.JSONDecodeError, KeyError) as e:
            print(f"Error parsing LLM response: {str(e)}\nResponse: {response[:200]}...")
            return []
    
    def call_llama_api(self, prompt: str) -> str:
        """
        Call the AWS Llama API.
        
        Args:
            prompt: Prompt for the LLM
            
        Returns:
            LLM response as a string
        """
        message = {"prompt": prompt}
        headers = {"Content-Type": "application/json"}
        
        max_retries = 3
        retry_delay = 5  # seconds
        
        for attempt in range(max_retries):
            try:
                response = requests.post(
                    self.llama_url,
                    json=message,
                    headers=headers,
                    timeout=60  # Add timeout to prevent hanging
                )
                
                if response.status_code == 429 or response.status_code == 500:
                    # Rate limit or server error - retry after delay
                    import time
                    retry_delay_with_jitter = retry_delay + (attempt * 2)
                    print(f"Rate limited or server error. Retrying in {retry_delay_with_jitter} seconds...")
                    time.sleep(retry_delay_with_jitter)
                    continue
                
                if response.status_code != 200:
                    raise ValueError(f"Error from Llama API: {response.status_code} - {response.text}")
                
                try:
                    data = response.json()
                    # Check different possible response formats
                    if 'fullResponse' in data:
                        full_response = json.loads(data.get('fullResponse', '{}'))
                        return full_response.get('generation', '')
                    elif 'generation' in data:
                        return data.get('generation', '')
                    else:
                        return data.get('response', '')
                except Exception as e:
                    raise ValueError(f"Error parsing Llama API response: {str(e)}")
                
            except requests.RequestException as e:
                if attempt < max_retries - 1:
                    print(f"Request failed: {str(e)}. Retrying...")
                    continue
                raise ValueError(f"Failed to connect to Llama API after {max_retries} attempts: {str(e)}")
        
        raise ValueError("Failed to get valid response from Llama API after retries")


class PDFHighlighter:
    """Class to highlight discrepancies in a PDF."""
    
    def __init__(self, pdf_path: str):
        """
        Initialize the PDF highlighter.
        
        Args:
            pdf_path: Path to the PDF file
        """
        self.pdf_path = pdf_path
        self.doc = fitz.open(pdf_path)
        self.highlight_colors = {
            # Severity colors (1-10) range from yellow to red
            1: (1, 1, 0.7),  # Light yellow
            2: (1, 0.95, 0.6),
            3: (1, 0.9, 0.5),
            4: (1, 0.85, 0.4),
            5: (1, 0.8, 0.3),
            6: (1, 0.7, 0.25),
            7: (1, 0.6, 0.2),
            8: (1, 0.5, 0.15),
            9: (1, 0.4, 0.1),
            10: (1, 0.3, 0.05),  # Deep red
        }
    
    def highlight_discrepancy(self, discrepancy: Dict[str, Any], page_num: int, blocks: List[Dict[str, Any]]) -> bool:
        """
        Highlight a discrepancy in the PDF.
        
        Args:
            discrepancy: Dictionary containing discrepancy information
            page_num: Page number
            blocks: List of text blocks on the page
            
        Returns:
            True if highlighted, False otherwise
        """
        text_to_highlight = discrepancy.get('text_to_highlight', '')
        severity = discrepancy.get('severity', 5)
        
        # Get color based on severity
        color = self.highlight_colors.get(severity, self.highlight_colors[5])
        
        # Create comment for the annotation
        comment = (
            f"Discrepancy: {discrepancy.get('explanation', '')}\n"
            f"Termsheet field: {discrepancy.get('related_termsheet_field', '')}\n"
            f"Termsheet value: {discrepancy.get('termsheet_value', '')}\n"
            f"Document value: {discrepancy.get('document_value', '')}\n"
            f"Severity: {severity}/10"
        )
        
        # Find the text in the blocks
        highlighted = False
        for block in blocks:
            if text_to_highlight in block['text']:
                rect = fitz.Rect(block['bbox'])
                page = self.doc[page_num]
                
                # Add highlight
                highlight = page.add_highlight_annot(rect)
                highlight.set_colors(stroke=color)
                highlight.update()
                
                # Add comment annotation
                text_annot = page.add_text_annot(rect.tl, comment)
                text_annot.update()
                
                highlighted = True
        
        return highlighted
    
    def highlight_discrepancies_in_chunk(self, chunk: Dict[str, Any], discrepancies: List[Dict[str, Any]]) -> int:
        """
        Highlight discrepancies in a chunk.
        
        Args:
            chunk: Dictionary containing chunk information
            discrepancies: List of discrepancies to highlight
            
        Returns:
            Number of discrepancies highlighted
        """
        count = 0
        
        for page_num in chunk['pages']:
            page_blocks = [b for b in chunk['blocks'] if b['page'] == page_num]
            
            for discrepancy in discrepancies:
                if self.highlight_discrepancy(discrepancy, page_num, page_blocks):
                    count += 1
        
        return count
    
    def save_highlighted_pdf(self, output_path: str = None) -> str:
        """
        Save the highlighted PDF.
        
        Args:
            output_path: Path to save the PDF (defaults to original name with _highlighted suffix)
            
        Returns:
            Path to the saved PDF
        """
        if output_path is None:
            # Create a default name based on the original
            base_path = os.path.splitext(self.pdf_path)[0]
            output_path = f"{base_path}_highlighted.pdf"
        
        self.doc.save(output_path)
        self.doc.close()
        return output_path


def process_chunk(chunk: Dict[str, Any], termsheet_data: Dict[str, Any], llm_identifier: LlamaDiscrepancyIdentifier) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
    """
    Process a chunk to identify discrepancies.
    
    Args:
        chunk: Dictionary containing chunk information
        termsheet_data: Dictionary containing termsheet data
        llm_identifier: LlamaDiscrepancyIdentifier instance
        
    Returns:
        Tuple of (chunk, discrepancies)
    """
    try:
        discrepancies = llm_identifier.identify_discrepancies(chunk['text'], termsheet_data)
        return chunk, discrepancies
    except Exception as e:
        print(f"Error processing chunk: {str(e)}")
        return chunk, []


def highlight_discrepancies_with_llm(
    pdf_path: str,
    termsheet_data: Dict[str, Any],
    output_path: str = None,
    chunk_size: int = 800,  # Reduced chunk size to avoid token limits
    overlap: int = 150,
    llama_url: str = None,
    max_workers: int = 2  # Reduced max workers to avoid rate limiting
) -> str:
    """
    Highlight discrepancies in a PDF using the LLM.
    
    Args:
        pdf_path: Path to the PDF file
        termsheet_data: Dictionary containing termsheet data
        output_path: Path to save the highlighted PDF
        chunk_size: Maximum size of each chunk in characters
        overlap: Number of characters to overlap between chunks
        llama_url: URL for the AWS Llama API
        max_workers: Maximum number of workers for parallel processing
        
    Returns:
        Path to the highlighted PDF
    """
    # Create chunker and LLM identifier
    chunker = PDFChunker(pdf_path, chunk_size, overlap)
    llm_identifier = LlamaDiscrepancyIdentifier(llama_url)
    
    # Create chunks
    chunks = chunker.create_chunks()
    chunker.close()
    
    print(f"Created {len(chunks)} chunks for processing")
    
    # Process chunks with rate limiting
    all_results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = [executor.submit(process_chunk, chunk, termsheet_data, llm_identifier) for chunk in chunks]
        
        for i, future in enumerate(concurrent.futures.as_completed(futures)):
            try:
                chunk, discrepancies = future.result()
                all_results.append((chunk, discrepancies))
                print(f"Processed chunk {i+1}/{len(chunks)} - Found {len(discrepancies)} discrepancies")
                
                # Add a small delay between chunks to avoid rate limiting
                if i < len(chunks) - 1:
                    import time
                    time.sleep(1)  # 1 second delay between chunks
                
            except Exception as e:
                print(f"Error processing chunk: {str(e)}")
    
    # Highlight discrepancies
    highlighter = PDFHighlighter(pdf_path)
    total_highlighted = 0
    
    for chunk, discrepancies in all_results:
        if discrepancies:
            count = highlighter.highlight_discrepancies_in_chunk(chunk, discrepancies)
            total_highlighted += count
    
    # Save the highlighted PDF
    highlighted_pdf_path = highlighter.save_highlighted_pdf(output_path)
    print(f"Highlighted {total_highlighted} discrepancies in {highlighted_pdf_path}")
    
    return highlighted_pdf_path


def read_termsheet_data(termsheet_path: str) -> Dict[str, Any]:
    """
    Read termsheet data from a file.
    
    Args:
        termsheet_path: Path to the termsheet file
        
    Returns:
        Dictionary containing termsheet data
    """
    import pandas as pd
    
    ext = os.path.splitext(termsheet_path)[1].lower()
    
    if ext in {'.xls', '.xlsx', '.xlsm', '.xlsb'}:
        df = pd.read_excel(termsheet_path)
    else:  # Assume CSV
        df = pd.read_csv(termsheet_path)  # or try 'cp1252' if 'latin1' fails

    # Convert to dictionary
    records = df.to_dict('records')
    
    # Create a simple structure
    result = {
        'fields': {},
        'raw_data': records
    }
    
    # Populate fields from the first row
    if records:
        for key, value in records[0].items():
            if pd.notna(value):
                result['fields'][key] = value
    
    return result


def create_flask_blueprint():
    """Create a Flask blueprint for the PDF highlighting functionality."""
    from flask import Blueprint, request, jsonify, send_file
    
    pdf_blueprint = Blueprint('pdf_api', __name__)
    
    @pdf_blueprint.route('/highlight-discrepancies', methods=['POST'])
    def api_highlight_discrepancies():
        # Get the uploaded PDF file
        if 'pdf' not in request.files:
            return jsonify({'error': 'No PDF file uploaded'}), 400
        
        pdf_file = request.files['pdf']
        
        # Get the optional termsheet file
        if 'termsheet' not in request.files:
            return jsonify({'error': 'No termsheet file uploaded'}), 400
        
        termsheet_file = request.files['termsheet']
        
        # Save uploaded files to temp directory
        temp_dir = tempfile.mkdtemp()
        pdf_path = os.path.join(temp_dir, pdf_file.filename)
        pdf_file.save(pdf_path)
        
        termsheet_path = os.path.join(temp_dir, termsheet_file.filename)
        termsheet_file.save(termsheet_path)
        
        # Read termsheet data
        try:
            termsheet_data = read_termsheet_data(termsheet_path)
        except Exception as e:
            return jsonify({'error': f'Error reading termsheet: {str(e)}'}), 400
        
        # Generate output path
        output_pdf_path = os.path.join(temp_dir, f"highlighted_{pdf_file.filename}")
        
        try:
            # Process and highlight the PDF
            highlighted_path = highlight_discrepancies_with_llm(
                pdf_path=pdf_path, 
                termsheet_data=termsheet_data,
                output_path=output_pdf_path
            )
            
            # Return the highlighted PDF
            return send_file(highlighted_path, as_attachment=True, 
                           attachment_filename=f"highlighted_{pdf_file.filename}")
        
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    return pdf_blueprint

def main(termsheet_id):
    termsheet_table = meta.tables['Termsheet']
    file_table = meta.tables["File"]
    val_termsheet_query = select(file_table.c.type,file_table.c.s3Link).join(termsheet_table,file_table.c.id==termsheet_table.validatedsheetFileId).where(termsheet_table.c.id==termsheet_id)
    with engine.connect() as conn:
        res = conn.execute(val_termsheet_query).fetchone()
    
    val_term_link = res[1]
    termsheet_path = 'temp/val_sheet.xlsx'
    download_file_from_url(val_term_link,save_path=termsheet_path)
    termsheet_data = read_termsheet_data(termsheet_path)

    pdf_query = select(file_table.c.type,file_table.c.s3Link).join(termsheet_table,file_table.c.id==termsheet_table.ourtermsheetFileId).where(termsheet_table.c.id==termsheet_id)
    pdf_path = "temp/temp_pdf.pdf"
    output_path = "output/highlighted_output.pdf"
    with engine.connect() as conn:
        res = conn.execute(pdf_query).fetchone()
    pdf_link = res[1]
    download_file_from_url(pdf_link,save_path=pdf_path)
    highlighted_pdf = highlight_discrepancies_with_llm(
        pdf_path=pdf_path,
        termsheet_data=termsheet_data,
        output_path=output_path,
        chunk_size=800,  # Smaller chunks to avoid token limits
        overlap=150,
        llama_url=os.getenv("LLAMA_MODEL_URL"),
        max_workers=2  # Reduced to avoid rate limiting
    )
    timestamp = datetime.datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    filename = f"output/highlighted_data_{timestamp}.pdf"
    s3 = boto3.resource(
        "s3",
                    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
                    region_name=os.getenv("AWS_REGION")
    )
    with open(highlighted_pdf,"rb") as f:
        s3.Bucket(os.getenv("AWS_S3_BUCKET")).upload_fileobj(f, highlighted_pdf)
    
    s3_link = f"https://barcla.s3.ap-south-1.amazonaws.com/{filename}"
    with engine.begin() as conn:
        file_insert_query = insert(file_table).values(
                        s3Link = s3_link,
                        type = "PDF"
                    ).returning(file_table.c.id)
        result = conn.execute(file_insert_query)
        res_id = result.scalar()

        update_query = (
                        update(termsheet_table)
                        .where(termsheet_table.c.id==termsheet_id)
                        .values(coloursheetFileId=res_id,status="TO BE ACCEPTED")
                    )
        conn.execute(update_query)

# Example usage
if __name__ == "__main__":
    termsheet_path = 'data_validation/comparison_output.xlsx'
    # Read termsheet data
    termsheet_data = read_termsheet_data(termsheet_path)
    
    pdf_path = 'data_structurization/TS3.pdf'
    output_path = 'data_validation/highlighted_output.pdf'
    
    # Process and highlight the PDF
    highlighted_pdf = highlight_discrepancies_with_llm(
        pdf_path=pdf_path,
        termsheet_data=termsheet_data,
        output_path=output_path,
        chunk_size=800,  # Smaller chunks to avoid token limits
        overlap=150,
        llama_url=os.getenv("LLAMA_MODEL_URL"),
        max_workers=2  # Reduced to avoid rate limiting
    )
    
    print(f"Highlighted PDF saved to: {highlighted_pdf}")