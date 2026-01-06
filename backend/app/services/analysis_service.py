"""
Analysis Service
Business logic for analyzing medical report data
"""

from typing import List
from models.schemas import TestResult, TestStatus, Severity
from services.openai_service import openai_service


class AnalysisService:
    @staticmethod
    def calculate_health_score(tests: List[TestResult]) -> int:
        """
        Calculate a health score from 0-100 based on test results
        100 = all tests normal
        Score decreases based on severity of abnormal results
        """
        if not tests:
            return 0
        
        total_points = 0
        max_points = len(tests) * 100
        
        for test in tests:
            if test.status == TestStatus.NORMAL:
                total_points += 100
            elif test.status == TestStatus.UNKNOWN:
                total_points += 75  # Neutral for unknown
            elif test.severity == Severity.YELLOW:
                total_points += 50  # Borderline
            elif test.severity == Severity.RED:
                total_points += 0   # Critical
            else:
                total_points += 25  # Default for abnormal
        
        return int((total_points / max_points) * 100) if max_points > 0 else 0
    
    @staticmethod
    def get_overall_status(tests: List[TestResult]) -> str:
        """
        Determine overall status based on test results
        """
        if not tests:
            return "unknown"
        
        has_critical = any(t.severity == Severity.RED for t in tests)
        has_warning = any(t.severity == Severity.YELLOW for t in tests)
        
        if has_critical:
            return "needs_attention"
        elif has_warning:
            return "borderline"
        else:
            return "healthy"
    
    @staticmethod
    def count_by_status(tests: List[TestResult]) -> dict:
        """
        Count tests by status
        """
        counts = {
            "normal": 0,
            "low": 0,
            "high": 0,
            "unknown": 0,
            "total": len(tests)
        }
        
        for test in tests:
            if test.status == TestStatus.NORMAL:
                counts["normal"] += 1
            elif test.status == TestStatus.LOW:
                counts["low"] += 1
            elif test.status == TestStatus.HIGH:
                counts["high"] += 1
            else:
                counts["unknown"] += 1
        
        return counts
    
    @staticmethod
    def get_abnormal_tests(tests: List[TestResult]) -> List[TestResult]:
        """
        Get only abnormal tests (LOW or HIGH)
        """
        return [t for t in tests if t.status in [TestStatus.LOW, TestStatus.HIGH]]
    
    async def enrich_with_explanations(self, tests: List[TestResult]) -> List[TestResult]:
        """
        Add AI-generated explanations and alerts to abnormal tests
        """
        enriched_tests = []
        
        for test in tests:
            # Only generate explanations for abnormal values
            if test.status in [TestStatus.LOW, TestStatus.HIGH]:
                # Generate explanation
                explanation = await openai_service.generate_explanation(
                    test.test_name,
                    test.observed_value,
                    test.unit or "",
                    test.status.value
                )
                test.explanation = explanation
                
                # Generate alert for concerning values
                if test.severity in [Severity.YELLOW, Severity.RED]:
                    alert = await openai_service.generate_alert(
                        test.test_name,
                        test.status.value,
                        test.severity.value
                    )
                    test.alert_message = alert
            
            enriched_tests.append(test)
        
        return enriched_tests


# Singleton instance  
analysis_service = AnalysisService()
