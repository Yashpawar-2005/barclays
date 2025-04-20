import sys
import os
import pandas as pd
import json
from transformers import AutoTokenizer
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from data_extraction.clean_data import preprocess_data
from data_extraction.ocr import extract_pdf_content

from dotenv import load_dotenv
import requests
import time
from flask import Blueprint, Response, jsonify, request

load_dotenv()


app_bp = Blueprint("structure_data", __name__)

def extract_json_from_llm_response(response):
    """
    Extract JSON from an LLM response string.
    Handles responses in various formats that contain 'json:' marker.
    
    Args:
        response (str or dict): The LLM response
        
    Returns:
        dict: Extracted JSON data or None if extraction fails
    """
    # Handle different response types
    if isinstance(response, dict):
        res_str = response.get("fullResponse", "")
    elif isinstance(response, str):
        try:
            parsed = json.loads(response)
            res_str = parsed.get("fullResponse", "")
        except json.JSONDecodeError:
            res_str = response
    else:
        return None
        
    try:
        # Find JSON in the response
        idx = res_str.find("json:")
        if idx == -1:
            return None
            
        # Extract JSON part with proper brace matching
        json_part = res_str[idx + 5:]
        brace_count = 0
        end_pos = 0
        
        for i, char in enumerate(json_part):
            if char == '{':
                brace_count += 1
            elif char == '}':
                brace_count -= 1
                if brace_count == 0:
                    end_pos = i + 1
                    break
        
        if end_pos == 0:
            return None
            
        json_str = json_part[:end_pos].strip()
        
        # Clean the JSON string
        json_str = json_str.replace('\\"', '"')
        json_str = json_str.replace('\\n', '')
        json_str = json_str.replace('\\', '')
        
        # Parse JSON
        return json.loads(json_str)
        
    except Exception as e:
        print(f"Error extracting JSON: {str(e)}")
        return None

def merge_json_responses(responses):
    """
    Merge multiple JSON responses into a single JSON.
    For each field, the first non-null value found is used.
    
    Args:
        responses (list): List of LLM responses (strings or dicts)
        
    Returns:
        dict: Merged JSON with non-null values prioritized
    """
    final_result = {}
    
    # Keep track of which fields have been filled with non-null values
    processed_fields = set()
    
    for response in responses:
        # Extract JSON from the response
        json_data = extract_json_from_llm_response(response)
        
        if not json_data:
            continue
            
        # For each field in this JSON
        for key, value in json_data.items():
            # If field hasn't been processed yet or has null value in final_result
            if (key not in processed_fields) or (key in final_result and final_result[key] in [None, "null", "", "N/A"]):
                # Only update if the current value is not null-like
                if value not in [None, "null", "", "N/A"]:
                    final_result[key] = value
                    processed_fields.add(key)
                # If we haven't seen this field before, add it even if null
                elif key not in final_result:
                    final_result[key] = value
    
    return final_result

def json_to_csv(json_data, output_file):
    """
    Convert JSON to CSV file
    
    Args:
        json_data (dict): JSON data to convert
        output_file (str): Path to output CSV file
        
    Returns:
        DataFrame: Pandas DataFrame of the JSON data
    """
    # Convert to DataFrame (single row)
    df = pd.DataFrame([json_data])
    
    # Save to CSV
    df.to_csv(output_file, index=False, na_rep="null")
    
    return df

