import os
from flask import Flask,request,jsonify,Blueprint
from .ocr import *
from flask_cors import CORS

app_bp = Blueprint("data_extraction",__name__)

@app_bp.route('/py/upload_docs',methods=['POST'])
def get_uploaded_docs():
    if request.method=='POST':
        data = request.get_json()
        type = data.get('type')
        file_path = data.get('file')

        if not type or file_path:
            return jsonify({'err','type or file not found'}),400

        text  = ""
        if type=='image':
            text+=(extract_img_content(file_path))
        elif type=='word':
            text+=(extract_word_content(file_path))
        elif type=='pdf':
            text+=(extract_pdf_content(file_path))
        else:
            return jsonify({'err':f'unsupported file format recieved :{type}'}),400
        
        if len(text)!=0:
            return jsonify({'text':text}),200
        pass
    else:
        return jsonify({"err":"invalid request method"}),400

