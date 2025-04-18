from flask import Flask
from data_extraction import input_detection
from data_structurization import structure_data
from flask_cors import CORS

app = Flask(__name__)
CORS(app=app,supports_credentials=True)

app.register_blueprint(input_detection.app_bp)
app.register_blueprint(structure_data.app_bp)

if __name__ == "__main__":
    app.run(debug=True,port=5000)