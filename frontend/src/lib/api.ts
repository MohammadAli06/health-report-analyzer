const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface TestResult {
    test_name: string;
    observed_value: string;
    unit?: string;
    reference_range?: {
        min?: number;
        max?: number;
    };
    status?: 'NORMAL' | 'LOW' | 'HIGH' | 'UNKNOWN';
    severity?: 'green' | 'yellow' | 'red' | 'gray';
    explanation?: string;
    alert_message?: string;
}

export interface PatientInfo {
    name?: string;
    age?: number;
    gender?: string;
}

export interface AnalysisResponse {
    report_id: string;
    patient_info?: PatientInfo;
    tests: TestResult[];
    health_score?: number;
    summary?: string;
    overall_status: string;
}

export interface ChartData {
    status_distribution: Array<{
        name: string;
        value: number;
        color: string;
    }>;
    severity_distribution: Array<{
        name: string;
        value: number;
        color: string;
    }>;
    test_results: Array<{
        name: string;
        value: number;
        status: string;
        severity: string;
    }>;
}

export interface InsightsData {
    report_id: string;
    statistics: {
        total_tests: number;
        normal_count: number;
        abnormal_count: number;
        critical_count: number;
        health_score: number;
    };
    abnormal_tests: TestResult[];
    recommendations: string[];
}

// Upload and analyze a medical report
// If userId is not provided, report will be analyzed but NOT saved to DB
export async function uploadAndAnalyzeReport(
    file: File,
    userId?: string,
    reportDate?: string
): Promise<AnalysisResponse> {
    const formData = new FormData();
    formData.append('file', file);

    // Only save to DB if user is authenticated
    if (userId) {
        formData.append('user_id', userId);
        formData.append('save_to_db', 'true');
    } else {
        formData.append('save_to_db', 'false');
    }

    // Add report date (defaults to today)
    if (reportDate) {
        formData.append('report_date', reportDate);
    }

    const response = await fetch(`${API_BASE_URL}/api/reports/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to analyze report');
    }

    return response.json();
}

// Get a previously analyzed report
export async function getReport(reportId: string): Promise<AnalysisResponse> {
    const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}`);

    if (!response.ok) {
        throw new Error('Failed to fetch report');
    }

    return response.json();
}

// Get insights for a report
export async function getInsights(reportId: string): Promise<InsightsData> {
    const response = await fetch(`${API_BASE_URL}/api/insights/${reportId}`);

    if (!response.ok) {
        throw new Error('Failed to fetch insights');
    }

    return response.json();
}

// Get chart data for a report
export async function getChartData(reportId: string): Promise<ChartData> {
    const response = await fetch(`${API_BASE_URL}/api/insights/${reportId}/chart-data`);

    if (!response.ok) {
        throw new Error('Failed to fetch chart data');
    }

    return response.json();
}

// Get explanation for a specific test
export async function getExplanation(
    testName: string,
    value: string,
    unit: string,
    status: string
): Promise<{ test_name: string; explanation: string }> {
    const response = await fetch(`${API_BASE_URL}/api/insights/explain`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            test_name: testName,
            value,
            unit,
            status,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to get explanation');
    }

    return response.json();
}

// Get all reports for a user
export async function getUserReports(userId: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/api/reports/user/${userId}`);

    if (!response.ok) {
        console.error('Failed to fetch user reports');
        return [];
    }

    const data = await response.json();
    return data.reports || [];
}

// Get report with test results
export async function getReportWithTests(reportId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}`);

    if (!response.ok) {
        throw new Error('Failed to fetch report');
    }

    return response.json();
}

// Get test results for a report
export async function getTestResults(reportId: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}/tests`);

    if (!response.ok) {
        console.error('Failed to fetch test results');
        return [];
    }

    const data = await response.json();
    return data.tests || [];
}

