import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pandas as pd
import json
from transformers import AutoTokenizer
from data_extraction.clean_data import preprocess_data
from data_extraction.ocr import *
import google.generativeai as genai
from dotenv import load_dotenv
import requests
import time
import datetime
import boto3
import io
import re
# from flask import Blueprint,Response,jsonify,request
from sqlalchemy import select,join,insert,update
from config import *
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# app_bp = Blueprint("structure_data",__name__)

def extract_params_from_mapsheet(map_path,mapsheet_path):
    if mapsheet_path=="CSV":
        df = pd.read_csv(map_path)
    else:
        df = pd.read_excel(map_path)
    cols = df.columns
    feats = df.iloc[1:,0]
    return list(feats)

def download_file_from_url(url, save_path):
    r = requests.get(url)
    if r.status_code != 200:
        raise Exception(f"Failed to download file: {url}")
    with open(save_path, "wb") as f:
        f.write(r.content)
    return save_path

def parse_csv(response):
    final_res = {}

    for res in response:
        res_str = ""

        if isinstance(res, dict):
            res_str = res.get("fullResponse", "") or res.get("generation", "")
        elif isinstance(res, str):
            try:
                parsed = json.loads(res)
                res_str = parsed.get("fullResponse", "") or parsed.get("generation", "")
            except json.JSONDecodeError:
                res_str = res  
        else:
            continue

        try:
            # print("response gotten:", res)

            
            match = re.search(r'json[:\s]*({.*?})', res_str, re.DOTALL)
            if not match:
                continue

            json_str = match.group(1)

            
            json_str = json_str.replace('\\"', '"').replace("\\n", "").replace("\\\\", "\\")

            
            json_data = json.loads(json_str)

            
            for key, value in json_data.items():
                if key not in final_res or final_res[key] in [None, "null", "", "N/A"]:
                    final_res[key] = value

        except json.JSONDecodeError as e:
            print("JSON decode error:", str(e))
            print("Problematic string snippet:", json_str[:150])
            continue
        except Exception as e:
            print("Other error:", str(e))
            continue

    df = pd.DataFrame([final_res])
    return df 

def use_google_gemini(prompt):
    model = genai.GenerativeModel("gemini-1.5-pro")
    return model.generate_content(prompt)

