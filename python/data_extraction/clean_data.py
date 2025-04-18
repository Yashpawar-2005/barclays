import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


from langdetect import detect,DetectorFactory
from collections import defaultdict
import re
from .ocr import extract_pdf_content


def preprocess_data(text):
    #cleaning data
    cleaned = []
    for line in text:
        clean_line = line
        clean_line = re.sub(r'^\s+','',line).strip()
        clean_line = re.sub(r'^[\-=*_.~\s]{3,}|[\-=*_.~\s]{3,}$','',clean_line).strip()
        clean_line = re.sub(r'\.{3,}', ' ', clean_line).strip()
        if clean_line and len(clean_line)>10 and (c.isalpha() for c in clean_line):
            cleaned.append(clean_line)

    #detecting english sentences for now
    DetectorFactory.seed = 0
    lang_dict = defaultdict(list)
    for sentence in cleaned:
        try:
            lang = detect(sentence)
            if lang=='en':
                lang_dict[lang].append(sentence)
        except:
            print("line causing issues in detection: ",sentence)

    return lang_dict


if __name__=='__main__':
    pdf_path = 'D:\coding\hack o hire\BAR38GDOIFR001400XD93_F_PC_N.pdf'
    text = extract_pdf_content(pdf_path)
    if text:
        print(preprocess_data(text))