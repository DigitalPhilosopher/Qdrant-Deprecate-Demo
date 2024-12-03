from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, PointStruct
import numpy as np
import time

# Connect to Qdrant
client = QdrantClient(host="qdrant", port=6333)

# Configuration
COLLECTION_NAME = "test_collection"
VECTOR_SIZE = 128
NUM_POINTS = 1000

def create_collection():
    # Create collection with vector configuration
    client.recreate_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=VECTOR_SIZE, distance="Cosine")
    )
    print(f"Created collection: {COLLECTION_NAME}")

def generate_test_data():
    points = []
    for i in range(NUM_POINTS):
        # Generate random vector
        vector = np.random.rand(VECTOR_SIZE).tolist()
        
        # Set some points as deprecated randomly
        is_deprecated = np.random.choice([True, False], p=[0.2, 0.8])
        
        # Create point with payload
        point = PointStruct(
            id=i,
            vector=vector,
            payload={
                "deprecated": is_deprecated,
                "deprecated_at": time.strftime('%Y-%m-%d %H:%M:%S') if is_deprecated else None,
                "text": f"Sample text {i}",
                "category": np.random.choice(["A", "B", "C"]),
                "value": np.random.randint(1, 100)
            }
        )
        points.append(point)
        
        # Upload in batches of 100
        if len(points) == 100:
            client.upsert(
                collection_name=COLLECTION_NAME,
                points=points
            )
            print(f"Uploaded batch of points. Last ID: {i}")
            points = []
    
    # Upload remaining points
    if points:
        client.upsert(
            collection_name=COLLECTION_NAME,
            points=points
        )
        print("Uploaded remaining points")

def main():
    print("Starting data loading process...")
    create_collection()
    generate_test_data()
    
    # Verify the upload
    collection_info = client.get_collection(COLLECTION_NAME)
    print(f"\nCollection info:")
    print(f"Points count: {collection_info.points_count}")
    print(f"Vectors size: {collection_info.config.params.vectors.size}")
    print("Data loading completed!")

if __name__ == "__main__":
    main()