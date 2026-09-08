import devLog from './devLog.js';

class ResumeService {
  constructor() {
    this.backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://himanshu-portfolio-api-e10b4543a453.herokuapp.com';
    this.apiEndpoint = `${this.backendUrl}/api/resume`;
    
    devLog('🔧 Resume Service initialized');
    devLog(`🚀 Backend URL: ${this.backendUrl}`);
  }

  // Health check for resume service
  async checkHealth() {
    try {
      const response = await fetch(`${this.apiEndpoint}/health`);
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      
      const data = await response.json();
      devLog('✅ Resume service health:', data);
      return data;
    } catch (error) {
      console.error('❌ Resume service health check failed:', error);
      throw error;
    }
  }

  // Create base resume template
  async createBaseResume(resumeData) {
    try {
      const response = await fetch(`${this.apiEndpoint}/base-resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resumeData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Failed to create base resume: ${response.status} - ${errorData.message}`);
      }

      const data = await response.json();
      devLog('✅ Base resume created:', data.data?.resume?._id);
      return data;
    } catch (error) {
      console.error('❌ Failed to create base resume:', error);
      throw error;
    }
  }

  // Analyze job description
  async analyzeJobDescription(jobDescription) {
    try {
      const response = await fetch(`${this.apiEndpoint}/analyze-job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobDescription })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Failed to analyze job: ${response.status} - ${errorData.message}`);
      }

      const data = await response.json();
      devLog('🔍 Job analysis completed');
      return data;
    } catch (error) {
      console.error('❌ Failed to analyze job:', error);
      throw error;
    }
  }

  // Customize resume for specific job
  async customizeResumeForJob(jobData) {
    try {
      const { jobDescription, companyName, jobTitle, templateId } = jobData;
      
      const response = await fetch(`${this.apiEndpoint}/customize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobDescription,
          companyName,
          jobTitle,
          templateId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Failed to customize resume: ${response.status} - ${errorData.message}`);
      }

      const data = await response.json();
      devLog('✨ Resume customized for:', companyName, '-', jobTitle);
      devLog('📊 ATS Score:', data.data?.atsScore + '%');
      return data;
    } catch (error) {
      console.error('❌ Failed to customize resume:', error);
      throw error;
    }
  }

  // Generate PDF from customized resume
  async generatePDF(resumeId, template = 'professional') {
    try {
      const response = await fetch(`${this.apiEndpoint}/generate-pdf/${resumeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ template })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Failed to generate PDF: ${response.status} - ${errorData.message}`);
      }

      const data = await response.json();
      devLog('📄 PDF generated:', data.data?.fileName);
      return data;
    } catch (error) {
      console.error('❌ Failed to generate PDF:', error);
      throw error;
    }
  }

  // Get all resumes with filtering
  async getResumes(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const url = `${this.apiEndpoint}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Failed to get resumes: ${response.status} - ${errorData.message}`);
      }

      const data = await response.json();
      devLog('📋 Retrieved resumes:', data.data?.resumes?.length || 0);
      return data;
    } catch (error) {
      console.error('❌ Failed to get resumes:', error);
      throw error;
    }
  }

  // Get specific resume by ID
  async getResumeById(resumeId) {
    try {
      const response = await fetch(`${this.apiEndpoint}/${resumeId}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Failed to get resume: ${response.status} - ${errorData.message}`);
      }

      const data = await response.json();
      devLog('📄 Retrieved resume:', resumeId);
      return data;
    } catch (error) {
      console.error('❌ Failed to get resume:', error);
      throw error;
    }
  }

  // Download PDF file
  getPDFDownloadUrl(fileName) {
    return `${this.backendUrl}/uploads/${fileName}`;
  }

  // Helper: One-step resume customization and PDF generation
  async customizeAndGeneratePDF(jobData, template = 'professional') {
    try {
      devLog('🚀 Starting full resume customization process...');
      
      // Step 1: Customize resume
      const customizationResult = await this.customizeResumeForJob(jobData);
      const resumeId = customizationResult.data?.resume?._id;
      
      if (!resumeId) {
        throw new Error('Failed to get resume ID from customization');
      }

      // Step 2: Generate PDF
      const pdfResult = await this.generatePDF(resumeId, template);
      
      return {
        customization: customizationResult,
        pdf: pdfResult,
        downloadUrl: this.getPDFDownloadUrl(pdfResult.data?.fileName),
        resumeId,
        fileName: pdfResult.data?.fileName
      };
    } catch (error) {
      console.error('❌ Failed to customize and generate PDF:', error);
      throw error;
    }
  }

  // Helper: Format resume data for display
  formatResumeData(resume) {
    return {
      id: resume._id,
      name: resume.name,
      title: resume.title,
      company: resume.companyName,
      jobTitle: resume.jobTitle,
      atsScore: resume.atsScore,
      matchPercentage: resume.matchPercentage,
      createdAt: new Date(resume.createdAt).toLocaleDateString(),
      customized: resume.customizedForJob,
      pdfUrl: resume.customizedPdfUrl
    };
  }
}

// Export singleton instance
export const resumeService = new ResumeService();
export default resumeService; 