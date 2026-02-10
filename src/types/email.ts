/**
 * Type definitions for email campaign tracking and analytics
 */

export interface CampaignTracker {
  campaignId: string
  userId: string
  totalUsers: number
  totalEmails: number
  sent: number
  delivered: number
  opened: number
  clicked: number
  unsubscribed: number
  bounced: number
  createdAt: Date
  lastUpdated: Date
}

export interface EmailStats {
  emailId: string
  campaignId: string
  userId: string
  userEmail: string
  sent: boolean
  sentAt?: Date
  delivered: boolean
  deliveredAt?: Date
  opened: boolean
  openedAt?: Date
  clicked: boolean
  clickedAt?: Date
  clickedLink?: string
  unsubscribed: boolean
  bounced: boolean
  bounceReason?: string
  lastTracked: Date
}

export interface EmailPerformance {
  openRate: number
  clickRate: number
  engagementScore: number
  unsubscribeRate: number
  bounceRate: number
  timeToOpen?: number
  timeToClick?: number
}

export interface ABTTest {
  id: string
  campaignId: string
  emailId: string
  variants: ABTestVariant[]
  winner?: string
  startDate: Date
  endDate: Date
}

export interface ABTestVariant {
  id: string
  name: string
  subject?: string
  content?: string
  sends: number
  opens: number
  clicks: number
  conversionRate: number
}

export interface PersonalizationToken {
  token: string
  value: string
  fallback?: string
}

export interface SentimentAnalysis {
  positive: number
  neutral: number
  negative: number
  keywords: string[]
}