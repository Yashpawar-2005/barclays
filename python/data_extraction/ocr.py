import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


import cv2
import pytesseract
from docx import Document
import pdfplumber
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
    doc = Document(word_path)
    text = []
    for para in doc.paragraphs:
        text.append(para.text)
    return text

def extract_pdf_content(pdf_path):
    text_lines = []
    images = []
    table_settings = {
        "vertical_strategy": "lines",
        "horizontal_strategy": "lines",
        "snap_tolerance": 3,
        "min_words_vertical":2
    }
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            table = page.extract_table(table_settings=table_settings)
            if table:
                table = pd.DataFrame(table[1::],columns=table[0])
                table_content = extract_excel_content(dataframe=table)
                text_lines.extend(content for content in table_content)
            else:
                text = page.extract_text()
                if text:
                    page_lines = text.splitlines()
                    text_lines.extend(page_lines)
                if page.images:
                    images.extend(page.images)
        pass
    return text_lines

def extract_excel_content(excel_path = None,dataframe:pd.DataFrame = None):
    if excel_path:
        dataframe = pd.read_excel(excel_path)
    elif dataframe is not None:
        table_content = []
        cols = ("Columns: "+ ','.join(str(col) for col in dataframe.columns))
        rows = ("Rows: "+ '\n'.join([" | ".join(map(str,row)) for row in dataframe.iloc[1:].values]))
        table_content.append(rows)
        table_content.append(cols)
        return table_content
        pass
    

if __name__ == "__main__":
    img_path = "D:\coding\hack o hire\image.png"
    doc_path = 'D:\coding\hack o hire\PBL report format.docx'
    pdf_path = 'D:\coding\hack o hire\Term Sheet - INE008A08U84.pdf'
    excel_path = 'D:\coding\hack o hire\legal_features.xlsx'
    txt = extract_pdf_content(pdf_path)
    print(txt)