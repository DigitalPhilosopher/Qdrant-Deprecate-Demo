from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, PointStruct
import tensorflow as tf
import tensorflow_hub as hub
import numpy as np
import time

# Connect to Qdrant
client = QdrantClient(host="qdrant", port=6333)

# Configuration
COLLECTION_NAME = "text_embeddings"
VECTOR_SIZE = 512  # Universal Sentence Encoder produces 512-dimensional vectors
NUM_POINTS = 5

class TextEmbedding:
    def __init__(self):
        self.model = None
        
    def load_model(self):
        """Load the Universal Sentence Encoder model"""
        if not self.model:
            print('Loading Universal Sentence Encoder model...')
            self.model = hub.load('https://tfhub.dev/google/universal-sentence-encoder/4')
            print('Model loaded successfully!')
        return self.model
    
    def generate_embeddings(self, texts):
        """Generate embeddings for a single text or list of texts"""
        if not self.model:
            self.load_model()
            
        # Convert single text to list if necessary
        if isinstance(texts, str):
            texts = [texts]
            
        # Generate embeddings
        embeddings = self.model(texts)
        return embeddings.numpy()

def create_collection():
    # Create collection with vector configuration for USE embeddings
    client.recreate_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=VECTOR_SIZE, distance="Cosine")
    )
    print(f"Created collection: {COLLECTION_NAME}")

def generate_sample_texts():
    """Generate sample texts for demonstration"""
    sample_texts = [
        "Machine learning is transforming the technology landscape",
        "Natural language processing enables human-computer interaction",
        "Vector databases are essential for semantic search",
        "Deep learning models can understand context in text",
        "Artificial intelligence is advancing rapidly"
    ]
    return sample_texts[:NUM_POINTS]

def generate_and_upload_data():
    # Initialize text embedding model
    embedder = TextEmbedding()
    
    # Generate sample texts
    texts = generate_sample_texts()
    
    # Generate embeddings for all texts
    embeddings = embedder.generate_embeddings(texts)
    
    points = []
    for i, (text, vector) in enumerate(zip(texts, embeddings)):
        # Set some points as deprecated randomly
        is_deprecated = bool(np.random.choice([True, False], p=[0.2, 0.8]))
        
        # Create point with payload
        point = PointStruct(
            id=i,
            vector=vector.tolist(),  # Convert numpy array to list
            payload={
                "deprecated": is_deprecated,
                "deprecated_at": time.strftime('%Y-%m-%d %H:%M:%S') if is_deprecated else None,
                "text": text,
                "category": np.random.choice(["AI", "ML", "NLP"]),
                "value": int(np.random.randint(1, 100))
            }
        )
        points.append(point)
    
    # Upload points
    client.upsert(
        collection_name=COLLECTION_NAME,
        points=points
    )
    print(f"Uploaded {len(points)} points with text embeddings")

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