def structure_data(text,features):
    f= ','.join(set(features))
    # print(f)
    prompt_template = f"""
Extract financial data from the following financial text and return ONLY a valid JSON object with the fields below \n.
Do not explain anything. If a field is not present, use null.Do not include placeholders or extra notes \n.
Extract financial data from the following financial text and return ONLY a valid JSON object with the fields below.
Do not explain anything. If a field is not present, use null. Do not include placeholders or extra notes.
These are the fields: {f}
Try to match fields semantically. If an exact field name is not found, infer the value from equivalent, closely related or commonly used synonyms or phrases in financial documents.
If you dont find exact field name, try to find fields that represent the same thing. \n
DO NOT GIVE ANY EXTRA TEXT BESIDE RAW JSON. DO NOT GIVE ANY EXPLANATIONS DISCLAIMERS.\n
ONLY RETURN VALID JSON, NOTHING ELSE\n
DO NOT PUT QUOTES AROUND NUMERICAL VALUES.\n
ONLY return raw JSON starting with `json:{...}`. Do NOT wrap this in quotes or escape any characters. \n
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

def struct(termsheet_id):
    # if request.method=='POST':
        try:
            print("heelo")
            # data  = request.get_json()
            print("1")
            termsheet_table = meta.tables["Termsheet"]
            print("2")
            file = meta.tables["File"]
            print("3")
            file_id = termsheet_id 
            print("4")

            # connect to db for getting mapsheet features 
            with engine.connect() as conn:
                query = select(file.c.type,file.c.s3Link).join(termsheet_table,file.c.id==termsheet_table.c.mapsheetFileId).where(termsheet_table.c.id==file_id)
                map_data = conn.execute(query).fetchone()
            map_sheet_type = map_data[0]
            map_sheet_link = map_data[1]
            valid_mapsheet = False
            if map_sheet_type=="CSV":
                local_map_path = ".temp/mapsheet.csv"
                valid_mapsheet = True
            elif map_sheet_type=="EXCEL":
                local_map_path = ".temp/mapsheet.xlsx"
                valid_mapsheet = True
            else:
                pass
            features = ["issuer name", "coupon_name", "trade date", "spot price", "notional amount", "strike price", "call/put", "expiry date", "business calendar", "delivery date", "premium date", "transaction copy", "counter ccy", "governing law", "type of security"]
            if(valid_mapsheet):
                download_file_from_url(map_sheet_link,save_path=local_map_path)
                features = extract_params_from_mapsheet(local_map_path,map_sheet_type)
                print("extracted features: ",features)
            else:
                print("no valid mapsheet")
            print("got shit from shit",file_id)
            file_type = None
            file_str = None
            with engine.connect() as conn:
                print("connected to db")
                try:
                    print("Columns in termsheet_table:", termsheet_table.columns.keys())
                    print("Columns in file_table:", file.columns.keys())
                    query = select(file.c.type,file.c.s3Link).join(termsheet_table,file.c.id== termsheet_table.c.ourtermsheetFileId).where(termsheet_table.c.id == file_id)
                    res = conn.execute(query).fetchone()
                except Exception as e:
                    print(str(e))
            print("5")
            file_type = res[0]
            file_url = res[1]

            #for local path
            if file_type=='IMAGE':
                local_path = "./temp/temp_file.png"
                
            elif file_type == "WORD_DOCUMENT":
                doc = extract_word_content(file_str)
                local_path = "./temp/temp_file.docx"
            elif file_type=="PDF":
                doc = extract_pdf_content(file_str)
                local_path = "./temp/temp_file.pdf"
            elif file_type == "EXCEL":
                doc = extract_excel_content(file_str)
                local_path = "./temp/temp_file.xlsx"
            # else:
            #     return jsonify({"err":"invalid file format"}),400
            
            os.makedirs(os.path.dirname(local_path), exist_ok=True)
            file_str= download_file_from_url(file_url,save_path = local_path)
            print("got stuff from tables")
            # if not file_type:
                # return jsonify({"err":"didnt get file name"}),500
            
            #for data extraction
            if file_type=='IMAGE':
                doc = extract_img_content(file_str)
            elif file_type == "WORD_DOCUMENT":
                doc = extract_word_content(file_str)
            elif file_type=="PDF":
                doc = extract_pdf_content(file_str)
            elif file_type == "EXCEL":
                doc = extract_excel_content(file_str)
            # else:
                
                # return jsonify({"err":"invalid file format"}),400
            print("got documentsss")
            
            clean = {}
            if doc:
                clean = preprocess_data(doc)
            # else:
            #     return jsonify({"err":"document not recieved"}),500
            print("cleanneeddd")
            results = []
            for chunk in clean['en']:
                res = structure_data(chunk,features)
                results.append(res.json())
            df = parse_csv(results)
            if df is not None:
                print("got csvvv, uploading to s3....")
                s3 = boto3.resource(
                    "s3",
                    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
                    region_name=os.getenv("AWS_REGION")
                )
                timestamp = datetime.datetime.utcnow().strftime("%Y%m%d_%H%M%S")
                os.makedirs("output", exist_ok=True)
                filename = f"output/structured_data_{timestamp}.csv"
                df.to_csv(filename,index=False,na_rep="null")

                # csv_buffer = io.BytesIO(df.encode("utf-8"))
                with open(filename,"rb") as f:
                    s3.Bucket(os.getenv("AWS_S3_BUCKET")).upload_fileobj(f, filename)

                print("uploaded to s3!!!!!")


                s3_link = f"https://barcla.s3.ap-south-1.amazonaws.com/{filename}"

                with engine.begin() as conn:
                    file_insert_query = insert(file).values(
                        s3Link = s3_link,
                        type = "CSV"
                    ).returning(file.c.id)
                    result = conn.execute(file_insert_query)
                    res_id = result.scalar()

                    update_query = (
                        update(termsheet_table)
                        .where(termsheet_table.c.id==file_id)
                        .values(structuredsheetFileId=res_id,status="TO BE VALIDATED")
                    )
                    conn.execute(update_query)
                # return jsonify({"message":"successfully stored structured csv in db"}),200
            # else:
            #     return jsonify({"err":"error in parsing to csv"}),500
            os.remove(local_path)
        except Exception as e:
            print("Exception: ",str(e))
    # else:
    #     return jsonify({"err":"invalid request method"}),400

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

