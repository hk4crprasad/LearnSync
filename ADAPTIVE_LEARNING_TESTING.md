# Testing the Adaptive Learning System

## Quick Start

### 1. Restart Services
```bash
cd /home/tecosys/LearnSync
docker-compose restart
```

### 2. Login as Student
1. Open browser: `http://localhost:5173`
2. Login with student credentials
3. You should see the updated dashboard with two quick action cards:
   - **AI Practice Assessment** (existing)
   - **Adaptive Learning Plan** (NEW)

### 3. Generate Initial Data (If Needed)

#### Take Some Assessments
To test the adaptive features, you need assessment history:

1. **Option A: Take Teacher Assessments**
   - Navigate to "Courses"
   - Enroll in a course
   - Take available assessments
   - Complete at least 3-5 assessments

2. **Option B: AI Practice Sessions**
   - Click "Start Practice" on dashboard
   - Generate questions on different topics
   - Take multiple practice sessions
   - Try different difficulty levels

### 4. Test Adaptive Learning Dashboard

#### Access the Dashboard
1. Click "Adaptive Learning Plan" card on dashboard, OR
2. Click "Adaptive" in the navigation bar, OR
3. Navigate to: `http://localhost:5173/adaptive-learning`

#### What You Should See

**If No Data:**
- Message: "Complete some assessments to get personalized recommendations"
- Suggested actions list
- Buttons to browse courses or start practice

**If Data Exists:**
- **Performance Overview**:
  - Average Score percentage
  - Performance Trend (improving/declining/stable)
  - Total Assessments count

- **AI Study Plan**:
  - Personalized recommendations
  - Priority topics
  - Study schedule
  - Motivational message

- **Learning Goals**:
  - Score improvement goals
  - Topic mastery goals
  - Progress bars showing current vs target

- **Topics Analysis**:
  - **Weak Topics** (red): Topics needing attention with practice buttons
  - **Strong Topics** (green): Your mastered topics

- **Revision Schedule**:
  - Topics requiring revision
  - Current vs target mastery
  - Recommended frequency (daily/every 2 days/weekly)
  - Next revision dates
  - "Start Now" buttons

- **Quick Practice Shortcuts**:
  - Buttons for top 3 priority topics

### 5. Test Progressive Hints

#### During Practice Assessment
1. Navigate to "AI Practice Assessment"
2. Setup a practice session:
   - Enter a topic (e.g., "Python Functions")
   - Select difficulty
   - Choose number of questions
3. Click "Generate Practice Questions"
4. When taking the assessment:
   - Look for "Get a Hint" button below options
   - Click to reveal first hint (subtle)
   - Click again for second hint (more direct)
   - Click third time for final hint (almost reveals answer)
5. Hints appear in yellow cards with "Hint 1", "Hint 2", "Hint 3" badges

### 6. Test Adaptive Features

#### Scenario 1: Beginner Student
1. Take assessments and score <60%
2. View adaptive dashboard
3. Should see:
   - Multiple topics in "Weak Topics"
   - Daily revision schedule
   - Beginner-level study recommendations
   - Detailed hints during practice

#### Scenario 2: Intermediate Student
1. Take assessments and score 60-85%
2. View adaptive dashboard
3. Should see:
   - Mix of weak and strong topics
   - Every 2 days revision schedule
   - Moderate study recommendations

#### Scenario 3: Advanced Student
1. Take assessments and score 85%+
2. View adaptive dashboard
3. Should see:
   - Many topics in "Strong Topics"
   - Weekly revision schedule
   - Advanced study recommendations
   - Minimal hints during practice

### 7. Test Performance Trends

#### Create Improving Trend
1. Take 3-4 assessments with increasing scores
   - First: 50%
   - Second: 65%
   - Third: 75%
   - Fourth: 85%
2. View adaptive dashboard
3. Should see:
   - Trend: "Improving" with ↗️ icon
   - Encouraging feedback in study plan
   - Less frequent revision needed

#### Create Declining Trend
1. Take 3-4 assessments with decreasing scores
   - First: 85%
   - Second: 70%
   - Third: 60%
2. View adaptive dashboard
3. Should see:
   - Trend: "Declining" with ↘️ icon
   - Supportive feedback in study plan
   - More frequent revision needed
   - Consistency goal added

### 8. Verify API Endpoints

#### Using curl (from terminal)

**Get Performance Analysis:**
```bash
curl -X GET http://localhost:8000/api/analytics/adaptive/performance \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get Study Plan:**
```bash
curl -X GET http://localhost:8000/api/analytics/adaptive/study-plan \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get Hints:**
```bash
curl -X POST http://localhost:8000/api/analytics/adaptive/hints \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question_text": "What is the time complexity of binary search?",
    "difficulty": "intermediate"
  }'
```

**Get Feedback:**
```bash
curl -X POST http://localhost:8000/api/analytics/adaptive/feedback \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question": {
      "question_text": "What is binary search complexity?",
      "correct_answer": "O(log n)",
      "question_type": "multiple_choice",
      "points": 10
    },
    "student_answer": "O(n)",
    "is_correct": false
  }'
```

