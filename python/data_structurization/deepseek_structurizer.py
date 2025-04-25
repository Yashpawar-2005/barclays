import sys
import os
import pandas as pd
import json
# from transformers import AutoTokenizer
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
    First looks for '</think>' marker and extracts text after it,
    then searches for 'json:' marker within that text.
    
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
        # First, check if there's a </think> marker and extract text after it
        think_idx = res_str.find("</think>")
        if think_idx != -1:
            res_str = res_str[think_idx + len("</think>"):].strip()
            
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

def merge_json_responses(responses, mapsheet):
    """
    Merge multiple JSON responses into a single JSON.
    Ensures all features from mapsheet are present in output.
    
    Args:
        responses (list): List of LLM responses
        mapsheet (str): Path to Excel mapsheet with features
        
    Returns:
        dict: Merged JSON with all features (null if not found)
    """
    # First get all possible features from mapsheet
    features = extract_columns(mapsheet).split(',')
    final_result = {feature: None for feature in features}  # Initialize all features as null
    all_values = {feature: [] for feature in features}
    
    # Collect all non-null values for each field
    for response in responses:
        json_data = extract_json_from_llm_response(response)
        
        if not json_data:
            continue
            
        # For each field in this JSON
        for key, value in json_data.items():
            if key in features:  # Only process features that are in our mapsheet
                if value not in [None, "null", "", "N/A"]:
                    if value not in all_values[key]:
                        all_values[key].append(value)
    
    # Combine all values for each field
    for key in features:  # Iterate through features to maintain order
        values = all_values[key]
        if len(values) == 1:
            final_result[key] = values[0]
        elif len(values) > 1:
            final_result[key] = " | ".join(str(val) for val in values)
        # If no values found, key remains null from initialization
    
    print(f"Merged JSON: {json.dumps(final_result, indent=2)}")
    
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

def process_chunked_responses(responses, output_path, mapsheet):
    """
    Process multiple LLM responses from chunks, merge them, and save as CSV and Excel
    
    Args:
        responses (list): List of LLM responses
        output_path (str): Base path for output files (without extension)
        mapsheet (str): Path to Excel mapsheet with features
        
    Returns:
        DataFrame: DataFrame of the merged data
    """
    # Merge all JSON responses with all features from mapsheet
    merged_json = merge_json_responses(responses, mapsheet)
    
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


