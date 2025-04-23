from data_structurization.structure_data import struct
from Data_Validation.highlighter import main_highlight
from Data_Validation.val import main_val
from Data_Validation.route_emails import main_emails
from config import *

#extract from queue logic here
termsheet_id= None
org_id = None


print("structurizing termsheet")
struct(termsheet_id=termsheet_id)
print("termsheet_structurized \nvalidating termsheet")
main_val(termsheet_id=termsheet_id)
print("validation done \nhighlighting descrepancies")
main_highlight(termsheet_id=termsheet_id)
print("highlighting complete\nsending emails")
main_emails(termsheet_id=termsheet_id,org_id=org_id)
print("PROCESS COMPLETE")
