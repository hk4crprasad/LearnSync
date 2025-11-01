# Adaptive Learning System

## Overview
The Adaptive Learning System analyzes student performance across assessments and provides personalized study recommendations, adaptive difficulty adjustments, progressive hints, and tailored feedback.

## Features

### 1. Performance Analytics
- **Automatic Analysis**: Tracks student performance across all completed assessments
- **Topic-Level Insights**: Identifies strong topics (85%+) and weak topics (<60%)
- **Trend Detection**: Monitors if performance is improving, declining, or stable
- **Accuracy Metrics**: Calculates question-level accuracy by topic

### 2. Personalized Study Plans
- **AI-Generated Recommendations**: Uses Azure OpenAI to create customized study plans
- **Priority Topics**: Focuses on weakest areas first
- **Study Schedule**: Recommends daily/weekly practice schedules
- **Milestone Goals**: Sets achievable targets based on current performance

### 3. Revision Cycles
- **Spaced Repetition**: Automatically schedules revision sessions
- **Frequency Adaptation**: 
  - Daily for topics <50% mastery
  - Every 2 days for 50-70% mastery
  - Weekly for 70-85% mastery
- **Time Estimates**: Provides expected study time per topic

### 4. Adaptive Question Banks
- **Difficulty Scaling**: Adjusts question difficulty based on performance
  - Advanced (85%+ average score)
  - Intermediate (65-85% average score)
  - Beginner (<65% average score)
- **Weak Area Targeting**: Generates more questions for struggling topics

### 5. Progressive Hints System
- **3-Level Hints**: 
  - Level 1: Subtle nudge in the right direction
  - Level 2: Direct pointer to key concept
  - Level 3: Nearly reveals answer while encouraging thought
- **Performance-Adaptive**: Hint detail scales with student's average score
- **On-Demand**: Students request hints when needed, not forced

### 6. Personalized Feedback
- **Context-Aware**: Considers student's learning history and trends
- **Encouraging**: Provides motivation based on improvement trends
- **Educational**: Explains concepts, not just right/wrong
- **Action-Oriented**: Suggests specific next steps

## Backend API Endpoints

### Analytics Endpoints

#### `GET /api/analytics/adaptive/performance`
Get comprehensive performance analysis for current student.

**Response:**
```json
{
  "student_id": "string",
  "total_assessments": 15,
  "average_score": 73.5,
  "performance_trend": "improving",
  "strong_topics": [
    {
      "topic": "Python Functions",
      "average_score": 92.0,
      "accuracy": 95.5,
      "attempts": 3
    }
  ],
  "weak_topics": [
    {
      "topic": "Data Structures",
      "average_score": 52.0,
      "accuracy": 48.3,
      "attempts": 4
    }
  ],
  "needs_revision": [...],
  "recent_scores": [85, 78, 92, ...],
  "last_assessment_date": "2024-01-15T10:30:00"
}
```

#### `GET /api/analytics/adaptive/study-plan`
Get AI-generated personalized study plan.

**Response:**
```json
{
  "student_id": "string",
  "generated_at": "2024-01-15T10:30:00",
  "performance_summary": {...},
  "ai_study_plan": "Based on your performance...",
  "revision_cycles": [
    {
      "topic": "Data Structures",
      "current_mastery": 48.3,
      "target_mastery": 85.0,
      "recommended_frequency": "daily",
      "estimated_time_minutes": 30,
      "next_revision_date": "2024-01-16T10:00:00"
    }
  ],
  "adaptive_goals": [
    {
      "type": "topic_mastery",
      "description": "Master 'Data Structures' (current: 48.3%)",
      "topic": "Data Structures",
      "target": 80,
      "current": 48.3,
      "priority": "high"
    }
  ],
  "recommended_practice_topics": ["Data Structures", "Algorithms", "OOP"]
}
```

#### `POST /api/analytics/adaptive/hints`
Get progressive hints for a question based on student performance.

**Request Body:**
```json
{
  "question_text": "What is the time complexity of binary search?",
  "difficulty": "intermediate"
}
```

**Response:**
```json
{
  "hints": [
    "Think about how the search space changes with each comparison.",
    "The algorithm divides the problem in half each time.",
    "When you halve repeatedly, you're dealing with logarithmic growth."
  ]
}
```

#### `POST /api/analytics/adaptive/feedback`
Get personalized feedback based on student's learning history.

**Request Body:**
```json
{
  "question": {
    "question_text": "...",
    "correct_answer": "...",
    ...
  },
  "student_answer": "O(n)",
  "is_correct": false
}
```

**Response:**
```json
{
  "feedback": "I see you answered O(n) for binary search complexity. Remember that binary search divides the array in half each step, which is a characteristic of logarithmic operations. The correct answer is O(log n). Given your improving trend, I recommend reviewing the relationship between divide-and-conquer algorithms and logarithmic complexity. Practice a few more binary search problems to solidify this concept!"
}
```

## Frontend Components

