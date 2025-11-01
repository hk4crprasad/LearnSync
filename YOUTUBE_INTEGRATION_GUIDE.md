# YouTube Integration Guide

## Overview
LearnSync now includes AI-powered YouTube course discovery, allowing students to search for educational videos with automatic keyword generation and intelligent filtering.

## Features

### 1. **AI-Powered Search**
- AI analyzes your topic and generates optimized search keywords
- Considers learning level (beginner, intermediate, advanced)
- Filters for educational content automatically

### 2. **Manual Search**
- Traditional YouTube search with advanced filters
- Sort by: Relevance, Date, View Count, Rating
- Filter by duration: Short (<4min), Medium (4-20min), Long (>20min)

### 3. **Smart Keyword Generation**
- Standalone keyword generator
- Creates 5 optimized search terms per topic
- Context-aware based on learning level

### 4. **Video Information Display**
- Thumbnail preview
- Channel information
- View count, likes, comments
- Video duration
- Direct link to YouTube

## Setup Instructions

### Backend Setup

1. **Get YouTube API Key**
   ```bash
   # Visit: https://console.cloud.google.com/apis/credentials
   # 1. Create a new project or select existing
   # 2. Enable "YouTube Data API v3"
   # 3. Create credentials > API Key
   # 4. Copy the API key
   ```

2. **Update .env file**
   ```bash
   cd backend
   nano .env  # or your preferred editor
   ```
   
   Add this line:
   ```
   YOUTUBE_API_KEY=your_api_key_here
   ```

3. **Install Dependencies**
   ```bash
   cd backend
   pip install google-api-python-client
   # or
   uv pip install google-api-python-client
   ```

4. **Restart Backend**
   ```bash
   uv run main.py
   ```

### Frontend Setup

Frontend is already configured! Just access:
- Navigation: Click "YouTube" in the top menu
- Dashboard: Click "YouTube Courses" quick action card
- Direct URL: `https://your-domain.com/youtube-courses`

## API Endpoints

### 1. Search YouTube Videos
```http
GET /api/youtube/search?q={query}&max_results=12&order=relevance&duration=medium
```

**Parameters:**
- `q` (required): Search query
- `max_results` (optional): 1-50, default 12
- `order` (optional): relevance, date, viewCount, rating
- `duration` (optional): short, medium, long

**Response:**
```json
{
  "query": "Python programming",
  "videos": [
    {
      "id": "video_id",
      "title": "Learn Python in 30 Minutes",
      "description": "Complete Python tutorial...",
      "thumbnail": "https://...",
      "channel": "Tech Education",
      "channel_id": "channel_id",
      "published_at": "2024-01-01T00:00:00Z",
      "duration": "30m 15s",
      "view_count": 1500000,
      "like_count": 50000,
      "comment_count": 2000,
      "url": "https://www.youtube.com/watch?v=...",
      "embed_url": "https://www.youtube.com/embed/..."
    }
  ],
  "total_results": 12
}
```

### 2. AI-Powered Search
```http
POST /api/youtube/ai-search?max_results=12
Content-Type: application/json

{
  "topic": "Python programming",
  "user_context": "Learning level: beginner"
}
```

**Response:**
```json
{
  "topic": "Python programming",
  "keywords": [
    "Python programming tutorial for beginners",
    "Learn Python from scratch",
    "Python full course",
    "Python basics explained",
    "Python crash course"
  ],
  "videos": [...]
}
```

### 3. Generate Keywords Only
```http
POST /api/youtube/generate-keywords
Content-Type: application/json

{
  "topic": "Data structures",
  "user_context": "Computer science student, intermediate level"
}
```

**Response:**
```json
{
  "topic": "Data structures",
  "keywords": [
    "Data structures and algorithms tutorial",
    "Data structures explained with examples",
    "Complete data structures course",
    "Data structures interview preparation",
    "Advanced data structures guide"
  ],
  "message": "Generated 5 search keywords"
}
```

### 4. Course Suggestions (Curated)
```http
GET /api/youtube/course-suggestions?topic=Machine%20Learning&level=beginner
```

**Parameters:**
- `topic` (required): Course topic
- `level` (optional): beginner, intermediate, advanced

**Response:**
```json
{
  "topic": "Machine Learning",
  "level": "beginner",
  "keywords_used": ["Machine Learning tutorial for beginners", ...],
  "courses": [...],
  "total_found": 20,
  "message": "Found 20 educational videos for Machine Learning"
}
```

### 5. Get Channel Information
```http
GET /api/youtube/channel/{channel_id}
```

