from bson import ObjectId
from typing import Any


def serialize_doc(doc: dict) -> dict:
    """Convert MongoDB document to JSON-serializable dict"""
    if doc is None:
        return None
    
    doc_copy = doc.copy()
    
    # Convert ObjectId to string
    if "_id" in doc_copy:
        doc_copy["id"] = str(doc_copy["_id"])
        del doc_copy["_id"]
    
    # Convert any nested ObjectIds
    for key, value in doc_copy.items():
        if isinstance(value, ObjectId):
            doc_copy[key] = str(value)
        elif isinstance(value, list):
            doc_copy[key] = [
                serialize_doc(item) if isinstance(item, dict) else str(item) if isinstance(item, ObjectId) else item
                for item in value
            ]
        elif isinstance(value, dict):
            doc_copy[key] = serialize_doc(value)
    
    return doc_copy


def serialize_list(docs: list) -> list:
    """Convert list of MongoDB documents to JSON-serializable list"""
    return [serialize_doc(doc) for doc in docs]
