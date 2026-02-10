/**
 * AI Content Generator for NexAgua Email Campaigns
 * 
 * Uses OpenAI/GPT models to generate personalized email content
 * based on user context, campaign stage, and industry data
 */

interface ContentContext {
  emailType: string
  user: any
  company?: string
  industry: string
  day: number
  previousInteractions?: any[]
}

interface AIRequest {
  prompt: string
  context: ContentContext
  content: any
}

class AiContentGenerator {
  private apiKey: string
  
  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || ''
  }

  /**
   * Generate personalized email content using AI
   */
  async generateEmailContent(prompt: string, baseContent: any, context: ContentContext): Promise<string> {
    const systemPrompt = this.getSystemPrompt(context.emailType, context)
    
    const fullPrompt = `${systemPrompt}

Content to enhance: ${JSON.stringify(baseContent, null, 2)}

User context: ${JSON.stringify(context, null, 2)}

Please generate personalized email content that:
1. Uses natural, conversational language
2. Includes specific personalization tokens like {{first_name}}, {{company_name}}, {{industry}}
3. Addresses the exact pain points for ${context.industry} businesses
4. Uses industry-appropriate terminology and examples
5. Includes clear call-to-action buttons
6. Is mobile-responsive compatible
7. Feels authentic and helpful, not sales-y

Generate the complete HTML email content:`

    // Simulate OpenAI API call (in real implementation)
    const mockGeneratedContent = await this.mockGenerateContent(fullPrompt)
    
    return this.processGeneratedContent(mockGeneratedContent, context)
  }

  /**
   * Render email template with generated content
   */
  async renderTemplate(templateName: string, data: any): Promise<string> {
    const templates = {
      'welcome-template': this.getWelcomeTemplate(),
      'education-template': this.getEducationTemplate(),
      'case-study-template': this.getCaseStudyTemplate(),
      'offer-template': this.getOfferTemplate()
    }

    const template = templates[templateName as keyof typeof templates]
    if (!template) {
      throw new Error(`Template not found: ${templateName}`)
    }

    return this.fillTemplate(template, data)
  }

  /**
   * Get system prompt by email type
   */
  private getSystemPrompt(emailType: string, context: ContentContext): string {
    const prompts = {
      welcome: `You are a friendly onboarding specialist for NexAgua, a commercial water treatment company. 
Create a warm welcome email for new users in the ${context.industry} industry.
Focus on water cost savings, sustainability, and business impact.`,
      
      education: `You are a water efficiency consultant specializing in ${context.industry} businesses.
Create educational content that shows exactly how water system optimization saves 30-40% on water costs.
Include specific examples and actionable insights.`,
      
      'case-study': `You are sharing a success story about water cost reduction in ${context.industry}.
Tell the story of a real client achievement with specific metrics and outcomes.
Make it relatable and inspiring for similar businesses.`,
      
      offer: `You are extending a compelling trial offer for NexAgua's water solutions to ${context.industry} businesses.
Create urgency while highlighting the $500 setup credit and 30-day trial benefits.
Include risk removal and clear next steps.`
    }

    return prompts[emailType as keyof typeof prompts] || prompts.welcome
  }

  /**
   * Mock content generation (replace with real OpenAI API)
   */
  private async mockGenerateContent(prompt: string): Promise<string> {
    // This would be replaced with actual OpenAI API call
    const industry = prompt.match(/specializing in (.+?) businesses/)?.[1] || 'business'
    
    const mockPrompts = {
      welcome: this.mockWelcomeContent(industry),
      education: this.mockEducationContent(industry),
      'case-study': this.mockCaseStudyContent(industry),
      offer: this.mockOfferContent(industry)
    }

    const keywordMap = {
      welcome: 'welcome',
      education: 'educational',
      'case-study': 'case study',
      offer: 'trial'
    }

    const emailType = Object.keys(keywordMap).find(type => 
      prompt.toLowerCase().includes(type)
    ) || 'welcome'

    return mockPrompts[emailType as keyof typeof mockPrompts]
  }

  /**
   * Process and clean generated content
   */
  private processGeneratedContent(content: string, context: ContentContext): string {
    return content
      .replace(/\{\{first_name\}\}/g, context.user?.firstName || 'there')
      .replace(/\{\{company_name\}\}/g, context.user?.companyName || 'your business')
      .replace(/\{\{industry\}\}/g, context.industry)
      .replace(/\{\{company_size\}\}/g, context.user?.companySize || 'growing')
      .trim()
  }

  /**
   * Fill template with data
   */
  private fillTemplate(template: string, data: any): string {
    const { subject, content, user } = data
    
    return template
      .replace('{{SUBJECT}}', subject)
      .replace('{{CONTENT}}', content)
      .replace(/\{\{first_name\}\}/g, user?.firstName || 'there')
      .replace(/\{\{company_name\}\}/g, user?.companyName || 'your company')
      .replace(/\{\{email\}\}/g, user?.email || '')
  }

  /**
   * Template definitions
   */
  private getBaseTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{SUBJECT}}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #2c5282, #3182ce); color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 40px 30px; }
        .cta-button { background: linear-gradient(135deg, #38a169, #48bb78); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; margin: 20px 0; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{SUBJECT}}</h1>
        </div>
        <div class="content">
            {{CONTENT}}
            <div style="text-align: center; margin: 30px 0;">
                <a href="#" class="cta-button">{{CTA_TEXT}}</a>
            </div>
        </div>
        <div class="footer">
            <p>NexAgua Water Solutions | hello@nexagua.com</p>
        </div>
    </div>
</body>
</html>`
  }

  private getWelcomeTemplate(): string {
    return this.getBaseTemplate().replace('{{CTA_TEXT}}', 'Explore Our Solutions')
  }

  private getEducationTemplate(): string {
    return this.getBaseTemplate().replace('{{CTA_TEXT}}', 'Get the Case Studies')
  }

  private getCaseStudyTemplate(): string {
    return this.getBaseTemplate().replace('{{CTA_TEXT}}', 'Book My Consultation')
  }

  private getOfferTemplate(): string {
    return this.getBaseTemplate().replace('{{CTA_TEXT}}', 'Start Free Trial')
  }

  /**
   * Mock content for each email type
   */
  private mockWelcomeContent(industry: string): string {
    return `
<p>Hi {{first_name}},</p>

<p>Welcome to the NexAgua family! I'm thrilled you've decided to explore how we can help {{company_name}} reduce water costs and operate more sustainably.</p>

<p>As a {{industry}} business, you know how quickly water costs can add up. From what we've seen with similar companies, there's usually a 30-40% reduction opportunity just waiting to be unlocked.</p>

<p>Over the next few days, I'll share exactly how companies like {{company_name}} have transformed their water operations - with specific case studies, ROI calculators, and practical steps you can take.</p>

<p>Ready to see what's possible?</p>

<p>Best,<br>
The NexAgua Team</p>`
  }

  private mockEducationContent(industry: string): string {
    return `
<p>Hello {{first_name}},</p>

<p>I promised to share how {{industry}} businesses are cutting their water costs by 30-40%. Here are the three proven strategies we see working time and time again:</p>

<h3>1. Smart Water Monitoring Systems</h3>
<p>Installing IoT sensors to track usage patterns and detect leaks instantly. Hotels save $2,400-3,800/month just from this.</p>

<h3>2. Efficient Filtration Upgrades</h3>
<p>Upgrading to modern filtration systems that reduce water waste by 25-35%. Restaurants see immediate ROI within 8-12 months.</p>

<h3>3. Automated Flow Controls</h3>
<p>Advanced valve systems that optimize water pressure throughout {{company_name}}'s facilities.</p>

<p>Want to calculate your potential savings? I've included our ROI calculator in the case studies link below.</p>`
  }

  private mockCaseStudyContent(industry: string): string {
    return `
<p>Hi {{first_name}},</p>

<p>I want to share how 