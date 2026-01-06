"""
OpenAI Service with Tesseract OCR Fallback
TEXT EXTRACTION: PyPDF2 → Tesseract OCR (for scanned PDFs)
AI ANALYSIS: GPT-3.5-turbo (budget-friendly)
"""

import os
import json
import re
from openai import OpenAI
from io import BytesIO
from prompts.medical_prompts import (
    SYSTEM_PROMPT_EXTRACT, USER_PROMPT_EXTRACT,
    SYSTEM_PROMPT_CLASSIFY, USER_PROMPT_CLASSIFY,
    SYSTEM_PROMPT_EXPLAIN, USER_PROMPT_EXPLAIN,
    SYSTEM_PROMPT_ALERT, USER_PROMPT_ALERT,
    SYSTEM_PROMPT_SUMMARY, USER_PROMPT_SUMMARY
)
from models.schemas import (
    ExtractedReportData, TestResult, PatientInfo,
    ReferenceRange, TestStatus, Severity
)


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract text from digital PDF using PyPDF2"""
    try:
        from PyPDF2 import PdfReader
        reader = PdfReader(BytesIO(pdf_bytes))
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        
        extracted_text = text.strip()
        print(f"✓ PyPDF2 extracted {len(extracted_text)} characters")
        return extracted_text
    except Exception as e:
        print(f"✗ PyPDF2 extraction failed: {e}")
        return ""


def extract_text_with_ocr(pdf_bytes: bytes) -> str:
    """Extract text from scanned PDF using Tesseract OCR"""
    try:
        import pytesseract
        from pdf2image import convert_from_bytes
        from PIL import Image
        
        print("⚡ Attempting OCR with Tesseract...")
        
        # Convert PDF pages to images
        images = convert_from_bytes(pdf_bytes, dpi=300)
        
        text = ""
        for i, image in enumerate(images):
            print(f"   Processing page {i+1}/{len(images)}...")
            page_text = pytesseract.image_to_string(image, lang='eng')
            text += page_text + "\n"
        
        extracted_text = text.strip()
        print(f"✓ OCR extracted {len(extracted_text)} characters from {len(images)} pages")
        return extracted_text
        
    except ImportError:
        print("✗ Tesseract not installed. Install: sudo apt-get install tesseract-ocr")
        return ""
    except Exception as e:
        print(f"✗ OCR extraction failed: {e}")
        return ""


def clean_medical_text(text: str) -> str:
    """Clean and normalize extracted medical text"""
    if not text:
        return ""
    
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove common PDF artifacts
    text = re.sub(r'Page \d+ of \d+', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\d{1,2}/\d{1,2}/\d{2,4}', lambda m: f" {m.group()} ", text)  # Preserve dates
    
    # Normalize units
    text = text.replace('mg / dl', 'mg/dL')
    text = text.replace('g / dl', 'g/dL')
    text = text.replace('mg/dl', 'mg/dL')
    text = text.replace('g/dl', 'g/dL')
    
    # Remove multiple spaces again after replacements
    text = re.sub(r'\s+', ' ', text)
    
    return text.strip()


class OpenAIService:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key or api_key == "your_openai_api_key_here":
            print("⚠️  OpenAI API key not configured!")
            self.client = None
        else:
            self.client = OpenAI(api_key=api_key)
            print("✓ OpenAI client initialized")
        
        self.model = "gpt-3.5-turbo"  # Budget-friendly model
    
    async def extract_report_data(self, file_url: str = None, file_bytes: bytes = None, file_type: str = "application/pdf") -> ExtractedReportData:
        """
        Extract structured data from medical report
        WORKFLOW: PyPDF2 → Tesseract OCR (fallback) → Clean → AI Analysis
        """
        if not self.client:
            raise Exception("OpenAI API key not configured. Add OPENAI_API_KEY to .env")
        
        if not file_bytes:
            raise Exception("No file provided")
        
        try:
            # STEP 1: Try PyPDF2 first (digital PDFs)
            print("\n=== TEXT EXTRACTION ===")
            extracted_text = extract_text_from_pdf(file_bytes)
            
            # STEP 2: Fallback to OCR if text is empty or too short
            if len(extracted_text) < 100:
                print("⚠️  Low text extracted, trying OCR fallback...")
                extracted_text = extract_text_with_ocr(file_bytes)
            
            if len(extracted_text) < 50:
                raise Exception(
                    "Could not extract sufficient text from PDF. "
                    "Ensure it's a text-based PDF or install Tesseract for OCR support."
                )
            
            # STEP 3: Clean and normalize text
            print("\n=== TEXT CLEANING ===")
            cleaned_text = clean_medical_text(extracted_text)
            print(f"✓ Cleaned text: {len(cleaned_text)} characters")
            
            # STEP 4: AI Analysis - Extract structured data
            print("\n=== AI ANALYSIS ===")
            user_content = f"""{USER_PROMPT_EXTRACT}

Here is the extracted medical report text:

---
{cleaned_text[:8000]}
---

