import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME")

client = MongoClient(MONGODB_URL)

db = client[DATABASE_NAME]


def get_database():
    return db