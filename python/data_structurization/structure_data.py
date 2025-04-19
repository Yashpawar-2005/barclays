import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pandas as pd
import json
from transformers import AutoTokenizer
from data_extraction.clean_data import preprocess_data
from data_extraction.ocr import extract_pdf_content
import google.generativeai as genai
from dotenv import load_dotenv
import requests
import time
from flask import Blueprint,Response,jsonify,request

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

app_bp = Blueprint("structure_data",__name__)

def parse_csv(response):
    final_res = {}
    for res in response:
        if isinstance(res,dict):
            res_str = res.get("fullResponse","")
        elif isinstance(res,str):
            try:
                parsed = json.loads(res)
                res_str = parsed.get("fullResponse","")
            except:
                continue
        else:
            continue
        try:
            idx = res_str.find("json:")
            if idx==-1:
                continue
            end = res_str.find('}')+1
            json_str = res_str[idx + 5:end].strip()  
            json_str = json_str.replace('\\"', '"')     
            json_str = json_str.replace('\\n', '')      
            json_str = json_str.replace('\\', '')       

            json_data = json.loads(json_str)
            
            for key,value in json_data.items():
                if key not in final_res or final_res[key] in [None,"null","","N/A"]:
                    final_res[key] =  value
        except Exception as e:
            print(str(e))
            print("string:",json_str[:100])
            break
    df = None
    df = pd.DataFrame([final_res])
    return df.to_csv("termsheet.csv",na_rep="null")

def use_google_gemini(prompt):
    model = genai.GenerativeModel("gemini-1.5-pro")
    return model.generate_content(prompt)

def structure_data(text):
    prompt_template = """
Extract financial data from the following financial text and return ONLY a valid JSON object with the fields below \n.
Do not explain anything. If a field is not present, use null.Do not include placeholders or extra notes \n.
Extract financial data from the following financial text and return ONLY a valid JSON object with the fields below.
Do not explain anything. If a field is not present, use null. Do not include placeholders or extra notes.
These are the fields: issuer name, coupon_name, trade date, spot price, notional amount, strike price, call/put, expiry date, business calendar, delivery date, premium date, transaction copy, counter ccy, governing law, type of security.
Try to match fields semantically. If an exact field name is not found, infer the value from equivalent, closely related or commonly used synonyms or phrases in financial documents.
If you dont find exact field name, try to find fields that represent the same thing. \n
DO NOT GIVE ANY EXTRA TEXT BESIDE RAW JSON. DO NOT GIVE ANY EXPLANATIONS DISCLAIMERS.\n
ONLY RETURN VALID JSON, NOTHING ELSE\n
DO NOT PUT QUOTES AROUND NUMERICAL VALUES.\n
Follow this format: json:{...} \n
"""
    prompt = (prompt_template + "-START OF TERMSHEET-" + ','.join(text) + "- -END OF TERMSHEET")
    message = {
        "prompt": prompt
    }
    headers = {
        "Content-Type":"application/json",
    }
    # response = use_google_gemini(prompt)
    response = requests.post(os.getenv("LLAMA_MODEL_URL"),json=message,headers=headers)
    return response

@app_bp.route('py/structure_data')
def struct(doc):
    if request.method=='POST':
        try:
            clean = {}
            if doc:
                clean = preprocess_data(doc)
            else:
                return jsonify({"err":"document not recieved"}),500
            results = []
            for chunk in clean['en']:
                res = structure_data(chunk)
                results.append(res.json())
            df = parse_csv(results)
            if df is not None:
                return jsonify({"message":"successfully stored structured csv in db"}),200
            else:
                return jsonify({"err":"error in parsing to csv"}),500
        except Exception as e:
            return jsonify({'err':str(e)}),400
    else:
        return jsonify({"err":"invalid request method"}),400

if __name__ == "__main__":
    pdf_path = 'D:\coding\hack o hire\docs\Term Sheet - INE008A08U84.pdf'
    text = extract_pdf_content(pdf_path)
    start = time.time()
    clean = {}
    if(text):
        clean = preprocess_data(text)
    results  = []
    for chunk in clean['en']:
        res = structure_data(chunk)
        print("data recieved: ",res.text)
        results.append(res.json())
        # break
    df = parse_csv(results)
    if df is not None:
        print(df.head())
    print("Time taken ", time.time() - start)

