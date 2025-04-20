# import sys
# import os
# sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langdetect import detect,DetectorFactory
from collections import defaultdict
import re
from data_extraction.ocr import extract_pdf_content


def clean_text(line):
    clean_line = line
    clean_line = re.sub(r'^\s+','',line).strip()
    clean_line = re.sub(r'^[\-=*_.~\s]{3,}|[\-=*_.~\s]{3,}$','',clean_line).strip()
    clean_line = re.sub(r'\.{3,}', ' ', clean_line).strip()
    return clean_line

def preprocess_data(doc):
    
    splitter = RecursiveCharacterTextSplitter(chunk_size=5000,chunk_overlap=100)
    content = doc.page_content
    chunks = splitter.split_text(content)
    DetectorFactory.seed = 0
    lang_dict = defaultdict(list)
    for chunk in chunks:
        clean_chunk = clean_text(chunk)
        try:
            lang = detect(clean_chunk)
            if lang=='en':
                lang_dict[lang].append(clean_chunk)
        except:
            print("Chunk causing error in detection: ",clean_chunk)
    return lang_dict


if __name__=='__main__':
    pdf_path = 'D:\coding\hack o hire\docs\Term Sheet - INE008A08U84.pdf'
    text = extract_pdf_content(pdf_path)
    if text:
        res = preprocess_data(text)
        print(res)
        print(len(res['en']),len(res['en'][0]))