### AdaptiveLearning.tsx (`/adaptive-learning`)
Main adaptive learning dashboard displaying:
- Performance overview cards (average score, trend, total assessments)
- AI-generated study plan
- Adaptive learning goals with progress tracking
- Weak topics requiring attention with practice buttons
- Strong topics to maintain
- Revision schedule with dates and frequencies
- Quick practice shortcuts

### Enhanced PracticeAssessment.tsx
Student practice mode with adaptive features:
- **Progressive Hints**: "Get a Hint" button loads AI-generated hints
- **Hint Levels**: Shows hints incrementally (1, 2, 3)
- **Visual Feedback**: Yellow cards for hints, green/red for correctness
- **Adaptive Difficulty**: Uses student performance to tailor questions

### Dashboard.tsx Updates
Added quick action card linking to `/adaptive-learning` with icon and description.

## Backend Services

### `adaptive_learning_service.py`
Core service containing:
- `analyze_student_performance(student_id)`: Aggregates assessment results, calculates metrics
- `generate_personalized_study_plan(student_id)`: Creates AI study plan with Azure OpenAI
- `get_adaptive_hints(question_text, student_performance, difficulty)`: Generates 3 progressive hints
- `generate_adaptive_feedback(question, student_answer, is_correct, student_performance)`: Creates personalized feedback
- `_generate_adaptive_goals(performance)`: Sets milestone goals based on current state

## Database Collections Used

### `results_collection`
Stores assessment results with:
- `student_id`, `assessment_id`
- `score`, `total_points`, `earned_points`
- `passed` (boolean)
- `question_results[]` (array of question-level results)
- `submitted_at` (timestamp)

### `assessments_collection`
Links results to topics via:
- `topic` (string)
- `difficulty_level`
- `questions[]`

## AI Integration

### Azure OpenAI Prompts

**Study Plan Generation:**
```
Student Performance Summary:
- Average Score: X%
- Performance Trend: improving/declining/stable
- Weak Topics: Topic1, Topic2
- Strong Topics: Topic3, Topic4

Create personalized study plan with:
1. Priority topics
2. Study schedule
3. Specific exercises
4. Revision schedule
5. Motivational message
6. Next milestones
```

**Hint Generation:**
```
Question: [question_text]
Difficulty: [difficulty]
Student Average Score: X%
Hint Level: minimal/moderate/detailed

Generate 3 progressive hints:
1. Gentle nudge
2. More direct guidance
3. Almost reveal answer
```

**Feedback Generation:**
```
Question: [question_text]
Student Answer: [answer]
Correct Answer: [correct_answer]
Result: Correct/Incorrect
Student Context: avg_score, trend, learning_stage

Provide personalized feedback that:
1. Acknowledges answer
2. Explains concept
3. Connects to learning level
4. Provides encouragement/support
5. Suggests next steps
```

## Usage Flow

### For Students

1. **Take Assessments**: Complete teacher-created or AI practice assessments
2. **View Performance**: Navigate to `/adaptive-learning` to see analysis
3. **Review Study Plan**: Read AI-generated recommendations
4. **Follow Revision Schedule**: Practice topics on recommended dates
5. **Use Hints**: During practice, request hints when stuck
6. **Track Progress**: Monitor goals and improvement trends

### For System

1. **Track Results**: Save detailed assessment results in database
2. **Analyze Performance**: Aggregate results by topic, calculate metrics
3. **Generate Insights**: Use AI to create personalized recommendations
4. **Adapt Difficulty**: Adjust question difficulty based on scores
5. **Provide Support**: Offer hints and feedback during practice
6. **Schedule Revision**: Calculate optimal review dates using spaced repetition

## Configuration

### Environment Variables
- `AZURE_OPENAI_API_KEY`: Required for AI features
- `AZURE_OPENAI_ENDPOINT`: Azure OpenAI endpoint
- `AZURE_OPENAI_DEPLOYMENT_NAME`: Model deployment name (e.g., "GPT-5-Chat")

### Settings
- Student question limit: 10 per session (teachers unlimited)
- Hint levels: 3 per question
- Strong topic threshold: 85% average score
- Weak topic threshold: 60% average score
- Revision frequency thresholds: 50%, 70% mastery

## Performance Considerations

- **Caching**: Consider caching study plans for 24 hours
- **Batch Processing**: Performance analysis runs on-demand, could be scheduled
- **Rate Limiting**: AI calls for hints/feedback could hit rate limits
- **Database Indexes**: Index `student_id`, `submitted_at` in results collection

## Future Enhancements

1. **Predictive Analytics**: Forecast future performance
2. **Peer Comparison**: Anonymous benchmarking against class
3. **Learning Styles**: Adapt content format to student preferences
4. **Gamification Integration**: Reward consistent revision adherence
5. **Mobile Notifications**: Remind students of revision sessions
6. **Teacher Dashboard**: View class-wide adaptive patterns
7. **Export Reports**: PDF study plans and progress reports
8. **A/B Testing**: Compare different hint/feedback strategies
