from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, PointStruct
import time
import pandas as pd
import numpy as np

# Connect to Qdrant
client = QdrantClient(host="qdrant", port=6333)

# Configuration
COLLECTION_NAME = "test_collection"
VECTOR_SIZE = 1536  # Ada-002 produces 1536-dimensional vectors (changed from 512)

def create_collection():
    # Create collection with vector configuration for USE embeddings
    client.recreate_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=VECTOR_SIZE, distance="Cosine")
    )
    print(f"Created collection: {COLLECTION_NAME}")

def generate_and_upload_data():
    # Load the pre-generated dataset
    df = pd.read_csv('fake_sentences.csv')
    
    points = []
    for i, row in df.iterrows():
        # Convert string representation of embedding back to list
        embedding = eval(row['embedding'])
        
        point = PointStruct(
            id=i,
            vector=embedding,
            payload={
                "deprecated": row['deprecated'],
                "deprecated_at": time.strftime('%Y-%m-%d %H:%M:%S') if row['deprecated'] else None,
                "text": row['sentence']
            }
        )
        points.append(point)
    
    # Upload points in batches of 100 to avoid memory issues
    batch_size = 100
    for i in range(0, len(points), batch_size):
        batch = points[i:i + batch_size]
        client.upsert(
            collection_name=COLLECTION_NAME,
            points=batch
        )
        print(f"Uploaded batch {i//batch_size + 1} of {len(points)//batch_size + 1}")

def main():
    print("Starting data loading process...")
    create_collection()
    generate_and_upload_data()
    
    # Verify the upload
    collection_info = client.get_collection(COLLECTION_NAME)
    print(f"\nCollection info:")
    print(f"Points count: {collection_info.points_count}")
    print(f"Vectors size: {collection_info.config.params.vectors.size}")

    print("\nData loading completed!")

if __name__ == "__main__":
    main()