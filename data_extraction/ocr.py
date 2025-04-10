import cv2
import pytesseract
from docx import Document
import pdfplumber
import pandas as pd
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
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                # text = page.extract_text()
                page_lines = text.splitlines()
                text_lines.extend(page_lines)
            if page.images:
                images.extend(page.images)
        pass
    return text_lines

def extract_excel_content(excel_path):
    file = pd.read_excel(excel_path)
    cols = file.columns
    rows = file.iloc[:]
    text = [cols,rows]
    return text

if __name__ == "__main__":
    img_path = "D:\coding\hack o hire\image.png"
    doc_path = 'D:\coding\hack o hire\PBL report format.docx'
    pdf_path = 'D:\coding\hack o hire\BAR38GDOIFR001400XD93_F_PC_N.pdf'
    excel_path = 'D:\coding\hack o hire\legal_features.xlsx'
    # doc,images = extract_pdf_content(pdf_path)
    # if len(images)>0:
    #     print("images found!! \n\n\n")
    
    # print(doc)
    # print(doc)
    # print("\n\n no. of paras: ",len(doc))
    txt = extract_excel_content(excel_path)
    print(txt)