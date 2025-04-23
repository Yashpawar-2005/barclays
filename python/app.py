# from flask import Flask
# from data_structurization import structure_data
# from config import *

# from flask_cors import CORS
# import os
# from dotenv import load_dotenv
# from flask_sqlalchemy import SQLAlchemy
# from sqlalchemy import MetaData
# load_dotenv()
# app = Flask(__name__)
# CORS(app=app,supports_credentials=True)

# app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# db.init_app(app)

# def reflect_tables():
#     with app.app_context():
#         metadata.reflect(bind=db.engine)
#         tables.update(metadata.tables)

# reflect_tables()


# app.register_blueprint(structure_data.app_bp)

# if __name__ == "__main__":
#     app.run(debug=True,port=5000)