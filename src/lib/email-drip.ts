// Simple mock implementation for Vercel compatibility
export class EmailDripCampaign {
  async scheduleUserCampaign(userData) {
    return Promise.resolve([
      {
        campaignId: 'simple-campaign',
        userId: userData.userId,
        emailId: 'welcome-001',
        scheduledDate: new Date(),
        personalizations: {
          email: userData.email,
          subject: 'Welcome to Demo Campaign'
        }
      }
    ]);
  }
}

export { EmailDripCampaign };

export default EmailDripCampaign;