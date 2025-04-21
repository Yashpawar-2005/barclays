import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from highlighter import *
from val import *
from config import meta,inspector,engine

import boto3
from sqlalchemy import select
from botocore.exceptions import ClientError
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication

from dotenv import load_dotenv
load_dotenv()

def download_file_from_url(url,save_path):
    r = requests.get(url)
    if r.status_code!=200:
        raise Exception(f"Failed to download file {url}")
    with open(save_path,"wb") as f:
        f.write(r.content)



# engine= create_engine(os.getenv("DATABASE_URL"))
# inspector = inspect(engine)

# meta = MetaData()
# meta.reflect(bind=engine)

tables = inspector.get_table_names()
print("Tables: ",tables)

termsheet_id = "54"
org_id = "19"

org = meta.tables["Organisation"]
user_org = meta.tables["UserOrganisation"]
user = meta.tables["User"]
file = meta.tables["File"]
termsheet = meta.tables["Termsheet"]

email_query = select(user.c.email).select_from(user.join(user_org,user_org.c.userId==user.c.id)).where(user_org.c.organisationId==org_id)
val_query = select(file.c.s3Link).join(termsheet,file.c.id==termsheet.c.validatedsheetFileId).where(termsheet.c.id==termsheet_id)
pdf_query = select(file.c.s3Link).join(termsheet,file.c.id==termsheet.c.coloursheetFileId).where(termsheet.c.id==termsheet_id)
struc_query = select(file.c.s3Link).join(termsheet,file.c.id==termsheet.c.structuredsheetFileId).where(termsheet.c.id==termsheet_id)

with engine.connect() as conn:
    res = conn.execute(email_query).fetchall()
    val_res = conn.execute(val_query).fetchone()
    pdf_res = conn.execute(pdf_query).fetchone()
    struc_res = conn.execute(struc_query).fetchone()

val_path = "output/val.xlsx"
pdf_path = "output/highlighted.pdf"
struc_path = "output/struc.csv"

download_file_from_url(val_res[0],val_path)
download_file_from_url(pdf_res[0],pdf_path)
download_file_from_url(struc_res[0],struc_path)

emails = [row[0] for row in res]
attachments = [val_path,pdf_path,struc_path]
def send_emails(reciever):
    client = boto3.client('ses',region_name=os.getenv("AWS_REGION"))
    body = "Please find the following attachments \n"
    sender = "shashawte@gmail.com"
    subject = "Docs"
    msg = MIMEMultipart()
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = reciever
    msg.attach(MIMEText(body,'plain',"utf-8"))
    for path in attachments:
        with open(path,"rb") as f:
            part = MIMEApplication(f.read())
            part.add_header("Content-Disposition","attachment",filename=os.path.basename(path))
            msg.attach(part)

    try:
        response = client.send_raw_email(
            Source = sender,
            Destinations = [reciever],
            RawMessage = {'Data':msg.as_string()}
        )
        print(f"email sent, message id: {response["MessageId"]}")
    except ClientError as e:
        print(f"client error for {reciever},{e.response["Error"]["Message"]}")

for reciever in emails:
    send_emails(reciever=reciever)