def structure_data(text, mapsheet, max_retries=5, backoff_factor=2):
    """Structure financial data using AWS Bedrock DeepSeek via load balancer endpoint"""

    features = extract_columns(mapsheet)
    
    prompt_template = """
\nYou are an expert financial analyst. You have to extract the following features from the text chunk below.
Extract the feature only if you find that feature in the text chunk and it makes sense for a feature to have such value.
Be extra careful when the text chunk consists of tables.
\n 
Extract the above features from the following termsheet and return ONLY a valid JSON object with the fields below. Do not explain anything.
\n
If a feature value is not present, use null. Do not include placeholders or extra notes.

Put null for fields that are not present in the text.
EXTRACT THE FEATURE ONLY IF YOU ARE 100 PERCENT SURE IT IS PRESENT IN THE TEXT. OTHERWISE, PUT NULL.
DO NOT GIVE ANY EXTRA TEXT BESIDE RAW JSON. DO NOT GIVE ANY EXPLANATIONS DISCLAIMERS.
ONLY RETURN VALID JSON, NOTHING ELSE
DO NOT PUT QUOTES AROUND NUMERICAL VALUES.
FOR NUMBERS LIKE 1,000,000,000 WRITE THEM AS 1000000000.
While creating JSON, mention the value for each feature even if its value is null.
\n
Only give json, dont type any other text because i want to then parse the json and use it in my code.\n
Follow this output format: json:{"feature1": "value1", "feature2": "value2", ...}
\n

Examples:
\n

Input : 

\n

-START OF FEATURES LIST-\n

Settlement Currency, Tranche number, Redeemable Certificates, Issue Price

\n-END OF FEATURES LIST-
\n


-START OF TERMSHEET-\n

--- Page 3 ---
 
3 
 
PART A – CONTRACTUAL TERMS 
Provisions relating to the Securities 
1. 
 
(a) Series: 
NX00435515 
 
(b) 
 
Tranche: 
1 
2. 
 
Currencies: 
 
 
(a) Issue Currency 
Euro (“EUR”) 
 
(b) Settlement Currency: 
EUR 
3. 
 
Securities: 
Notes 
4. 
 
Notes: 
Applicable 
 
(a) Aggregate Nominal Amount as at the 
Issue Date: 
 
 
(i) 
Tranche: 
Up to EUR 75,000,000 
(ii) Series: 
Up to EUR 75,000,000 
 
(b) Specified Denomination: 
EUR 1,000 
 
(c) Minimum Tradable Amount: 
EUR 1,000  
5. 
 
Redeemable Certificates: 
Not Applicable 
6. 
 
Calculation Amount: 
EUR 1,000  
7. 
 
Issue Price:  
100.00 per cent of the Specified Denomination 
The Issue Price includes a commission element 
payable by the Issuer to the Authorised Offeror 
which will be no more than 5.00 per cent. of the Issue 
Price.  
Investors in the Securities intending to invest 
through an intermediary (including by way of 
introducing broker) should request details of any 
such commission or fee payment from such 
intermediary before making any purchase hereof. 
8. 
 
Issue Date: 
14 March 2025 
9. 
 
Scheduled Settlement Date: 
14 March 2030, subject to adjustment in accordance 
with the Business Day Convention 
10.  
Type of Security: 
Not Applicable 
11.  
Relevant Annex(es) which apply to the 
Securities: 
None 
 Provisions relating to interest (if any) payable  
12.  
Interest Type: 
General Condition 13 (Interest or coupon) 
In respect of each Interest Payment Date: Fixed 
 
(a) Interest Payment Dates: 
Each of the dates set out in Table 1 below in the 
column entitled 'Interest Payment Date(s)', subject to 
adjustment in accordance with the Business Day 
Convention 
 
(b) Interest Determination Dates:  
Each of the dates set out in Table 1 below in the 
column entitled 'Interest Determination Dates', 
subject to adjustment in accordance with the 
Business Day Convention 


--- Page 4 ---
 
4 
 
 
(i) 
In Period Setting: 
Not Applicable 
 
(ii) Advance Setting: 
Not Applicable  
 
(iii) Arrears Setting: 
Not Applicable 
 
Table 1 
 
Interest 
Type 
Interest 
Determination 
Date(s): 
Interest Payment 
Date(s) 
Fixed 
Interest 
Type 
Day Count Fraction 
Convention 
Range Accrual Factor 
Fixed 
12 June 2025 
16 June 2025 
Per Annum 
30/360 
Not Applicable 
Fixed 
11 September 2025 
15 September 2025 
Per Annum 
30/360 
Not Applicable 
Fixed 
11 December 2025 
15 December 2025 
Per Annum 
30/360 
Not Applicable 
Fixed 
12 March 2026 
16 March 2026 
Per Annum 
30/360 
Not Applicable 
Fixed 
N/A 
15 June 2026 
Per Annum 
30/360 
Applicable 
Fixed 
N/A 
14 September 2026 
Per Annum 
30/360 
Applicable 
Fixed 
N/A 
14 December 2026 
Per Annum 
30/360 
Applicable 
Fixed 
N/A 
15 March 2027 
Per Annum 
30/360 
Applicable 
Fixed 
N/A 
14 June 2027 
Per Annum 
30/360 
Applicable 
Fixed 
N/A 
14 September 2027 
Per Annum 
30/360 
Applicable 
Fixed 
N/A 
14 December 2027 
Per Annum 
30/360 
Applicable 
Fixed 
N/A 
14 March 2028 
Per Annum 
30/360 
Applicable 
Fixed 
N/A 
14 June 2028 
Per Annum 
30/360 
Applicable 
Fixed 
N/A 
14 September 2028 
Per Annum 
30/360 
Applicable 
Fixed 
N/A 
14 December 2028 
Per Annum 
30/360 
Applicable 
Fixed 
N/A 
14 March 2029 
Per Annum 
30/360 
Applicable 
Fixed 
N/A 
14 June 2029 
Per Annum 
30/360 
Applicable 
Fixed 
N/A 
14 September 2029 
Per Annum 
30/360 
Applicable 
Fixed 
N/A 
14 December 2029 
Per Annum 
30/360 
Applicable 
Fixed 
N/A 
14 March 2030 
Per Annum 
30/360 
Applicable 
 
(c) Interest Commencement Date 
Issue Date 
 
(d) Information relating to the Fixed Rate: 
Applicable 
 
(i) Fixed Interest Type: 
In respect of each Interest Payment Date, as set out 
in Table 1 above in the column entitled ‘Fixed 
Interest Type’ 
 
(ii) Fixed Interest Rate: 
3.00 per cent. 
 
(iii) Day Count Fraction Convention: 
In respect of each Interest Payment Date for which 
the Interest Type is specified in Table 1 above as 
‘Fixed’: 30/360 
 
(e) Information relating to the Floating 
Rate: 
Applicable 
 
(i) 
Floating Rate Determination – 
CMS Rate: 
Not Applicable 
 
(ii) Floating Rate Determination – 
Reference Rate 
Applicable 
 
– Reference Rate: 
EURIBOR 
 
– Compounding Method: 
Not Applicable 
 
– Designated Maturity: 
3 Months 


--- Page 5 ---
 
5 
 
 
– Offered Quotation: 
Applicable 
 
– Arithmetic Mean: 
Not Applicable 
 
– Interest Determination Date: 
Not Applicable 
 
– Relevant Screen Page: 
Refinitiv Screen EURIBOR01 Page 
 
– Relevant Time: 
11:00 a.m. (Brussels time) 
 
– Relevant Interbank Market: 
Eurozone interbank market 
 
–Observation Shift Days: 
Not Applicable 
 
– Recommended Fallback Rate: 
As defined in General Condition 43.1 (Definitions) 
in respect of EURIBOR 
 
– Linear Interpolation 
Not Applicable 
 
(f) Interest Period End Dates: 
Each Interest Payment Date(s), subject to adjustment 
in accordance with the Business Day Convention. 
 
(g) Day Count Fraction Convention: 
30/360 
 
(h) Range Accrual Factor 
Applicable 
 
(i)  Accrual Condition Type: 
Single Rate Range Accrual 
 
(ii)  Year-on-Year 
Inflation 
Range 
Accrual: 
Not Applicable 
 
(iii) Single Rate Range Accrual: 
Range Accrual Floating Rate 1: 
Applicable 
 
- Floating Rate Determination: 
- Lower Barrier: 
- Upper Barrier: 
Floating Rate Determination – Reference Rate  
1.10 per cent. 
3.25 per cent. 
 
(iv) Spread Range Accrual: 
Not Applicable 
 
(v) Dual Rate Range Accrual: 
Not Applicable 
 
(vi) Dual Spread Range Accrual: 
Not Applicable 
 
(vii) Observation Number of Business 
Days: 
Five (5) Business Days  
Provisions relating to Automatic Settlement (Autocall)  
13.  
Automatic Settlement (Autocall) or 
Automatic Settlement (Autocall) (bearish) or 
Automatic Settlement (Autocall) (range): 
General Condition 14 (Automatic Settlement 
(Autocall))  
Not Applicable 
Provisions relating to Optional Early Redemption  
14.  
Optional Early Settlement Event: 
General Condition 15 (Optional Early 
Settlement Event) 
Not Applicable 
15.  
Option Type: 
Not Applicable 


\n

-END OF TERMSHEET-
\n

OUTPUT:
\n

json:{\\n  \\\"Settlement Currency\\\": \\\"EUR\\\",\\n  \\\"Tranche number\\\": 1,\\n  \\\"Redeemable Certificates\\\": \\\"Not Applicable\\\",\\n  \\\"Issue Price\\\": \\\"100.00 per cent of the Specified Denomination. The Issue Price includes a commission element payable by the Issuer to the Authorised Offeror which will be no more than 5.00 per cent. of the Issue Price. Investors in the Securities intending to invest through an intermediary (including by way of introducing broker) should request details of any such commission or fee payment from such intermediary before making any purchase hereof\\\"\\n}


Now below is the actual termsheet you have to extract the features from, features are given in the features list at top. \n
"""
    prompt = ("-START OF FEATURES LIST-\n" + features + "\n-END OF FEATURES LIST-" + prompt_template + "-START OF TERMSHEET-\n" + ','.join(text) + "\n-END OF TERMSHEET-")
    
    # Get the load balancer endpoint URL from environment variable
    lb_url = os.getenv("DEEPSEEK_MODEL_URL")
    
    if not lb_url:
        raise ValueError("DEEPSEEK_MODEL_URL environment variable not set")
    
    # Implement retry logic with exponential backoff
    retry_count = 0
    while retry_count <= max_retries:
        try:
            # Format request for DeepSeek via load balancer
            payload = {
                "prompt": prompt,
                "max_tokens": 4096,
                "temperature": 0.1,
                "top_p": 0.95
            }
            
            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
            
            # Call the load balancer endpoint
            response = requests.post(lb_url, json=payload, headers=headers)
            
            # Check if the request was successful
            if response.status_code == 200:
                response_json = response.json()
                
                # Extract the response text based on the API response format
                if isinstance(response_json, dict):
                    if 'generation' in response_json:
                        # DeepSeek format
                        response_text = response_json.get('generation', '')
                    elif 'response' in response_json:
                        # Alternative format
                        response_text = response_json.get('response', '')
                    elif 'content' in response_json:
                        # Another possible format
                        response_text = response_json.get('content', '')
                    elif 'output' in response_json:
                        # Another possible format
                        response_text = response_json.get('output', '')
                    else:
                        # Fallback to the complete response
                        response_text = json.dumps(response_json)
                else:
                    response_text = str(response_json)
                
                # Check if the response is empty and retry if it is
                choices = response_json.get('choices', [])
                if choices and all(choice.get('text', '') == '' for choice in choices):
                    print(f"Empty response received, retrying ({retry_count+1}/{max_retries})...")
                    retry_count += 1
                    time.sleep(backoff_factor * (2 ** retry_count))  # Exponential backoff
                    continue
                    
                print(f"LLM Response: {response_text[:200]}...")  # Print first 200 chars for debugging
                return {"fullResponse": response_text}
            elif response.status_code == 500 and "Too many tokens" in response.text:
                retry_count += 1
                wait_time = backoff_factor * (2 ** retry_count)
                print(f"Rate limit hit, waiting {wait_time} seconds before retry {retry_count}/{max_retries}...")
                time.sleep(wait_time)  # Exponential backoff
            else:
                error_msg = f"Error from DeepSeek endpoint: {response.status_code} - {response.text}"
                print(error_msg)
                return {"fullResponse": error_msg}
                
        except Exception as e:
            error_msg = f"Error calling DeepSeek model: {str(e)}"
            print(error_msg)
            
            # Retry on connection errors
            retry_count += 1
            if retry_count <= max_retries:
                wait_time = backoff_factor * (2 ** retry_count)
                print(f"Retrying in {wait_time} seconds... ({retry_count}/{max_retries})")
                time.sleep(wait_time)
            else:
                return {"fullResponse": error_msg}
    
    return {"fullResponse": f"Failed after {max_retries} retries"}

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
        
        # Get mapsheet from request or use default
        mapsheet = request.files.get('mapsheet')
        if mapsheet:
            mapsheet_path = os.path.join('/tmp', mapsheet.filename)
            mapsheet.save(mapsheet_path)
        else:
            mapsheet_path = os.getenv('DEFAULT_MAPSHEET', 'data_structurization/output_llama.xlsx')
        
        # Process each chunk and collect results
        results = []
        for chunk in clean['en']:
            res = structure_data(chunk, mapsheet_path)
            results.append(res)
        
        # Process all responses together
        df = process_chunked_responses(results, output_file, mapsheet_path)
        
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