### 9. Check Backend Logs

```bash
docker-compose logs -f backend
```

Look for:
- Performance analysis queries
- AI study plan generation
- Hint generation requests
- Feedback generation requests

### 10. Common Issues & Solutions

#### No Data in Adaptive Dashboard
**Problem**: Shows "Complete some assessments"
**Solution**: Take at least 1 assessment or practice session

#### Study Plan Not Generating
**Problem**: Performance summary loads but no AI plan
**Solution**: 
- Check Azure OpenAI credentials in `.env`
- Verify `AZURE_OPENAI_API_KEY` is set
- Check backend logs for AI errors

#### Hints Not Loading
**Problem**: "Get a Hint" button not working
**Solution**:
- Check browser console for errors
- Verify API endpoint in `api.ts`
- Check Azure OpenAI rate limits

#### Navigation Link Not Showing
**Problem**: "Adaptive" link not in navbar
**Solution**:
- Verify you're logged in as a student
- Teachers/admins don't see this link (by design)
- Check Navigation.tsx for student role check

#### Performance Metrics Incorrect
**Problem**: Scores don't match expected values
**Solution**:
- Check assessment results in database
- Verify `results_collection` has proper data
- Look at `question_results` array structure

## Testing Checklist

- [ ] Services restarted successfully
- [ ] Student can login
- [ ] Dashboard shows adaptive learning card
- [ ] Can navigate to `/adaptive-learning`
- [ ] Performance overview displays correctly
- [ ] AI study plan generates
- [ ] Adaptive goals show with progress bars
- [ ] Weak topics listed with practice buttons
- [ ] Strong topics displayed
- [ ] Revision schedule shows dates
- [ ] Can click practice buttons and navigate
- [ ] Hints work in practice mode
- [ ] Progressive hint reveal (3 levels)
- [ ] Hint cards display correctly
- [ ] "Adaptive" link in navbar for students
- [ ] No errors in browser console
- [ ] No errors in backend logs
- [ ] API endpoints respond correctly

## Demo Scenario

**Perfect Demo Flow:**

1. **Setup** (2 min)
   - Login as student
   - Show dashboard with new adaptive card

2. **Take Assessments** (5 min)
   - Take 2-3 quick AI practice sessions
   - Mix difficulties and topics
   - Vary performance (some high, some low)

3. **View Adaptive Dashboard** (3 min)
   - Navigate to adaptive learning
   - Show performance overview
   - Read AI study plan
   - Point out weak vs strong topics
   - Show revision schedule

4. **Use Hints** (3 min)
   - Start practice session
   - Show "Get a Hint" button
   - Reveal hints progressively
   - Complete question with hint help

5. **Show Progress** (2 min)
   - Take another assessment
   - Refresh adaptive dashboard
   - Show updated metrics
   - Point out trend detection

**Total Demo Time: ~15 minutes**

## Success Indicators

✅ **Backend Working:**
- No errors in `docker-compose logs backend`
- API endpoints return 200 status
- AI responses generate successfully

✅ **Frontend Working:**
- No console errors
- All routes accessible
- Components render correctly
- Navigation works smoothly

✅ **Features Working:**
- Performance analysis accurate
- Study plans personalized
- Hints load and display
- Trends detect correctly
- Goals track progress

✅ **User Experience Good:**
- Clear visual hierarchy
- Intuitive navigation
- Helpful feedback
- Motivating messages
- Actionable recommendations

## Troubleshooting Guide

### Backend Not Starting
```bash
# Check logs
docker-compose logs backend

# Common issues:
# - Import error: Check adaptive_learning_service.py syntax
# - MongoDB connection: Verify MONGO_URI
# - Azure OpenAI: Check API key
```

### Frontend Build Errors
```bash
# Check logs
docker-compose logs frontend

# Common issues:
# - Missing imports: Check all import statements
# - Type errors: These are expected in dev mode
# - Port conflict: Ensure 5173 is available
```

### Database Issues
```bash
# Check MongoDB
docker-compose exec mongodb mongo

# Verify collections exist
use eduplatform
show collections
db.results.find().limit(1)
```

### AI Features Not Working
```bash
# Check environment variables
docker-compose exec backend env | grep AZURE

# Should see:
# AZURE_OPENAI_API_KEY=...
# AZURE_OPENAI_ENDPOINT=...
# AZURE_OPENAI_DEPLOYMENT_NAME=GPT-5-Chat
```

## Next Steps After Testing

1. **Document Results**: Note any bugs or improvements
2. **Gather Feedback**: Have users test the features
3. **Monitor Performance**: Check API response times
4. **Optimize Queries**: Add database indexes if slow
5. **Enhance UI**: Based on user feedback
6. **Add Analytics**: Track feature usage

## Additional Resources

- **Full Documentation**: `ADAPTIVE_LEARNING_GUIDE.md`
- **Implementation Details**: `ADAPTIVE_LEARNING_IMPLEMENTATION.md`
- **Chatbot Guide**: `CHATBOT_GUIDE.md`
- **Personalization Guide**: `PERSONALIZATION_GUIDE.md`
- **Quick Start**: `QUICKSTART.md`