**Response:**
```json
{
  "id": "channel_id",
  "title": "Tech Education Hub",
  "description": "Educational content...",
  "thumbnail": "https://...",
  "subscriber_count": 1000000,
  "video_count": 500,
  "view_count": 50000000
}
```

## Usage Examples

### Frontend - AI Search
```typescript
import { api } from "@/lib/api";

// AI-powered search
const results = await api.aiSearchYouTube(
  "React hooks",
  "Intermediate level, frontend development",
  20
);

console.log(results.keywords); // AI-generated keywords
console.log(results.videos);   // Video results
```

### Frontend - Manual Search
```typescript
// Manual search with filters
const results = await api.searchYouTube(
  "JavaScript tutorial",
  15,           // max results
  "viewCount",  // sort by views
  "long"        // only long videos
);
```

### Frontend - Generate Keywords
```typescript
// Generate keywords only
const keywords = await api.generateYouTubeKeywords(
  "Database design",
  "Learning SQL and normalization"
);

console.log(keywords.keywords); // Array of optimized keywords
```

## How AI Keyword Generation Works

1. **Context Analysis**: AI analyzes the topic and user context (level, interests)
2. **Keyword Optimization**: Generates 5 variations optimized for educational content
3. **Educational Focus**: Includes terms like "tutorial", "course", "explained", "guide"
4. **Level-Appropriate**: Adjusts complexity based on beginner/intermediate/advanced
5. **Diversity**: Creates varied keywords to capture different content styles

**Example:**
```
Topic: "Python"
Level: "Beginner"

Generated Keywords:
1. "Python programming tutorial for beginners"
2. "Learn Python from scratch complete course"
3. "Python basics explained step by step"
4. "Python crash course for absolute beginners"
5. "Introduction to Python programming"
```

## Best Practices

### For Students
1. **Use AI Search First**: Let AI generate optimized keywords
2. **Specify Your Level**: Get content appropriate for your skill level
3. **Filter by Duration**: Choose video length based on available time
4. **Check View Counts**: Popular videos often indicate quality content
5. **Review Multiple Videos**: Compare different teaching styles

### For Developers
1. **Monitor API Quota**: YouTube API has daily limits (10,000 units/day)
2. **Cache Results**: Consider caching popular searches
3. **Handle Errors Gracefully**: API may fail, show fallback content
4. **Respect Rate Limits**: Don't spam search requests
5. **Log Usage**: Track which topics are searched most

## API Quota Management

YouTube Data API v3 has a quota system:
- **Default Quota**: 10,000 units per day
- **Search Operation**: 100 units
- **Videos List**: 1 unit per video
- **Approximate Searches**: ~50-100 searches per day

To increase quota:
1. Go to Google Cloud Console
2. Navigate to APIs & Services > Quotas
3. Request quota increase (requires justification)

## Troubleshooting

### "YouTube API not initialized"
**Problem**: API key missing or invalid
**Solution**: 
- Check `.env` file has `YOUTUBE_API_KEY=your_key`
- Verify API key is correct
- Ensure YouTube Data API v3 is enabled in Google Cloud Console

### "Failed to search YouTube"
**Problem**: API quota exceeded or network error
**Solution**:
- Check quota usage in Google Cloud Console
- Wait 24 hours for quota reset
- Request quota increase if needed

### No Results Found
**Problem**: Search query too specific or no matching content
**Solution**:
- Try AI search for better keywords
- Use more general terms
- Check spelling

### Slow Search Response
**Problem**: Large `max_results` or multiple API calls
**Solution**:
- Reduce `max_results` to 12-20
- Implement result pagination
- Add loading indicators

## Security Considerations

1. **API Key Protection**: Never expose API key in frontend code
2. **Rate Limiting**: Implement backend rate limiting per user
3. **Input Validation**: Sanitize search queries
4. **Authentication**: All endpoints require user authentication
5. **CORS**: Backend properly configured for production domain

## Future Enhancements

- [ ] Video bookmarking/favorites
- [ ] Playlist creation from search results
- [ ] Video progress tracking
- [ ] Embedded video player
- [ ] Community ratings and reviews
- [ ] Recommended channels by topic
- [ ] Integration with course curriculum
- [ ] Video transcript search
- [ ] Multi-language support
- [ ] Advanced filtering (channel, date range, etc.)

## Support

For issues or questions:
1. Check backend logs for API errors
2. Verify YouTube API key is valid
3. Test with Postman/curl to isolate frontend/backend issues
4. Review Google Cloud Console for quota status

## Additional Resources

- [YouTube Data API v3 Documentation](https://developers.google.com/youtube/v3)
- [Google API Python Client](https://github.com/googleapis/google-api-python-client)
- [API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)