@app_bp.route('/py/structure_data', methods=['POST'])
def struct():
    """Original route handler fixed to work with Flask properly"""
    try:
        # Get document from request
        doc = request.files.get('document')
        
        if not doc:
            return jsonify({"err": "document not received"}), 500
            
        # Get mapsheet from request or use default
        mapsheet = request.files.get('mapsheet')
        if mapsheet:
            mapsheet_path = os.path.join('/tmp', mapsheet.filename)
            mapsheet.save(mapsheet_path)
        else:
            mapsheet_path = os.getenv('DEFAULT_MAPSHEET', 'data_structurization/output_llama.xlsx')
        
        # Extract and process document
        text = extract_pdf_content(doc)
        clean = preprocess_data(text)
        
        # Process each chunk and collect results
        results = []
        for chunk in clean['en']:
            res = structure_data(chunk, mapsheet_path)
            results.append(res)
        
        # Process results and save CSV
        df = process_chunked_responses(results, "termsheet_output.csv", mapsheet_path)
        
        if df is not None:
            return jsonify({"message": "successfully stored structured csv in db"}), 200
        else:
            return jsonify({"err": "error in parsing to csv"}), 500
            
    except Exception as e:
        return jsonify({'err': str(e)}), 400

def save_model_responses(responses: list, base_output_path: str) -> str:
    """
    Save all model responses with timestamps and chunk numbers
    
    Args:
        responses (list): List of model responses
        base_output_path (str): Base path for output file
        
    Returns:
        str: Path to the saved responses file
    """
    timestamp = time.strftime("%Y%m%d_%H%M%S")
    output_path = f"{base_output_path}_responses_deep.txt"
    
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(f"Model Responses - {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Total Chunks: {len(responses)}\n")
            f.write("=" * 80 + "\n\n")
            
            for i, response in enumerate(responses, 1):
                f.write(f"Chunk {i}/{len(responses)}:\n")
                f.write("-" * 80 + "\n")
                
                # Handle different response types
                if isinstance(response, dict) and "fullResponse" in response:
                    f.write(f"Raw Response: {response['fullResponse']}")
                else:
                    f.write(f"Raw Response: {response}")
                
                f.write("\n\n")
                
        return output_path
        
    except Exception as e:
        print(f"Error saving model responses: {str(e)}")
        return None

