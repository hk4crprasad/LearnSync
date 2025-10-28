from qdrant_client import QdrantClient
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Qdrant connection
QDRANT_URL = "http://qdrant.tecosys.ai:6333"
QDRANT_API_KEY = "Tecosys_secret_cannot_be_read_or_not_hacked"
COLLECTION_NAME = "tecosys_website"

def debug_qdrant_collection():
    """Debug Qdrant collection to see what's stored."""
    
    try:
        # Connect to Qdrant
        client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
        logger.info(f"✅ Connected to Qdrant at {QDRANT_URL}")
        
        # List all collections
        print("\n" + "="*60)
        print("ALL COLLECTIONS")
        print("="*60)
        collections = client.get_collections().collections
        if not collections:
            print("❌ No collections found!")
            print("\nYou need to run the web scraping pipeline first to create the collection.")
            return
        
        for col in collections:
            print(f"  - {col.name}")
        
        # Check if our collection exists
        collection_names = [c.name for c in collections]
        if COLLECTION_NAME not in collection_names:
            print(f"\n❌ Collection '{COLLECTION_NAME}' not found!")
            print(f"\nAvailable collections: {', '.join(collection_names)}")
            print("\nPlease run the scraping pipeline first or use the correct collection name.")
            return
        
        # Get collection info
        print("\n" + "="*60)
        print(f"COLLECTION INFO: {COLLECTION_NAME}")
        print("="*60)
        collection_info = client.get_collection(COLLECTION_NAME)
        print(f"  Status: {collection_info.status}")
        print(f"  Vector size: {collection_info.config.params.vectors.size}")
        print(f"  Distance metric: {collection_info.config.params.vectors.distance}")
        print(f"  Points count: {collection_info.points_count}")
        
        if collection_info.points_count == 0:
            print("\n❌ Collection is EMPTY! No vectors stored.")
            print("\nYou need to run the web scraping pipeline to populate the collection.")
            return
        
        # Get some sample points
        print("\n" + "="*60)
        print("SAMPLE POINTS (First 3)")
        print("="*60)
        
        # Scroll through first few points
        points, _ = client.scroll(
            collection_name=COLLECTION_NAME,
            limit=3,
            with_payload=True,
            with_vectors=False
        )
        
        if not points:
            print("❌ Could not retrieve any points!")
            return
        
        for i, point in enumerate(points, 1):
            print(f"\n--- Point {i} ---")
            print(f"ID: {point.id}")
            print(f"Payload keys: {list(point.payload.keys())}")
            if 'url' in point.payload:
                print(f"URL: {point.payload['url']}")
            if 'title' in point.payload:
                print(f"Title: {point.payload['title']}")
            if 'content' in point.payload:
                content_preview = point.payload['content'][:100] + "..." if len(point.payload['content']) > 100 else point.payload['content']
                print(f"Content: {content_preview}")
        
        # Test a simple search
        print("\n" + "="*60)
        print("TEST SEARCH (without embedding)")
        print("="*60)
        print("Performing a random vector search to test connectivity...")
        
        # Get a sample point's vector
        sample_points, _ = client.scroll(
            collection_name=COLLECTION_NAME,
            limit=1,
            with_vectors=True
        )
        
        if sample_points and sample_points[0].vector:
            test_vector = sample_points[0].vector
            search_results = client.query_points(
                collection_name=COLLECTION_NAME,
                query=test_vector,
                limit=3
            )
            
            print(f"✅ Search successful! Found {len(search_results.points)} results")
            for i, result in enumerate(search_results.points, 1):
                print(f"  {i}. Score: {result.score:.4f} - URL: {result.payload.get('url', 'N/A')}")
        
        print("\n" + "="*60)
        print("✅ DIAGNOSIS COMPLETE")
        print("="*60)
        print(f"Collection '{COLLECTION_NAME}' exists with {collection_info.points_count} points")
        print("The collection appears to be working correctly.")
        print("\nIf you're still having issues with RAG search:")
        print("1. Check that you're using the correct embedding model")
        print("2. Verify the embedding dimension matches (3072 for text-embedding-3-large)")
        print("3. Try lowering the score_threshold to 0.3 or 0.2")
        
    except Exception as e:
        logger.error(f"❌ Error during debugging: {e}")
        print(f"\n❌ Error: {e}")
        print("\nPossible issues:")
        print("1. Qdrant server is not accessible")
        print("2. Invalid API key")
        print("3. Collection was not created yet")


if __name__ == "__main__":
    debug_qdrant_collection()