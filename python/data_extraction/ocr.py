# import sys
# import os
# sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from langchain_core.documents import Document

import cv2
import pytesseract
import pymupdf
import pandas as pd
import platform

if platform.system()=='Windows':
    pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def extract_img_content(img_path):
    
    img = cv2.imread(img_path)
    img = cv2.cvtColor(img,cv2.COLOR_BGR2GRAY)
    text = []
    img_str = pytesseract.image_to_string(img_path)
    text.extend(img_str.splitlines())

    return text

def extract_word_content(word_path):
    result = ""
    doc = pymupdf.open(word_path)
    for page in doc:
        tabs = page.find_tables()
        if len(tabs.tables)>0:
            for i in range(len(tabs.tables)):
                result+= tabs[i].to_markdown()
        else:
            result+= page.get_text()
        pass
    lc_doc = Document(page_content=result,metadata={"source":"Termsheet docx"})
    return lc_doc

def extract_pdf_content(pdf_path):
    doc  = pymupdf.open(pdf_path)
    result = ""
    for page in doc:
        tabs = page.find_tables()
        if len(tabs.tables)>0:
            for i in range(len(tabs.tables)):
                result+= tabs[i].to_markdown()
        else:
            result+= page.get_text()
        pass
    lc_doc = Document(page_content=result,metadata={"source":"Termsheet pdf"})
    return lc_doc

def extract_excel_content(excel_path):
    result = ""
    df = pd.read_excel(excel_path)
    result += df.to_markdown()
    lc_doc = Document(page_content=result,metadata={"source":"Termsheet excel"})
    return lc_doc
    

if __name__ == "__main__":
    img_path = "D:\coding\hack o hire\image.png"
    doc_path = 'D:\coding\hack o hire\docs\Assignment addressing modes.docx'
    pdf_path = 'D:\coding\hack o hire\docs\Term Sheet - INE008A08U84.pdf'
    excel_path = 'D:\coding\hack o hire\legal_features.xlsx'
    txt = extract_word_content(doc_path)
    print(txt.page_content)