import os
from data_extraction import ocr
from flask import Flask,request,jsonify
from ocr import *
from flask_cors import CORS


app = Flask(__name__)
CORS(app=app,supports_credentials=True)

@app.route('/upload_docs',methods=['POST'])
def get_uploaded_docs():
    if request.method=='POST':
        data = request.get_json()
        type = data.get('type')
        file_path = data.get('file')

        if not type or file_path:
            return jsonify({'err','type or file not found'}),400

        text = []
        if type=='image':
            text.extend(extract_img_content(file_path))
        elif type=='word':
            text.extend(extract_word_content(file_path))
        elif type=='pdf':
            text.extend(extract_pdf_content(file_path))
        else:
            return jsonify({'err':f'unsupported file format recieved :{type}'}),400

        pass
    else:
        return jsonify({"err":"invalid request method"}),400


if __name__=='__main__':
    app.run(debug=True)