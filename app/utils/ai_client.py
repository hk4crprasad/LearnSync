from openai import OpenAI
from config import settings
from typing import List, Dict


class AzureOpenAIClient:
    def __init__(self):
        self.client = OpenAI(
            base_url=settings.AZURE_OPENAI_ENDPOINT,
            api_key=settings.AZURE_OPENAI_API_KEY
        )
        self.deployment_name = settings.AZURE_OPENAI_DEPLOYMENT
    
    def generate_response(
        self, 
        user_message: str, 
        system_prompt: str = "You are an AI tutor that explains topics clearly and adapts to the student's level.",
        conversation_history: List[Dict[str, str]] = None
    ) -> str:
        """Generate AI response using GPT-5-Chat"""
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add conversation history if provided
        if conversation_history:
            messages.extend(conversation_history)
        
        # Add current user message
        messages.append({"role": "user", "content": user_message})
        
        try:
            completion = self.client.chat.completions.create(
                model=self.deployment_name,
                messages=messages,
            )
            return completion.choices[0].message.content
        except Exception as e:
            print(f"Error generating AI response: {str(e)}")
            return "I apologize, but I'm having trouble processing your request. Please try again."
    
    def generate_learning_path(self, student_data: dict) -> str:
        """Generate personalized learning path"""
        prompt = f"""
        Based on the following student data, create a personalized learning path:
        
        Current Level: {student_data.get('level', 'Beginner')}
        Subjects: {', '.join(student_data.get('subjects', []))}
        Weak Areas: {', '.join(student_data.get('weak_areas', []))}
        Learning Style: {student_data.get('learning_style', 'Visual')}
        
        Provide a structured learning path with recommended topics and exercises.
        """
        
        return self.generate_response(
            prompt,
            system_prompt="You are an educational advisor creating personalized learning paths."
        )
    
    def generate_feedback(self, question: str, student_answer: str, correct_answer: str) -> str:
        """Generate personalized feedback for assessment answers"""
        prompt = f"""
        Question: {question}
        Student's Answer: {student_answer}
        Correct Answer: {correct_answer}
        
        Provide constructive feedback explaining:
        1. What the student got right or wrong
        2. Why the correct answer is correct
        3. Tips for understanding the concept better
        """
        
        return self.generate_response(
            prompt,
            system_prompt="You are a patient teacher providing constructive feedback to students."
        )
    
    def suggest_next_topic(self, completed_topics: List[str], current_performance: dict) -> str:
        """Suggest next topic based on performance"""
        prompt = f"""
        Completed Topics: {', '.join(completed_topics)}
        Current Performance: 
        - Average Score: {current_performance.get('avg_score', 0)}%
        - Strong Areas: {', '.join(current_performance.get('strong_areas', []))}
        - Weak Areas: {', '.join(current_performance.get('weak_areas', []))}
        
        Suggest the next topic the student should focus on and explain why.
        """
        
        return self.generate_response(
            prompt,
            system_prompt="You are an AI learning advisor recommending optimal learning sequences."
        )
    
    def explain_concept(self, concept: str, difficulty_level: str = "medium") -> str:
        """Explain a concept at appropriate difficulty level"""
        prompt = f"Explain the concept of '{concept}' at a {difficulty_level} level."
        
        return self.generate_response(
            prompt,
            system_prompt="You are a knowledgeable tutor who explains concepts clearly at appropriate difficulty levels."
        )


# Singleton instance
ai_client = AzureOpenAIClient()
