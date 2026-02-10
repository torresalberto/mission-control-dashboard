/**
 * Email Drip Campaign Engine
 * 
 * Manages automated email sequences for NexAgua leads
 * Features:
 * - Schedule emails based on user signup date
 * - Track open/click rates with Brevo API integration
 * - Generate AI-enhanced content personalized to each stage
 * - Handle campaign analytics and optimization suggestions
 */

import { CampaignTracker, EmailStats } from '@/types/email'
import { BrevoApi } from '@/lib/brevo-api'
import { AiContentGenerator } from '@/lib/ai-content-generator'

interface EmailCampaignConfig {
  campaignName: string
  emails: EmailCampaignEmail[]
  trackingEnabled: boolean
  brevoApiKey: string
}

interface EmailCampaignEmail {
  id: string
  name: string
  day: number
  subject: string
  type: string
  template: string
  content: any
  tracking: any
  personalization?: string[]
}

interface UserData {
  email: string
  firstName?: string
  lastName?: string
  companyName?: string
  industry?: string
  signupDate: Date
  userId: string
  customFields?: Record<string, any>
}

interface EmailRequest {
  campaignId: string
  userId: string
  emailId: string
  scheduledDate: Date
  personalizations: Record<string, any>
}

class EmailDripCampaign {
  private brevoApi: BrevoApi
  private aiGenerator: AiContentGenerator
  private campaignTracker: CampaignTracker

  constructor(config: EmailCampaignConfig) {
    this.brevoApi = new BrevoApi(config.brevoApiKey)
    this.aiGenerator = new AiContentGenerator()
    this.campaignTracker = new CampaignTracker()
    this.config = config
  }

  /**
   * Schedule email campaign for a new user
   * 
   * @param userData - User information including signup date
   * @returns Array of scheduled email requests
   */
  async scheduleUserCampaign(userData: UserData): Promise<EmailRequest[]> {
    const scheduledEmails: EmailRequest[] = []
    const signupDate = new Date(userData.signupDate)

    // Calculate personalized dates based on signup
    for (const email of this.config.emails) {
      const scheduledDate = new Date(signupDate)
      scheduledDate.setDate(scheduledDate.getDate() + email.day)

      // Generate personalized content using AI
      const personalizedContent = await this.generatePersonalizedContent(email, userData)

      const emailRequest: EmailRequest = {
        campaignId: this.config.campaignName,
        userId: userData.userId,
        emailId: email.id,
        scheduledDate,
        personalizations: {
          ...userData,
          content: personalizedContent
        }
      }

      scheduledEmails.push(emailRequest)

      // Track the scheduled campaign
      await this.campaignTracker.scheduleEmail(emailRequest)
    }

    return scheduledEmails
  }

  /**
   * Generate AI-enhanced personalized content for email
   */
  private async generatePersonalizedContent(email: any, userData: UserData): Promise<string> {
    const context = {
      emailType: email.type,
      user: userData,
      company: userData.companyName,
      industry: userData.industry || 'business',
      day: email.day
    }

    let prompt = ''
    
    switch (email.type) {
      case 'welcome':
        prompt = `Generate a warm, personalized welcome email for ${userData.firstName || 'there'} from ${userData.companyName || 'their company'}. Focus on water cost savings and make it engaging for ${context.industry} industry.`
        break
      
      case 'education':
        prompt = `Create educational content about water efficiency for ${userData.firstName || 'businesses'} in ${context.industry}. Include specific ROI examples and actionable insights.`
        break
      
      case 'case-study':
        prompt = `Write a compelling case study for ${context.industry} company showing 30-40% water cost reduction. Make it specific and relatable using industry terminology.`
        break
      
      case 'offer':
        prompt = `Create an irresistible trial offer for ${userData.firstName || 'they'} to try NexAgua's water solutions. Include urgency and clear value proposition.`
        break
    }

    return await this.aiGenerator.generateEmailContent(prompt, email.content, context)
  }