Extract the medical test data as JSON."""
            
            messages = [
                {"role": "system", "content": SYSTEM_PROMPT_EXTRACT},
                {"role": "user", "content": user_content}
            ]
            
            print("🤖 Sending to OpenAI GPT-3.5...")
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=2000,
                temperature=0.1
            )
            
            content = response.choices[0].message.content
            
            # Clean JSON response
            if "```json" in content:
                content = content.split("```json")[1]
            if "```" in content:
                content = content.split("```")[0]
            
            content = content.strip()
            
            try:
                data = json.loads(content)
            except json.JSONDecodeError as e:
                print(f"✗ JSON parse error: {e}")
                raise Exception("AI response format error. The report may have an unusual format.")
            
            # Convert to Pydantic models
            patient_info = None
            if data.get("patient_info"):
                patient_info = PatientInfo(**data["patient_info"])
            
            tests = []
            for test in data.get("tests", []):
                ref_range = None
                if test.get("reference_range") and isinstance(test["reference_range"], dict):
                    ref_range = ReferenceRange(
                        min=test["reference_range"].get("min"),
                        max=test["reference_range"].get("max")
                    )
                
                tests.append(TestResult(
                    test_name=test.get("test_name", "Unknown Test"),
                    observed_value=str(test.get("observed_value", test.get("value", "N/A"))),
                    unit=test.get("unit"),
                    reference_range=ref_range
                ))
            
            if not tests:
                raise Exception("No test results found. Ensure you uploaded a valid medical lab report.")
            
            print(f"✓ Extracted {len(tests)} tests successfully\n")
            return ExtractedReportData(patient_info=patient_info, tests=tests)
            
        except Exception as e:
            print(f"✗ Error: {e}")
            raise e
    
    async def classify_values(self, tests: list[TestResult]) -> list[TestResult]:
        """Classify test values as NORMAL/LOW/HIGH and assign severity"""
        if not self.client:
            for test in tests:
                test.status = TestStatus.UNKNOWN
                test.severity = Severity.GRAY
            return tests
        
        try:
            tests_json = json.dumps([t.model_dump() for t in tests], indent=2, default=str)
            
            messages = [
                {"role": "system", "content": SYSTEM_PROMPT_CLASSIFY},
                {"role": "user", "content": USER_PROMPT_CLASSIFY.format(tests_json=tests_json)}
            ]
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=2000,
                temperature=0.1
            )
            
            content = response.choices[0].message.content
            
            if "```json" in content:
                content = content.split("```json")[1]
            if "```" in content:
                content = content.split("```")[0]
            
            classified_data = json.loads(content.strip())
            tests_data = classified_data if isinstance(classified_data, list) else classified_data.get("tests", [])
            
            classified_tests = []
            for test_data in tests_data:
                ref_range = None
                if test_data.get("reference_range") and isinstance(test_data["reference_range"], dict):
                    ref_range = ReferenceRange(
                        min=test_data["reference_range"].get("min"),
                        max=test_data["reference_range"].get("max")
                    )
                
                status_str = test_data.get("status", "UNKNOWN").upper()
                severity_str = test_data.get("severity", "gray").lower()
                
                classified_tests.append(TestResult(
                    test_name=test_data.get("test_name", "Unknown"),
                    observed_value=str(test_data.get("observed_value", "N/A")),
                    unit=test_data.get("unit"),
                    reference_range=ref_range,
                    status=TestStatus(status_str) if status_str in ["NORMAL", "LOW", "HIGH", "UNKNOWN"] else TestStatus.UNKNOWN,
                    severity=Severity(severity_str) if severity_str in ["green", "yellow", "red", "gray"] else Severity.GRAY
                ))
            
            return classified_tests
            
        except Exception as e:
            print(f"Classification error: {e}")
            for test in tests:
                test.status = TestStatus.UNKNOWN
                test.severity = Severity.GRAY
            return tests
    
    async def generate_explanation(self, test_name: str, value: str, unit: str, status: str) -> str:
        """Generate patient-friendly explanation (only for abnormal values)"""
        if not self.client:
            return "Please consult your healthcare provider."
        
        try:
            messages = [
                {"role": "system", "content": SYSTEM_PROMPT_EXPLAIN},
                {"role": "user", "content": USER_PROMPT_EXPLAIN.format(
                    test_name=test_name, value=value, unit=unit or "", status=status
                )}
            ]
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=200,
                temperature=0.7
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"Explanation error: {e}")
            return "Please consult your healthcare provider."
    
    async def generate_alert(self, test_name: str, status: str, severity: str) -> str:
        """Generate health alert for critical values"""
        if not self.client:
            return "Please consult your healthcare provider."
        
        try:
            messages = [
                {"role": "system", "content": SYSTEM_PROMPT_ALERT},
                {"role": "user", "content": USER_PROMPT_ALERT.format(
                    test_name=test_name, status=status, severity=severity
                )}
            ]
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=100,
                temperature=0.7
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"Alert error: {e}")
            return "Please consult your healthcare provider."
    
    async def generate_summary(self, tests: list[TestResult]) -> dict:
        """Generate overall health summary and score"""
        normal_count = sum(1 for t in tests if t.status == TestStatus.NORMAL)
        health_score = int((normal_count / len(tests)) * 100) if tests else 0
        
        if not self.client:
            return {
                "summary": "Please review with healthcare provider.",
                "health_score": health_score,
                "attention_areas": []
            }
        
        try:
            tests_summary = "\n".join([
                f"- {t.test_name}: {t.observed_value} {t.unit or ''} - {t.status.value if t.status else 'UNKNOWN'}"
                for t in tests
            ])
            
            abnormal_count = sum(1 for t in tests if t.status in [TestStatus.LOW, TestStatus.HIGH])
            
            messages = [
                {"role": "system", "content": SYSTEM_PROMPT_SUMMARY},
                {"role": "user", "content": USER_PROMPT_SUMMARY.format(
                    tests_summary=tests_summary,
                    total_count=len(tests),
                    normal_count=normal_count,
                    abnormal_count=abnormal_count
                )}
            ]
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=300,
                temperature=0.7
            )
            
            content = response.choices[0].message.content
            
            if "```json" in content:
                content = content.split("```json")[1]
            if "```" in content:
                content = content.split("```")[0]
            
            return json.loads(content.strip())
            
        except Exception as e:
            print(f"Summary error: {e}")
            return {
                "summary": "Please review with healthcare provider.",
                "health_score": health_score,
                "attention_areas": []
            }


# Singleton instance
openai_service = OpenAIService()