def save_text_chunks(chunks: list, base_output_path: str) -> str:
    """
    Save raw text chunks with formatting and chunk numbers
    
    Args:
        chunks (list): List of text chunks
        base_output_path (str): Base path for output file
        
    Returns:
        str: Path to the saved chunks file
    """
    timestamp = time.strftime("%Y%m%d_%H%M%S")
    output_path = f"{base_output_path}_raw_chunks_deep.txt"
    
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(f"Raw Text Chunks - {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Total Chunks: {len(chunks)}\n")
            f.write("=" * 80 + "\n\n")
            
            for i, chunk in enumerate(chunks, 1):
                f.write(f"Chunk {i}/{len(chunks)}:\n")
                f.write("-" * 80 + "\n")
                f.write(chunk if isinstance(chunk, str) else '\n'.join(chunk))
                f.write("\n\n")
                
        return output_path
        
    except Exception as e:
        print(f"Error saving text chunks: {str(e)}")
        return None

def process_termsheet_pipeline(pdf_path: str, mapsheet_path: str, output_base: str) -> pd.DataFrame:
    """
    Complete pipeline for processing termsheets from PDF to structured data
    
    Args:
        pdf_path (str): Path to input PDF termsheet
        mapsheet_path (str): Path to Excel mapsheet with features
        output_base (str): Base path for output files (without extension)
        
    Returns:
        pd.DataFrame: Processed DataFrame or None on error
    """
    try:
        print(f"Processing {pdf_path}...")
        start = time.time()
        
        # 1. Extract text from PDF
        text = extract_pdf_content(pdf_path)
        if not text:
            print("Failed to extract text from PDF")
            return None
        
        # 2. Preprocess the extracted text
        clean = preprocess_data(text)
        
        # 3. Save raw text chunks
        chunks_file = save_text_chunks(clean['en'], output_base)
        if chunks_file:
            print(f"\nSaved raw text chunks to: {chunks_file}")
        
        # 4. Process each chunk
        print("Sending chunks to DeepSeek model via load balancer...")
        results = []
        raw_responses = []
        
        for i, chunk in enumerate(clean['en']):
            print(f"Processing chunk {i+1}/{len(clean['en'])}...")
            res = structure_data(chunk, mapsheet_path)
            raw_responses.append(res)
            results.append(res)
            
            # Add delay between chunks to avoid rate limiting
            if i < len(clean['en']) - 1:
                wait_time = 5
                print(f"Waiting {wait_time} seconds before processing next chunk...")
                time.sleep(wait_time)
        
        # 5. Save raw model responses
        responses_file = save_model_responses(raw_responses, output_base)
        if responses_file:
            print(f"\nSaved model responses to: {responses_file}")
        
        # 6. Process all responses and save files
        df = process_chunked_responses(results, output_base, mapsheet_path)
        
        if df is not None:
            print(f"\nProcessing complete! Time taken: {time.time() - start:.2f} seconds")
            print(f"Output saved to {output_base}.csv and {output_base}.xlsx")
            return df
        
        return None
        
    except Exception as e:
        print(f"Error in pipeline: {str(e)}")
        return None

if __name__ == "__main__":
    # Define input and output paths
    pdf_path = 'data_structurization/TS3.pdf'
    mapsheet_path = 'data_structurization/output_llama.xlsx'
    output_base = 'data_structurization/test3_deep_fewshot_final'
    
    # Run the pipeline
    df = process_termsheet_pipeline(pdf_path, mapsheet_path, output_base)
    
    if df is not None:
        print("\nFirst few rows of extracted data:")
        print(df.head())
    else:
        print("Pipeline failed to process the termsheet")