def save_to_multiple_formats(json_data, base_output_path):
    """
    Save JSON data to both CSV and Excel formats
    
    Args:
        json_data (dict): JSON data to convert
        base_output_path (str): Base path for output files (without extension)
        
    Returns:
        tuple: (csv_df, excel_path) - DataFrame and path to Excel file
    """
    # Convert to DataFrame (single row)
    df = pd.DataFrame([json_data])
    
    # Save to CSV
    csv_path = f"{base_output_path}.csv"
    df.to_csv(csv_path, index=False, na_rep="null")
    
    # Save to Excel with formatting
    excel_path = f"{base_output_path}.xlsx"
    with pd.ExcelWriter(excel_path, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Structured Data')
        
        # Auto-adjust columns width
        worksheet = writer.sheets['Structured Data']
        for idx, col in enumerate(df.columns):
            max_length = max(
                df[col].astype(str).apply(len).max(),  # Length of largest item
                len(str(col))  # Length of column name
            ) + 2  # Adding a little extra space
            worksheet.column_dimensions[chr(65 + idx)].width = max_length
    
    return df, excel_path

def process_chunked_responses(responses, output_path):
    """
    Process multiple LLM responses from chunks, merge them, and save as CSV and Excel
    
    Args:
        responses (list): List of LLM responses
        output_path (str): Base path for output files (without extension)
        
    Returns:
        DataFrame: DataFrame of the merged data
    """
    # Merge all JSON responses
    merged_json = merge_json_responses(responses)
    
    # Save to both formats
    df, excel_path = save_to_multiple_formats(merged_json, output_path.rsplit('.', 1)[0])
    
    return df

def extract_columns(excel_path, sheet_name=0):
    """
    Reads an Excel file and returns its column names as a comma-separated string.

    Parameters:
    - excel_path: str or file-like  
        Path to the Excel file (e.g., "data.xlsx") or a file-like object.
    - sheet_name: str, int, or list, default 0  
        Name or index of sheet to read (defaults to the first sheet).

    Returns:
    - str  
        Comma-separated column names.
    """
    # Load the sheet into a DataFrame
    df = pd.read_excel(excel_path, sheet_name=sheet_name)

    # Convert column Index to strings and join with commas
    return ",".join(map(str, df.columns.tolist()))


def structure_data(text,mapsheet):
    """Structure financial data using an LLM"""

    features = extract_columns(mapsheet)
    
    prompt_template = """
\nExtract the abpve features from the following termsheet and return ONLY a valid JSON object with the fields below.
Do not explain anything. If a field is not present, use null. Do not include placeholders or extra notes.




Put null for fields that are not present in the text.

DO NOT GIVE ANY EXTRA TEXT BESIDE RAW JSON. DO NOT GIVE ANY EXPLANATIONS DISCLAIMERS.
ONLY RETURN VALID JSON, NOTHING ELSE
DO NOT PUT QUOTES AROUND NUMERICAL VALUES.
FOR NUMBERS LIKE 1,000,000,000 WRITE THEM AS 1000000000.
Follow this format: json:{...}
"""
    prompt = (features + prompt_template + "-START OF TERMSHEET-\n" + ','.join(text) + "\n-END OF TERMSHEET-")
    
    # Try Gemini if environment variable is set, otherwise use LLAMA
    if os.getenv("USE_GEMINI", "False").lower() == "true":
        pass
    else:
        message = {"prompt": prompt}
        headers = {"Content-Type": "application/json"}
        llama_url = os.getenv("LLAMA_MODEL_URL")
        
        if not llama_url:
            raise ValueError("LLAMA_MODEL_URL environment variable not set")
            
        response = requests.post(llama_url, json=message, headers=headers)
        return response

@app_bp.route('/api/structure_data', methods=['POST'])
def struct_endpoint():
    """Flask endpoint to process document and structure data"""
    try:
        # Get document from request
        doc = request.files.get('document')
        output_file = request.form.get('output_file', 'termsheet_output.csv')
        
        if not doc:
            return jsonify({"error": "No document received"}), 400
            
        # Extract and preprocess data
        text = extract_pdf_content(doc)
        if not text:
            return jsonify({"error": "Failed to extract text from document"}), 500
            
        clean = preprocess_data(text)
        
        # Process each chunk and collect results
        results = []
        for chunk in clean['en']:
            res = structure_data(chunk,mapsheet)
            
            # Handle different response types
            if hasattr(res, 'json'):
                results.append(res.json())
            else:
                # Assuming this is a Gemini response
                results.append({"fullResponse": str(res.text)})
        
        # Process all responses together
        df = process_chunked_responses(results, output_file)
        
        if df is not None:
            return jsonify({
                "message": "Successfully structured data and saved CSV",
                "rows": len(df),
                "columns": list(df.columns)
            }), 200
        else:
            return jsonify({"error": "Error in parsing to CSV"}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app_bp.route('py/structure_data', methods=['POST'])
def struct():
    """Original route handler fixed to work with Flask properly"""
    try:
        # Get document from request
        doc = request.files.get('document')
        
        if not doc:
            return jsonify({"err": "document not received"}), 500
            
        # Process document
        clean = preprocess_data(doc)
        
        # Process each chunk and collect results
        results = []
        for chunk in clean['en']:
            res = structure_data(chunk,mapsheet)
            results.append(res.json())
        
        # Process results and save CSV
        df = process_chunked_responses(results, "termsheet_yashas.csv")
        
        if df is not None:
            return jsonify({"message": "successfully stored structured csv in db"}), 200
        else:
            return jsonify({"err": "error in parsing to csv"}), 500
            
    except Exception as e:
        return jsonify({'err': str(e)}), 400

if __name__ == "__main__":
   
    
    output_base = 'data_structurization/termsheet_output_llama'  # Remove file extension
    pdf_path = 'data_structurization/TS3.pdf'
    mapsheet = 'data_structurization/output_llama.xlsx'
    
    print(f"Processing {pdf_path}...")
    start = time.time()
    
    # Extract text from PDF
    text = extract_pdf_content(pdf_path)
    if not text:
        print("Failed to extract text from PDF")
        sys.exit(1)
    
    # Preprocess the extracted text
    clean = preprocess_data(text)
    
    # Process each chunk
    print("Sending chunks to LLM...")
    results = []
    for i, chunk in enumerate(clean['en']):
        print(f"Processing chunk {i+1}/{len(clean['en'])}...")
        res = structure_data(chunk,mapsheet)
        
        # Handle different response types
        if hasattr(res, 'json'):
            results.append(res.json())
        else:
            # Assuming this is a Gemini response
            results.append({"fullResponse": str(res.text)})
    
    # Process all responses together and save files
    df = process_chunked_responses(results, output_base)
    
    if df is not None:
        print(f"\nProcessing complete! Time taken: {time.time() - start:.2f} seconds")
        print(f"Output saved to {output_base}.csv and {output_base}.xlsx")
        print("\nFirst few rows of extracted data:")
        print(df.head())
    else:
        print("Error: Failed to create output files")
