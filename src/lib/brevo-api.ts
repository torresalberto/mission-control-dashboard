/**
 * Brevo API Integration (SendGrid alternative)
 * 
 * Handles email delivery through Brevo (formerly Sendinblue)
 * API endpoints for transactional emails, tracking, and analytics
 */

interface BrevoApiConfig {
  apiKey: string
  baseUrl?: string
}

interface EmailData {
  sender: {
    name: string
    email: string
  }
  to: Array<{
    email: string
    name?: string
  }>
  subject: string
  htmlContent: string
  textContent?: string
  scheduledAt?: string
  templateId?: number
  tags?: string[]
}

interface BrevoResponse {
  messageId?: string
  status: number
  statusText: string
  data?: any
}

interface EmailStats {
  opens: number
  clicks: number
  unsubscribes: number
  bounces: number
  complaints: number
  delivered: number
  sent: number
  lastEvent?: string
}

class BrevoApi {
  private apiKey: string
  private baseUrl: string
  
  constructor(apiKey: string, baseUrl = 'https://api.brevo.com/v3') {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
  }

  /**
   * Send transactional email
   */
  async sendTransactionalEmail(emailData: EmailData): Promise<BrevoResponse> {
    const url = `${this.baseUrl}/smtp/email`
    
    const payload = {
      sender: emailData.sender,
      to: emailData.to,
      subject: emailData.subject,
      htmlContent: emailData.htmlContent,
      textContent: emailData.textContent,
      scheduledAt: emailData.scheduledAt,
      tags: emailData.tags || ['nexagua-campaign']
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'api-key': this.apiKey
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`Brevo API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return {
      messageId: data.messageId,
      status: response.status,
      statusText: response.statusText,
      data
    }
  }

  /**
   * Get email statistics
   */
  async getEmailStats(
    campaignId?: string, 
    userId?: string, 
    emailId?: string
  ): Promise<EmailStats> {
    const url = `${this.baseUrl}/smtp/statistics`  
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'api-key': this.apiKey
      }
    })

    if (!response.ok) {
      return {
        opens: 0,
        clicks: 0,
        unsubscribes: 0,
        bounces: 0,
        complaints: 0,
        delivered: 0,
        sent: 0
      }
    }

    const data = await response.json()
    return {
      opens: data.opens || 0,
      clicks: data.clicks || 0,
      unsubscribes: data.unsubscribes || 0,
      bounces: data.bounces || 0,
      complaints: data.complaints || 0,
      delivered: data.delivered || 0,
      sent: data.sent || 0,
      lastEvent: data.lastEvent
    }
  }

  /**
   * Get delivery events for tracking
   */
  async getDeliveryEvents(messageId: string): Promise<Array<{
    event: string
    email: string
    date: string
    messageId: string
  }>> {
    const url = `${this.baseUrl}/events/{messageId}/email`  
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'api-key': this.apiKey
      }
    })

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return data.events || []
  }

  /**
   * Create email template
   */
  async createTemplate(templateData: {
    name: string
    subject: string
    htmlContent: string
    folderId?: number
  }): Promise<BrevoResponse> {
    const url = `${this.baseUrl}/smtp/templates`
    
    const payload = {
      name: templateData.name,
      subject: templateData.subject,
      htmlContent: templateData.htmlContent,
      folderId: templateData.folderId || 0,
      isActive: true
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'api-key': this.apiKey
      },
      body: JSON.stringify(payload)
    })

    return {
      status: response.status,
      statusText: response.statusText,
      data: await response.json()
    }
  }

  /**
   * Update email template
   */
  async updateTemplate(templateId: number, templateData: {
    subject?: string
    htmlContent?: string
  }): Promise<BrevoResponse> {
    const url = `${this.baseUrl}/smtp/templates/${templateId}`
    
    const payload = {
      subject: templateData.subject,
      htmlContent: templateData.htmlContent
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'api-key': this.apiKey
      },
      body: JSON.stringify(payload)
    })

    return {
      status: response.status,
      statusText: response.statusText,
      data: await response.json()
    }
  }

  /**
   * List email templates
   */
  async listTemplates(limit: number = 50, offset: number = 0): Promise<Array<{
    id: number
    name: string
    subject: string
    isActive: boolean
    testSent: boolean
    sender: {
      name: string
      email: string
    }
    replyTo: string
    toField: string
  }>> {
    const url = `${this.baseUrl}/smtp/templates?limit=${limit}&offset=${offset}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'api-key': this.apiKey
      }
    })

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return data.templates || []
  }

  /**
   * Delete template
   */
  async deleteTemplate(templateId: number): Promise<boolean> {
    const url = `${this.baseUrl}/smtp/templates/${templateId}`
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'api-key': this.apiKey
      }
    })

    return response.ok
  }

  /**
   * Test template by sending preview
   */
  async testTemplate(templateId: number, recipients: string[]): Promise<BrevoResponse> {
    const url = `${this.baseUrl}/smtp/templates/${templateId}/sendTest`
    
    const payload = {
      emailTo: recipients
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'api-key': this.apiKey
      },
      body: JSON.stringify(payload)
    })

    return {
      status: response.status,
      statusText: response.statusText,
      data: await response.json()
    }
  }
}

export { BrevoApi }

// Global instance for use throughout the app
export const createBrevoApi = (apiKey: string) => new BrevoApi(apiKey)