"""
YouTube Search Service
Integrates YouTube Data API v3 to search for educational videos
"""

from typing import List, Dict, Optional
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from config import settings
from app.utils.ai_client import ai_client
import logging

logger = logging.getLogger(__name__)


class YouTubeService:
    """Service for YouTube video search and AI-powered keyword generation"""
    
    def __init__(self):
        self.api_key = settings.YOUTUBE_API_KEY
        self.youtube = None
        if self.api_key:
            try:
                self.youtube = build('youtube', 'v3', developerKey=self.api_key)
                logger.info("✅ YouTube API initialized successfully")
            except Exception as e:
                logger.error(f"❌ Failed to initialize YouTube API: {e}")
    
    async def generate_search_keywords(self, topic: str, user_context: Optional[str] = None) -> List[str]:
        """
        Use AI to generate optimized YouTube search keywords based on the topic
        
        Args:
            topic: The main topic/subject to search for
            user_context: Optional context about user's learning level, interests, etc.
            
        Returns:
            List of search keywords optimized for YouTube
        """
        try:
            context_info = f"\nUser Context: {user_context}" if user_context else ""
            
            prompt = f"""Generate 5 optimized YouTube search keywords for educational videos about: "{topic}"{context_info}

Requirements:
- Keywords should find high-quality educational content (tutorials, courses, lectures)
- Include variations (beginner-friendly, advanced, crash course, full tutorial)
- Consider popular educational channels and formats
- Make keywords specific enough to avoid irrelevant results

Return ONLY the keywords, one per line, without numbers or explanations."""

            response = await ai_client.generate_completion(
                prompt=prompt,
                max_tokens=200,
                temperature=0.7
            )
            
            # Parse keywords from response
            keywords = [kw.strip() for kw in response.strip().split('\n') if kw.strip()]
            
            # Ensure we always have at least the original topic
            if not keywords:
                keywords = [f"{topic} tutorial", f"learn {topic}", f"{topic} course"]
            
            logger.info(f"🎯 Generated {len(keywords)} keywords for topic: {topic}")
            return keywords
            
        except Exception as e:
            logger.error(f"Failed to generate keywords: {e}")
            # Fallback to basic keywords
            return [
                f"{topic} tutorial",
                f"learn {topic}",
                f"{topic} course",
                f"{topic} for beginners",
                f"{topic} full course"
            ]
    
    async def search_videos(
        self,
        query: str,
        max_results: int = 12,
        order: str = "relevance",
        video_duration: Optional[str] = None
    ) -> List[Dict]:
        """
        Search YouTube for educational videos
        
        Args:
            query: Search query
            max_results: Maximum number of results (default: 12)
            order: Sort order (relevance, rating, viewCount, date)
            video_duration: Filter by duration (short, medium, long)
            
        Returns:
            List of video information dictionaries
        """
        if not self.youtube:
            logger.error("YouTube API not initialized. Check YOUTUBE_API_KEY in .env")
            return []
        
        try:
            # Build search parameters
            search_params = {
                'q': query,
                'part': 'snippet',
                'type': 'video',
                'maxResults': max_results,
                'order': order,
                'videoDefinition': 'any',
                'videoEmbeddable': 'true',
                'relevanceLanguage': 'en',
                'safeSearch': 'strict'
            }
            
            if video_duration:
                search_params['videoDuration'] = video_duration
            
            # Execute search
            search_response = self.youtube.search().list(**search_params).execute()
            
            videos = []
            video_ids = []
            
            # Collect video IDs
            for item in search_response.get('items', []):
                video_ids.append(item['id']['videoId'])
            
            # Get detailed video statistics
            if video_ids:
                videos_response = self.youtube.videos().list(
                    part='snippet,contentDetails,statistics',
                    id=','.join(video_ids)
                ).execute()
                
                for video in videos_response.get('items', []):
                    snippet = video['snippet']
                    statistics = video.get('statistics', {})
                    content_details = video.get('contentDetails', {})
                    
                    videos.append({
                        'id': video['id'],
                        'title': snippet.get('title', ''),
                        'description': snippet.get('description', ''),
                        'thumbnail': snippet.get('thumbnails', {}).get('high', {}).get('url', ''),
                        'channel': snippet.get('channelTitle', ''),
                        'channel_id': snippet.get('channelId', ''),
                        'published_at': snippet.get('publishedAt', ''),
                        'duration': content_details.get('duration', ''),
                        'view_count': int(statistics.get('viewCount', 0)),
                        'like_count': int(statistics.get('likeCount', 0)),
                        'comment_count': int(statistics.get('commentCount', 0)),
                        'url': f"https://www.youtube.com/watch?v={video['id']}",
                        'embed_url': f"https://www.youtube.com/embed/{video['id']}"
                    })
            
            logger.info(f"🎥 Found {len(videos)} videos for query: {query}")
            return videos
            
        except HttpError as e:
            logger.error(f"YouTube API error: {e}")
            return []
        except Exception as e:
            logger.error(f"Error searching YouTube: {e}")
            return []
    
    async def search_with_ai_keywords(
        self,
        topic: str,
        user_context: Optional[str] = None,
        max_results: int = 12
    ) -> Dict:
        """
        Search YouTube using AI-generated keywords
        
        Args:
            topic: The main topic to search for
            user_context: Optional user context for better keyword generation
            max_results: Maximum number of results per keyword
            
        Returns:
            Dictionary with keywords and their corresponding videos
        """
        # Generate optimized keywords using AI
        keywords = await self.generate_search_keywords(topic, user_context)
        
        results = {
            'topic': topic,
            'keywords': keywords,
            'videos': []
        }
        
        # Search using the best keyword (first one)
        if keywords:
            videos = await self.search_videos(
                query=keywords[0],
                max_results=max_results,
                order='relevance'
            )
            results['videos'] = videos
        
        return results
    
    async def get_channel_info(self, channel_id: str) -> Optional[Dict]:
        """Get information about a YouTube channel"""
        if not self.youtube:
            return None
        
        try:
            response = self.youtube.channels().list(
                part='snippet,statistics',
                id=channel_id
            ).execute()
            
            if response.get('items'):
                channel = response['items'][0]
                snippet = channel['snippet']
                statistics = channel.get('statistics', {})
                
                return {
                    'id': channel['id'],
                    'title': snippet.get('title', ''),
                    'description': snippet.get('description', ''),
                    'thumbnail': snippet.get('thumbnails', {}).get('high', {}).get('url', ''),
                    'subscriber_count': int(statistics.get('subscriberCount', 0)),
                    'video_count': int(statistics.get('videoCount', 0)),
                    'view_count': int(statistics.get('viewCount', 0))
                }
        except Exception as e:
            logger.error(f"Error fetching channel info: {e}")
            return None
    
    def parse_duration(self, duration: str) -> str:
        """Convert ISO 8601 duration to readable format"""
        import re
        
        match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', duration)
        if not match:
            return "Unknown"
        
        hours, minutes, seconds = match.groups()
        hours = int(hours) if hours else 0
        minutes = int(minutes) if minutes else 0
        seconds = int(seconds) if seconds else 0
        
        if hours > 0:
            return f"{hours}h {minutes}m"
        elif minutes > 0:
            return f"{minutes}m {seconds}s"
        else:
            return f"{seconds}s"


# Global instance
youtube_service = YouTubeService()
