from dotenv import load_dotenv
import os
import boto3
import json
from PIL import Image
import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image as ReportLabImage
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch

# Load environment variables
load_dotenv()

class TextractProcessor:
    def __init__(self):
        """Initialize AWS Textract client using credentials from .env"""
        self.textract = boto3.client(
            'textract',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_DEFAULT_REGION')
        )
        
    def process_document(self, image_path, output_pdf_path):
        """Process document image and create PDF with extracted information"""
        print(f"Processing image: {image_path}")
        
        # Read image
        with open(image_path, 'rb') as image_file:
            img_bytes = image_file.read()
            
        # Get full analysis from Textract (text, forms, tables)
        response = self.textract.analyze_document(
            Document={'Bytes': img_bytes},
            FeatureTypes=['TABLES', 'FORMS']
        )
        
        # Create PDF with extracted information
        self._create_pdf(response, image_path, output_pdf_path)
        
        return response
    
    def _get_rows_columns_map(self, table_result, blocks_map):
        """Extract rows and columns from table"""
        rows = {}
        for relationship in table_result['Relationships']:
            if relationship['Type'] == 'CHILD':
                for child_id in relationship['Ids']:
                    cell = blocks_map[child_id]
                    if cell['BlockType'] == 'CELL':
                        row_index = cell['RowIndex']
                        col_index = cell['ColumnIndex']
                        
                        if row_index not in rows:
                            rows[row_index] = {}
                            
                        rows[row_index][col_index] = self._get_cell_text(cell, blocks_map)
        return rows
    
    def _get_cell_text(self, cell, blocks_map):
        """Get text from a table cell"""
        text = ""
        if 'Relationships' in cell:
            for relationship in cell['Relationships']:
                if relationship['Type'] == 'CHILD':
                    for child_id in relationship['Ids']:
                        word = blocks_map[child_id]
                        if word['BlockType'] == 'WORD':
                            text += word['Text'] + ' '
                        if word['BlockType'] == 'SELECTION_ELEMENT':
                            if word['SelectionStatus'] == 'SELECTED':
                                text += 'X '
        return text.strip()
    
    def _get_form_key_values(self, response):
        """Extract key-value pairs from forms"""
        key_values = []
        blocks_map = {}
        
        # Create blocks map
        for block in response['Blocks']:
            blocks_map[block['Id']] = block
            
        # Get key-value relationships
        for block in response['Blocks']:
            if block['BlockType'] == 'KEY_VALUE_SET' and 'KEY' in block['EntityTypes']:
                key = self._extract_text_from_relationships(block, blocks_map)
                value = ""
                
                # Find corresponding value
                for relationship in block.get('Relationships', []):
                    if relationship['Type'] == 'VALUE':
                        for value_id in relationship['Ids']:
                            value_block = blocks_map[value_id]
                            value = self._extract_text_from_relationships(value_block, blocks_map)
                
                if key and value:
                    key_values.append((key, value))
                    
        return key_values
    
    def _extract_text_from_relationships(self, block, blocks_map):
        """Extract text from block relationships"""
        text = ""
        for relationship in block.get('Relationships', []):
            if relationship['Type'] == 'CHILD':
                for child_id in relationship['Ids']:
                    child_block = blocks_map[child_id]
                    if child_block['BlockType'] == 'WORD':
                        text += child_block['Text'] + ' '
                    elif child_block['BlockType'] == 'SELECTION_ELEMENT':
                        if child_block['SelectionStatus'] == 'SELECTED':
                            text += 'X '
        return text.strip()
    
    def _extract_tables(self, response):
        """Extract tables from response"""
        tables = []
        blocks_map = {}
        
        # Create blocks map
        for block in response['Blocks']:
            blocks_map[block['Id']] = block
            
        # Get tables
        for block in response['Blocks']:
            if block['BlockType'] == 'TABLE':
                table_data = []
                rows = self._get_rows_columns_map(block, blocks_map)
                
                # Sort rows and columns
                for row_idx in sorted(rows.keys()):
                    row_data = []
                    for col_idx in sorted(rows[row_idx].keys()):
                        row_data.append(rows[row_idx][col_idx])
                    table_data.append(row_data)
                    
                tables.append(table_data)
                
        return tables
    
    def _extract_plain_text(self, response):
        """Extract plain text (not in tables or forms)"""
        text_blocks = []
        
        for block in response['Blocks']:
            if block['BlockType'] == 'LINE':
                # Skip lines that are part of tables or forms
                is_part_of_table_or_form = False
                if 'Relationships' in block:
                    for rel in block['Relationships']:
                        if rel['Type'] == 'CHILD':
                            is_part_of_table_or_form = True
                            break
                
                if not is_part_of_table_or_form:
                    text_blocks.append(block['Text'])
                    
        return text_blocks
    
    def _create_pdf(self, response, image_path, output_path):
        """Create PDF with extracted text, tables, and forms"""
        # Extract information
        tables = self._extract_tables(response)
        form_fields = self._get_form_key_values(response)
        plain_text = self._extract_plain_text(response)
        
        # Create PDF
        doc = SimpleDocTemplate(output_path, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = []
        
        # Add title
        title_style = styles['Heading1']
        elements.append(Paragraph("Document Analysis Results", title_style))
        elements.append(Spacer(1, 0.25*inch))
        
        # Add original image section
        elements.append(Paragraph("Original Document", styles['Heading2']))
        elements.append(Spacer(1, 0.1*inch))
        
        # Add image to PDF (fixed approach)
        img = Image.open(image_path)
        img_width, img_height = img.size
        aspect = img_height / float(img_width)
        
        # Resize to fit page width
        display_width = 6.5 * inch  # Max width on letter page with margins
        display_height = display_width * aspect
        
        # Save temporary image file for ReportLab
        temp_img_path = "temp_image_for_pdf.png"
        img.save(temp_img_path)
        
        # Add image to elements
        img_to_add = ReportLabImage(temp_img_path, width=display_width, height=display_height)
        elements.append(img_to_add)
        elements.append(Spacer(1, 0.25*inch))
        
        # Add forms section if found
        if form_fields:
            elements.append(Paragraph("Form Fields", styles['Heading2']))
            elements.append(Spacer(1, 0.1*inch))
            
            # Create table for form fields
            form_data = [[Paragraph("<b>Field</b>", styles['Normal']), 
                         Paragraph("<b>Value</b>", styles['Normal'])]]
            
            for key, value in form_fields:
                form_data.append([
                    Paragraph(key, styles['Normal']),
                    Paragraph(value, styles['Normal'])
                ])
                
            form_table = Table(form_data, colWidths=[2.5*inch, 4*inch])
            form_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (1, 0), colors.lightgrey),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            elements.append(form_table)
            elements.append(Spacer(1, 0.25*inch))
        
        # Add tables section if found
        if tables:
            elements.append(Paragraph("Tables", styles['Heading2']))
            elements.append(Spacer(1, 0.1*inch))
            
            for i, table_data in enumerate(tables):
                elements.append(Paragraph(f"Table {i+1}", styles['Heading3']))
                elements.append(Spacer(1, 0.1*inch))
                
                # Convert all entries to strings and create paragraphs
                table_data = [[Paragraph(str(cell), styles['Normal']) for cell in row] for row in table_data]
                
                # Calculate column widths based on content and available width
                col_count = len(table_data[0]) if table_data else 0
                if col_count > 0:
                    col_width = 6.5 * inch / col_count
                    table = Table(table_data, colWidths=[col_width] * col_count)
                    
                    # Apply table style
                    table.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
                        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                    ]))
                    
                    elements.append(table)
                    elements.append(Spacer(1, 0.2*inch))
        
        # Add plain text section if found
        if plain_text:
            elements.append(Paragraph("Text Content", styles['Heading2']))
            elements.append(Spacer(1, 0.1*inch))
            
            for text in plain_text:
                elements.append(Paragraph(text, styles['Normal']))
                elements.append(Spacer(1, 0.05*inch))
        
        # Build PDF
        doc.build(elements)
        
        # Clean up temporary file
        try:
            os.remove(temp_img_path)
        except:
            pass
            
        print(f"PDF created successfully: {output_path}")


def main():
    # Example usage
    processor = TextractProcessor()
    
    # Set paths
    image_path = 'data_extraction\image.png'
    output_path = 'data_extraction\output.pdf'
    
    # Set default output path if not provided
    if not output_path:
        base_name = os.path.splitext(os.path.basename(image_path))[0]
        output_path = f"{base_name}_analysis.pdf"
    
    # Process image
    processor.process_document(image_path, output_path)
    print(f"Processing complete. Result saved to {output_path}")


if __name__ == "__main__":
    main()