import os
import pandas as pd
import sys
import json
from io import StringIO
import requests
import time
from dotenv import load_dotenv

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from data_extraction.clean_data import preprocess_data
from data_extraction.ocr import extract_pdf_content
from flask import Blueprint, Response, jsonify, request

load_dotenv()


def _read_table(path: str) -> pd.DataFrame:
    """
    Reads a CSV or Excel file into a DataFrame based on the file extension.
    """
    ext = os.path.splitext(path)[1].lower()
    if ext in {'.xls', '.xlsx', '.xlsm', '.xlsb'}:
        return pd.read_excel(path)
    else:
        return pd.read_csv(path)


def prepare_table_comparison_prompt(path1: str, path2: str) -> str:
    """
    Reads two table files (CSV or Excel) and returns a prompt string
    suitable for feeding into a Llama-70B model to compare them.
    """
    df1 = _read_table(path1)
    df2 = _read_table(path2)

    csv_text1 = df1.to_csv(index=False)
    csv_text2 = df2.to_csv(index=False)

    prompt = (
        "You are given two tabular datasets. Compare them and describe all differences. "
        "These two are extracted features from termsheet and a mapsheet. "
        "Find all the discrepanices and list them in csv format\n\n"
        "=== FILE 1 ===\n"
        f"{csv_text1}\n"
        "=== FILE 2 ===\n"
        f"{csv_text2}\n\n"
        "=== COMPARISON ===\n"

        
        "Format your response in CSV format with the following columns: 'Feature', 'File 1 Value', 'File 2 Value', 'Match/Discrepancy', 'Authority', 'Suggestion to fix the discrepancy', 'Severity Score'.\n\n"
        "Only give csv format output. Do not give any other text or explanation.\n\n"
        "The authority column should contain the authority that is responsible for the feature. Choose between Lawyer, Accountant, Other, Not-Valid. Choose Not-Valid if the Match/Discrepancy Column is Match\n\n"
        "The suggestion column should contain the suggestion to fix the discrepancy.\n\n"
        "The match/discrepancy column should contain 'Match' if the values are the same, and 'Discrepancy' if they are different.\n\n"
        "The severity score should be a number between 1 and 10, where 1 is the least severe and 10 is the most severe.\n\n"
        
        "ONLY GIVE RAW CSV TEXT. DO NOT GIVE ANY OTHER TEXT OR EXPLANATION.\n\n"
    )
    return prompt


def pass_llm(prompt: str) -> requests.Response:
    message = {"prompt": prompt}
    headers = {"Content-Type": "application/json"}
    llama_url = 'http://balancer-1855376680.us-east-1.elb.amazonaws.com'
    if not llama_url:
        raise ValueError("LLAMA_MODEL_URL environment variable not set")
    return requests.post(llama_url, json=message, headers=headers)


def call_load_balancer(prompt: str = "hi. how are you?") -> requests.Response:
    """
    Makes a POST request to the AWS Elastic Load Balancer endpoint.
    
    Args:
        prompt (str): The prompt to send to the endpoint
        
    Returns:
        requests.Response: The response from the endpoint
    """
    # The DNS of your Elastic Load Balancer
    url = 'http://balancer-1855376680.us-east-1.elb.amazonaws.com'
    
    # The data you want to send in the POST request
    data = {
        "prompt": prompt
    }
    
    # Set headers
    headers = {
        'Content-Type': 'application/json'
    }
    
    try:
        # Record start time to calculate response time
        start_time = time.time()
        
        # Make the POST request
        response = requests.post(url, json=data, headers=headers)
        
        # Calculate response time
        response_time = time.time() - start_time
        
        # Print response information
        print('Load Balancer Response:', response.json())
        print('Status Code:', response.status_code)
        print('Response Headers:', dict(response.headers))
        
        # Try to access choices if available in the response
        try:
            print('Response Time:', response_time)
            print('First Choice:', response.json().get('choices', [])[0] if response.json().get('choices') else None)
        except (KeyError, IndexError):
            print('No choices found in response')
            
        return response
        
    except requests.exceptions.RequestException as e:
        print(f'Error calling Load Balancer: {str(e)}')
        return None


