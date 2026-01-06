"""
Pydantic models for request/response validation
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class TestStatus(str, Enum):
    NORMAL = "NORMAL"
    LOW = "LOW"
    HIGH = "HIGH"
    UNKNOWN = "UNKNOWN"


class Severity(str, Enum):
    GREEN = "green"
    YELLOW = "yellow"
    RED = "red"
    GRAY = "gray"


class ReferenceRange(BaseModel):
    min: Optional[float] = None
    max: Optional[float] = None


class PatientInfo(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None


class TestResult(BaseModel):
    test_name: str
    observed_value: str
    unit: Optional[str] = None
    reference_range: Optional[ReferenceRange] = None
    status: Optional[TestStatus] = None
    severity: Optional[Severity] = None
    explanation: Optional[str] = None
    alert_message: Optional[str] = None


class ExtractedReportData(BaseModel):
    patient_info: Optional[PatientInfo] = None
    tests: List[TestResult] = []


class ReportUploadResponse(BaseModel):
    id: str
    file_url: str
    status: str
    message: str


class AnalysisResponse(BaseModel):
    report_id: str
    patient_info: Optional[PatientInfo] = None
    tests: List[TestResult] = []
    health_score: Optional[int] = None
    summary: Optional[str] = None
    overall_status: str = "pending"


class ExplanationRequest(BaseModel):
    test_name: str
    value: str
    unit: Optional[str] = None
    status: TestStatus


class ExplanationResponse(BaseModel):
    test_name: str
    explanation: str
    recommendations: Optional[str] = None


class AlertRequest(BaseModel):
    test_name: str
    status: TestStatus
    severity: Severity


class AlertResponse(BaseModel):
    test_name: str
    alert_message: str


class ReportListItem(BaseModel):
    id: str
    file_name: Optional[str] = None
    patient_name: Optional[str] = None
    health_score: Optional[int] = None
    status: str
    created_at: datetime
    abnormal_count: int = 0
    total_tests: int = 0
