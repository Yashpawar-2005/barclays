from sqlalchemy import create_engine,inspect,MetaData
import os


engine= create_engine(os.getenv("DATABASE_URL"))
inspector = inspect(engine)

meta = MetaData()
meta.reflect(bind=engine)