def convert_response_to_excel(response: requests.Response, output_path: str) -> pd.DataFrame:
    """
    Converts the LLM response into an Excel file and returns the DataFrame.
    
    Args:
        response (requests.Response): LLM response
        output_path (str): Path to save Excel file
        
    Returns:
        pd.DataFrame: Processed DataFrame or None on error
    """
    try:
        # Parse the outer JSON structure
        
        data = response.json()
        
        # Extract the nested JSON string from fullResponse
        # full_response = json.loads(data.get('fullResponse', '{}'))
        csv_text = data['choices'][0]['message']['content']

        
        # Get the generation field which contains the CSV string
        # csv_text = full_response.get('generation', '')
        
        # Clean up escaped quotes and newlines
        csv_text = csv_text.strip()
        csv_text = csv_text.replace('\\n', '\n')
        csv_text = csv_text.replace('\\"', '"')
        
        # Convert CSV string to DataFrame
        df = pd.read_csv(StringIO(csv_text),on_bad_lines='skip')
        
        # Save to Excel with formatting
        with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Comparison')
            
            # Auto-adjust columns width
            worksheet = writer.sheets['Comparison']
            for idx, col in enumerate(df.columns):
                max_length = max(
                    df[col].astype(str).apply(len).max(),
                    len(str(col))
                ) + 2
                worksheet.column_dimensions[chr(65 + idx)].width = max_length
        
        print(f"Comparison Excel file saved to: {output_path}")
        return df
        
    except Exception as e:
        print(f"Error converting response to Excel: {str(e)}")
        print("Raw response:", response.text[:200])
        return None


def split_comparison_results(excel_path: str, output_dir: str = "data_validation") -> tuple:
    """
    Takes a comparison Excel file and creates two JSON files:
    one for matched features and one for discrepancies.
    
    Args:
        excel_path (str): Path to the comparison Excel file
        output_dir (str): Directory to save the JSON files
        
    Returns:
        tuple: Paths to the created JSON files (matches_path, discrepancies_path)
    """
    try:
        # Read the Excel file
        df = pd.read_excel(excel_path)
        
        # Split into matches and discrepancies
        matches = df[df['Match/Discrepancy'] == 'Match'].to_dict('records')
        discrepancies = df[df['Match/Discrepancy'] == 'Discrepancy'].to_dict('records')
        
        # Create output paths
        matches_path = os.path.join(output_dir, 'matches.json')
        discrepancies_path = os.path.join(output_dir, 'discrepancies.json')
        
        # Save as JSON files with proper formatting
        with open(matches_path, 'w', encoding='utf-8') as f:
            json.dump({
                'total_matches': len(matches),
                'features': matches
            }, f, indent=2)
            
        with open(discrepancies_path, 'w', encoding='utf-8') as f:
            json.dump({
                'total_discrepancies': len(discrepancies),
                'features': discrepancies
            }, f, indent=2)
            
        print(f"Created matches file: {matches_path}")
        print(f"Created discrepancies file: {discrepancies_path}")
        print(f"Total matches: {len(matches)}")
        print(f"Total discrepancies: {len(discrepancies)}")
        
        return matches_path, discrepancies_path
        
    except Exception as e:
        print(f"Error splitting comparison results: {str(e)}")
        return None, None


# Example usage
if __name__ == "__main__":
    # # Example 1: Call the load balancer endpoint with a simple prompt
    # print("Testing Load Balancer endpoint...")
    # test_prompt = "hi. how are you?"
    # load_balancer_response = call_load_balancer(test_prompt)
    
    # # If you want to use a more complex prompt from your comparison logic:
    # # file1 = "data_validation/output_llama.xlsx"
    # # file2 = "data_validation/termsheet_output_llama.csv"
    # # comparison_prompt = prepare_table_comparison_prompt(file1, file2)
    # # load_balancer_response = call_load_balancer(comparison_prompt)
    
    # Example 2: Original table comparison workflow
    print("\nRunning table comparison workflow...")
    file1 = "data_validation/output_llama.xlsx"
    file2 = "data_validation/termsheet_output_llama.csv"
    output_excel = "data_validation/comparison_output.xlsx"
    print("passing to get prompt")
    prompt = prepare_table_comparison_prompt(file1, file2)
    print("prompty recieved \npassing to llm")
    response = pass_llm(prompt)
    

    if response.status_code == 200:
        try:
            print("gettig json from response")
            data = response.json()
            print("data: ",data)
            print(f"Keys in response: {list(data.keys())}")
            
            print("converting to excel")
            df = convert_response_to_excel(response, output_excel)
            print("excel converted")

            if df is not None:
                print("\nFirst few rows of the comparison:")
                print(df.head())
                
                # Split results into separate JSON files
                matches_path, discrepancies_path = split_comparison_results(output_excel)
            
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON: {str(e)}")
            print("Raw response:", response.text[:200])
    else:
        print(f"Error: {response.status_code} - {response.text}")
