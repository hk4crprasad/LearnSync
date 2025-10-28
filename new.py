import logging
from openai import OpenAI
from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchValue
import sys

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


class RAGChatbot:
    """RAG Chatbot using Qdrant vector search and Azure OpenAI."""
    
    def __init__(self,
                 # Azure OpenAI for Chat
                 chat_endpoint="https://cropio.openai.azure.com/openai/v1/",
                 chat_api_key="4fecciXsfzJOkbG7ZD8lMQhX1OFa0Frsosane9ClwVvyzKmvuUvuJQQJ99BJACfhMk5XJ3w3AAABACOG1Gz8",
                 chat_model="gpt-4.1",
                 # Azure OpenAI for Embeddings
                 embedding_endpoint="https://teco.openai.azure.com/openai/v1/",
                 embedding_api_key="FYikUbLYUL8IVk1bzAeziAN69ioQlOlF7WN9cRoSIwt8ik1C8FdEJQQJ99BDACfhMk5XJ3w3AAABACOGqaOX",
                 embedding_model="text-embedding-3-large",
                 # Qdrant
                 qdrant_url="http://qdrant.tecosys.ai:6333",
                 qdrant_api_key="Tecosys_secret_cannot_be_read_or_not_hacked"):
        
        # Chat client
        self.chat_client = OpenAI(base_url=chat_endpoint, api_key=chat_api_key)
        self.chat_model = chat_model
        
        # Embedding client
        self.embedding_client = OpenAI(base_url=embedding_endpoint, api_key=embedding_api_key)
        self.embedding_model = embedding_model
        
        # Qdrant client
        self.qdrant_client = QdrantClient(url=qdrant_url, api_key=qdrant_api_key)
        
        # Conversation history
        self.conversation_history = []
        
        logger.info("✅ RAG Chatbot initialized")
    
    def generate_query_embedding(self, query):
        """Generate embedding for user query."""
        try:
            response = self.embedding_client.embeddings.create(
                input=query,
                model=self.embedding_model
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Error generating query embedding: {e}")
            return None
    
    def search_relevant_context(self, query, collection_name, top_k=5, score_threshold=0.5):
        """Search Qdrant for relevant context chunks."""
        try:
            # Generate query embedding
            query_embedding = self.generate_query_embedding(query)
            if query_embedding is None:
                return []
            
            # Search Qdrant using query_points (new API)
            search_results = self.qdrant_client.query_points(
                collection_name=collection_name,
                query=query_embedding,
                limit=top_k,
                score_threshold=score_threshold
            )
            
            # Extract relevant contexts
            contexts = []
            for result in search_results.points:
                contexts.append({
                    'content': result.payload.get('content', ''),
                    'url': result.payload.get('url', ''),
                    'title': result.payload.get('title', ''),
                    'score': result.score
                })
            
            logger.info(f"Found {len(contexts)} relevant contexts (threshold: {score_threshold})")
            return contexts
        
        except Exception as e:
            logger.error(f"Error searching Qdrant: {e}")
            return []
    
    def build_prompt(self, query, contexts):
        """Build RAG prompt with retrieved contexts."""
        if not contexts:
            return f"User question: {query}\n\nPlease answer based on your general knowledge."
        
        # Build context section
        context_text = "Here is relevant information from the website:\n\n"
        for i, ctx in enumerate(contexts, 1):
            context_text += f"--- Context {i} (from {ctx['title']}) ---\n"
            context_text += f"{ctx['content']}\n\n"
        
        # Build full prompt
        prompt = f"""{context_text}

Based on the above information from the website, please answer the following question:

User question: {query}

Instructions:
- Answer based primarily on the provided context
- If the context doesn't contain enough information, say so clearly
- Include relevant URLs when appropriate
- Be helpful and conversational
"""
        return prompt
    
    def chat(self, user_message, collection_name, top_k=5, score_threshold=0.5, 
             system_message=None, temperature=0.7, max_tokens=1000):
        """
        Chat with the bot using RAG.
        
        Args:
            user_message: User's question
            collection_name: Qdrant collection to search
            top_k: Number of context chunks to retrieve
            score_threshold: Minimum similarity score (0.0-1.0, default 0.5)
            system_message: Optional system message
            temperature: Model temperature (0-1)
            max_tokens: Maximum response tokens
        """
        try:
            # Search for relevant context
            logger.info(f"Searching for context: '{user_message}'")
            contexts = self.search_relevant_context(
                user_message, 
                collection_name, 
                top_k=top_k,
                score_threshold=score_threshold
            )
            
            # Build RAG prompt
            rag_prompt = self.build_prompt(user_message, contexts)
            
            # Build messages
            messages = []
            
            # Add system message
            if system_message:
                messages.append({"role": "system", "content": system_message})
            else:
                default_system = """You are a helpful AI assistant with access to information from a website. 
Answer questions accurately based on the provided context. If you're not sure about something, say so clearly.
Be concise but thorough."""
                messages.append({"role": "system", "content": default_system})
            
            # Add conversation history (keep last 5 exchanges)
            messages.extend(self.conversation_history[-10:])
            
            # Add current query
            messages.append({"role": "user", "content": rag_prompt})
            
            # Get response from Azure OpenAI
            logger.info("Generating response...")
            completion = self.chat_client.chat.completions.create(
                model=self.chat_model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            assistant_message = completion.choices[0].message.content
            
            # Update conversation history
            self.conversation_history.append({"role": "user", "content": user_message})
            self.conversation_history.append({"role": "assistant", "content": assistant_message})
            
            # Return response with metadata
            return {
                'response': assistant_message,
                'contexts_used': contexts,
                'num_contexts': len(contexts),
                'model': self.chat_model,
                'tokens_used': completion.usage.total_tokens if hasattr(completion, 'usage') else None
            }
        
        except Exception as e:
            logger.error(f"Error during chat: {e}")
            return {
                'response': f"Sorry, I encountered an error: {str(e)}",
                'contexts_used': [],
                'num_contexts': 0
            }
    
    def clear_history(self):
        """Clear conversation history."""
        self.conversation_history = []
        logger.info("Conversation history cleared")
    
    def interactive_chat(self, collection_name, top_k=5, score_threshold=0.5):
        """Start an interactive chat session."""
        print("\n" + "="*60)
        print("RAG CHATBOT - Interactive Mode")
        print("="*60)
        print(f"Collection: {collection_name}")
        print(f"Top-K contexts: {top_k}")
        print(f"Score threshold: {score_threshold}")
        print("\nCommands:")
        print("  - Type your question to chat")
        print("  - 'clear' to clear conversation history")
        print("  - 'quit' or 'exit' to exit")
        print("="*60 + "\n")
        
        while True:
            try:
                user_input = input("You: ").strip()
                
                if not user_input:
                    continue
                
                if user_input.lower() in ['quit', 'exit']:
                    print("\nGoodbye! 👋")
                    break
                
                if user_input.lower() == 'clear':
                    self.clear_history()
                    print("✅ Conversation history cleared\n")
                    continue
                
                # Get response
                result = self.chat(
                    user_input, 
                    collection_name,
                    top_k=top_k,
                    score_threshold=score_threshold
                )
                
                # Display response
                print(f"\nBot: {result['response']}\n")
                
                # Display sources if any
                if result['contexts_used']:
                    print(f"📚 Sources ({result['num_contexts']} contexts):")
                    seen_urls = set()
                    for ctx in result['contexts_used']:
                        url = ctx['url']
                        if url not in seen_urls:
                            print(f"  - {ctx['title']}: {url}")
                            seen_urls.add(url)
                    print()
                
            except KeyboardInterrupt:
                print("\n\nGoodbye! 👋")
                break
            except Exception as e:
                print(f"\n❌ Error: {e}\n")


class SimpleChatbot:
    """Simple chatbot without RAG (just Azure OpenAI)."""
    
    def __init__(self,
                 endpoint="https://cropio.openai.azure.com/openai/v1/",
                 api_key="4fecciXsfzJOkbG7ZD8lMQhX1OFa0Frsosane9ClwVvyzKmvuUvuJQQJ99BJACfhMk5XJ3w3AAABACOG1Gz8",
                 model="gpt-4.1"):
        
        self.client = OpenAI(base_url=endpoint, api_key=api_key)
        self.model = model
        self.conversation_history = []
        
        logger.info("✅ Simple Chatbot initialized")
    
    def chat(self, user_message, system_message=None, temperature=0.7, max_tokens=1000):
        """Simple chat without RAG."""
        try:
            messages = []
            
            if system_message:
                messages.append({"role": "system", "content": system_message})
            
            messages.extend(self.conversation_history[-10:])
            messages.append({"role": "user", "content": user_message})
            
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            assistant_message = completion.choices[0].message.content
            
            self.conversation_history.append({"role": "user", "content": user_message})
            self.conversation_history.append({"role": "assistant", "content": assistant_message})
            
            return assistant_message
        
        except Exception as e:
            logger.error(f"Error during chat: {e}")
            return f"Sorry, I encountered an error: {str(e)}"


# Example usage
if __name__ == "__main__":
    # Initialize RAG Chatbot
    chatbot = RAGChatbot(
        chat_api_key="4fecciXsfzJOkbG7ZD8lMQhX1OFa0Frsosane9ClwVvyzKmvuUvuJQQJ99BJACfhMk5XJ3w3AAABACOG1Gz8"
    )
    
    # Collection name (from the scraping pipeline)
    COLLECTION_NAME = "tecosys_website"
    
    # Option 1: Single question
    print("\n" + "="*60)
    print("Example: Single Question")
    print("="*60)
    result = chatbot.chat(
        "What context do you have",
        collection_name=COLLECTION_NAME,
        top_k=5,
        score_threshold=0.5  # Lower threshold for better results
    )
    print(f"\nQuestion: What services does the company offer?")
    print(f"\nAnswer: {result['response']}")
    print(f"\nContexts used: {result['num_contexts']}")
    
    # Option 2: Interactive chat session
    print("\n" + "="*60)
    print("Starting Interactive Chat...")
    print("="*60)
    
    # Uncomment to start interactive mode
    # chatbot.interactive_chat(
    #     collection_name=COLLECTION_NAME,
    #     top_k=5,
    #     score_threshold=0.5
    # )