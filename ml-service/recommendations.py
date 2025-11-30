import psycopg2
from psycopg2.extras import RealDictCursor
import pandas as pd
from datetime import datetime, timedelta
from collections import Counter
import os

class RecommendationEngine:
    def __init__(self, db_url):
        self.db_url = db_url
    
    def get_connection(self):
        """Create database connection"""
        return psycopg2.connect(self.db_url)
    
    def get_all_events(self, organizer_id):
        """Fetch all events for an organizer"""
        conn = self.get_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        query = """
            SELECT e.*, 
                   COUNT(DISTINCT p.id) as participant_count,
                   COUNT(DISTINCT a.id) as view_count
            FROM events e
            LEFT JOIN participants p ON e.id = p.event_id
            LEFT JOIN activity_logs a ON e.id = a.event_id AND a.action_type = 'view'
            WHERE e.organizer_id = %s
            GROUP BY e.id
            ORDER BY e.created_at DESC
        """
        
        cursor.execute(query, (organizer_id,))
        events = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return events
    
    def get_best_day_recommendation(self, organizer_id):
        """Recommend best day of week for events"""
        events = self.get_all_events(organizer_id)
        
        if not events:
            return {
                "recommendation": "Not enough data",
                "details": "Create more events to get day-of-week insights",
                "confidence": "low"
            }
        
        # Analyze day of week performance
        day_performance = {}
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        
        for event in events:
            day_of_week = event['start_date'].weekday()
            day_name = days[day_of_week]
            
            if day_name not in day_performance:
                day_performance[day_name] = {
                    'count': 0,
                    'total_participants': 0,
                    'total_views': 0
                }
            
            day_performance[day_name]['count'] += 1
            day_performance[day_name]['total_participants'] += event['participant_count']
            day_performance[day_name]['total_views'] += event['view_count']
        
        # Calculate average performance per day
        for day in day_performance:
            count = day_performance[day]['count']
            day_performance[day]['avg_participants'] = day_performance[day]['total_participants'] / count
            day_performance[day]['avg_views'] = day_performance[day]['total_views'] / count
        
        # Find best day
        best_day = max(day_performance.items(), 
                      key=lambda x: x[1]['avg_participants'])
        
        return {
            "recommendation": f"Schedule events on {best_day[0]}",
            "details": f"Your {best_day[0]} events average {best_day[1]['avg_participants']:.1f} participants",
            "confidence": "high" if len(events) >= 5 else "medium",
            "data": day_performance
        }
    
    def get_best_category_recommendation(self, organizer_id):
        """Recommend best performing category"""
        events = self.get_all_events(organizer_id)
        
        if not events:
            return {
                "recommendation": "Not enough data",
                "details": "Create more events to get category insights",
                "confidence": "low"
            }
        
        # Analyze category performance
        category_performance = {}
        
        for event in events:
            category = event['category'] or 'General'
            
            if category not in category_performance:
                category_performance[category] = {
                    'count': 0,
                    'total_participants': 0,
                    'total_views': 0
                }
            
            category_performance[category]['count'] += 1
            category_performance[category]['total_participants'] += event['participant_count']
            category_performance[category]['total_views'] += event['view_count']
        
        # Calculate averages
        for cat in category_performance:
            count = category_performance[cat]['count']
            category_performance[cat]['avg_participants'] = category_performance[cat]['total_participants'] / count
            category_performance[cat]['avg_views'] = category_performance[cat]['total_views'] / count
        
        # Find best category
        best_category = max(category_performance.items(),
                           key=lambda x: x[1]['avg_participants'])
        
        return {
            "recommendation": f"Focus on {best_category[0]} events",
            "details": f"{best_category[0]} events average {best_category[1]['avg_participants']:.1f} participants",
            "confidence": "high" if len(events) >= 5 else "medium",
            "data": category_performance
        }
    
    def get_timing_recommendation(self, organizer_id):
        """Recommend best time to schedule events"""
        events = self.get_all_events(organizer_id)
        
        if not events:
            return {
                "recommendation": "Not enough data",
                "details": "Create more events to get timing insights",
                "confidence": "low"
            }
        
        # Analyze time slots
        time_performance = {
            'Morning (6AM-12PM)': {'count': 0, 'total_participants': 0},
            'Afternoon (12PM-5PM)': {'count': 0, 'total_participants': 0},
            'Evening (5PM-9PM)': {'count': 0, 'total_participants': 0},
            'Night (9PM-12AM)': {'count': 0, 'total_participants': 0}
        }
        
        for event in events:
            hour = event['start_date'].hour
            
            if 6 <= hour < 12:
                slot = 'Morning (6AM-12PM)'
            elif 12 <= hour < 17:
                slot = 'Afternoon (12PM-5PM)'
            elif 17 <= hour < 21:
                slot = 'Evening (5PM-9PM)'
            else:
                slot = 'Night (9PM-12AM)'
            
            time_performance[slot]['count'] += 1
            time_performance[slot]['total_participants'] += event['participant_count']
        
        # Calculate averages
        valid_slots = {}
        for slot, data in time_performance.items():
            if data['count'] > 0:
                valid_slots[slot] = data['total_participants'] / data['count']
        
        if not valid_slots:
            return {
                "recommendation": "Schedule events during peak hours",
                "details": "Not enough data to determine best time slot",
                "confidence": "low"
            }
        
        best_slot = max(valid_slots.items(), key=lambda x: x[1])
        
        return {
            "recommendation": f"Schedule events in the {best_slot[0].split('(')[0].strip()}",
            "details": f"{best_slot[0]} events average {best_slot[1]:.1f} participants",
            "confidence": "high" if len(events) >= 5 else "medium"
        }
    
    def get_engagement_insights(self, organizer_id):
        """Get engagement insights"""
        events = self.get_all_events(organizer_id)
        
        if not events:
            return {
                "recommendation": "Start promoting your events",
                "details": "Create events and track engagement to get insights",
                "confidence": "low"
            }
        
        total_views = sum(event['view_count'] for event in events)
        total_participants = sum(event['participant_count'] for event in events)
        
        if total_views == 0:
            conversion_rate = 0
        else:
            conversion_rate = (total_participants / total_views) * 100
        
        if conversion_rate < 10:
            recommendation = "Improve event descriptions and promotional content"
            details = f"Your conversion rate is {conversion_rate:.1f}%. Industry average is 15-20%"
        elif conversion_rate < 20:
            recommendation = "Good engagement! Consider A/B testing event titles"
            details = f"Your conversion rate is {conversion_rate:.1f}%. You're doing well!"
        else:
            recommendation = "Excellent engagement! Keep up the great work"
            details = f"Your conversion rate is {conversion_rate:.1f}%. This is above industry average!"
        
        return {
            "recommendation": recommendation,
            "details": details,
            "confidence": "high" if len(events) >= 3 else "medium",
            "metrics": {
                "conversion_rate": round(conversion_rate, 1),
                "total_views": total_views,
                "total_participants": total_participants
            }
        }
    
    def get_participant_demographics(self, organizer_id):
        """Analyze participant age demographics"""
        conn = self.get_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        query = """
            SELECT p.age
            FROM participants p
            JOIN events e ON p.event_id = e.id
            WHERE e.organizer_id = %s AND p.age IS NOT NULL
        """
        
        cursor.execute(query, (organizer_id,))
        participants = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        if not participants:
            return {
                "recommendation": "Collect age data from participants",
                "details": "Age demographics help target the right audience",
                "confidence": "low"
            }
        
        ages = [p['age'] for p in participants]
        avg_age = sum(ages) / len(ages)
        
        if avg_age < 20:
            target = "younger audience (under 20)"
        elif avg_age < 30:
            target = "young adults (20-30)"
        elif avg_age < 50:
            target = "adults (30-50)"
        else:
            target = "mature audience (50+)"
        
        return {
            "recommendation": f"Target your {target}",
            "details": f"Average participant age is {avg_age:.1f} years",
            "confidence": "high" if len(participants) >= 10 else "medium",
            "metrics": {
                "average_age": round(avg_age, 1),
                "total_participants": len(participants)
            }
        }
    
    def get_all_recommendations(self, organizer_id):
        """Get all recommendations at once"""
        return {
            "best_day": self.get_best_day_recommendation(organizer_id),
            "best_category": self.get_best_category_recommendation(organizer_id),
            "best_timing": self.get_timing_recommendation(organizer_id),
            "engagement": self.get_engagement_insights(organizer_id),
            "demographics": self.get_participant_demographics(organizer_id)
        }