  /**
   * Send a scheduled email through Brevo API
   */
  async sendScheduledEmail(emailRequest: EmailRequest): Promise<boolean> {
    try {
      const emailData = {
        sender: {
          name: "NexAgua Team",
          email: "hello@nexagua.com"
        },
        to: [{
          email: emailRequest.personalizations.email,
          name: `${emailRequest.personalizations.firstName || ''} ${emailRequest.personalizations.lastName || ''}`.trim()
        }],
        subject: this.generateSubjectLine(emailRequest.emailId),
        htmlContent: await this.renderEmailTemplate(emailRequest),
        scheduledAt: emailRequest.scheduledDate.toISOString()
      }

      const result = await this.brevoApi.sendTransactionalEmail(emailData)
      
      if (result.success) {
        await this.campaignTracker.markSent(emailRequest.campaignId, emailRequest.userId, emailRequest.emailId)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Failed to send email:', error)
      await this.campaignTracker.markFailed(emailRequest.campaignId, emailRequest.userId, emailRequest.emailId, error.message)
      return false
    }
  }

  /**
   * Track email performance metrics
   */
  async trackEmailPerformance(campaignId: string, userId: string, emailId: string): Promise<EmailStats> {
    const stats = await this.brevoApi.getEmailStats(campaignId, userId, emailId)
    
    // Update tracking in our database
    await this.campaignTracker.updateStats(campaignId, userId, emailId, {
      opens: stats.opens || 0,
      clicks: stats.clicks || 0,
      unsubscribes: stats.unsubscribes || 0,
      bounces: stats.bounces || 0,
      lastTracked: new Date()
    })

    return stats
  }

  /**
   * Generate email suggestions based on performance data
   */
  async generateOptimizationSuggestions(campaignId: string): Promise<EmailSuggestion[]> {
    const stats = await this.campaignTracker.getCampaignStats(campaignId)
    const suggestions: EmailSuggestion[] = []

    // A/B Testing suggestion
    if (stats.averageOpenRate < 25) {
      suggestions.push({
        type: 'ab-test',
        title: 'Optimize subject line A/B test',
        confidence: 80,
        description: 'Open rates below 25% suggest subject line optimization opportunities',
        action: 'Setup A/B test with 3-5 subject variants'
      })
    }

    // Personalization suggestion
    const uniqueIndustries = await this.campaignTracker.getUniqueIndustries(campaignId)
    if (uniqueIndustries.length > 2) {
      suggestions.push({
        type: 'personalization',
        title: 'Add personalization tokens',
        confidence: 75,
        description: 'Segment users by {{industry}} and {{company_size}} for better targeting',
        action: 'Implement dynamic content blocks per industry'
      })
    }

    // Industry segmentation
    if (uniqueIndustries.length >= 3) {
      suggestions.push({
        type: 'segmentation',
        title: 'Segment by industry',
        confidence: 85,
        description: 'Create industry-specific email sequences for better engagement',
        action: 'Split campaign into hotel, restaurant, healthcare segments'
      })
    }

    return suggestions
  }

  private generateSubjectLine(emailId: string): string {
    const email = this.config.emails.find(e => e.id === emailId)
    return email?.subject || "Hello from NexAgua"
  }

  private async renderEmailTemplate(emailRequest: EmailRequest): Promise<string> {
    const email = this.config.emails.find(e => e.id === emailRequest.emailId)
    if (!email) throw new Error(`Email template not found: ${emailRequest.emailId}`)

    return await this.aiGenerator.renderTemplate(email.template, {
      subject: email.subject,
      content: emailRequest.personalizations.content,
      user: emailRequest.personalizations
    })
  }

  /**
   * Process pending emails (cron job)
   */
  async processPendingEmails(): Promise<{ sent: number; failed: number }> {
    const pending = await this.campaignTracker.getPendingEmails()
    let sent = 0
    let failed = 0

    for (const email of pending) {
      if (email.scheduledDate <= new Date()) {
        const success = await this.sendScheduledEmail(email)
        if (success) sent++ else failed++
      }
    }

    return { sent, failed }
  }

  /**
   * Get campaign analytics
   */
  async getCampaignAnalytics(campaignId: string): Promise<any> {
    return await this.campaignTracker.getCampaignAnalytics(campaignId)
  }
}

interface EmailSuggestion {
  type: string
  title: string
  confidence: number
  description: string
  action: string
}

export { EmailDripCampaign, EmailCampaignConfig, EmailRequest, UserData, EmailSuggestion }