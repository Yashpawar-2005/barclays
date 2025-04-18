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
from flask import Blueprint,Response,jsonify

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

app_bp = Blueprint("structure_data",__name__)

def parse_to_csv(response):
    strt = response.find('{')
    end = response.find('}')+1
    json_str = response[strt:end]
    df = None
    try:
        data = json.loads(json_str)
        df = pd.DataFrame([data])
    except json.JSONDecodeError:
        print("Invalid JSON STRING")
        print(repr(json_str))
    return df

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
DO NOT PUT QUOTES AROUND NUMERICAL VALUES   
"""
    prompt = (prompt_template + "-START OF TERMSHEET-" + ','.join(text) + "- -END OF TERMSHEET")
    message = {
        "prompt": prompt
    }
    headers = {
        "Content-Type":"application/json",
    }
    response = use_google_gemini(prompt)
    # response = requests.post(os.getenv("MODEL_URL"),json=message,headers=headers)
    return response





if __name__ == "__main__":
    pdf_path = 'D:\coding\hack o hire\BAR38GDOIFR001400XD93_F_PC_N.pdf'
    text = extract_pdf_content(pdf_path)
    start = time.time()
    clean = {}
    if(text):
        clean = preprocess_data(text)
    res = structure_data(clean['en'])
    df = parse_to_csv(res.text)
    if df is not None:
        print(df.head())
    print("Time taken ", time.time() - start)

