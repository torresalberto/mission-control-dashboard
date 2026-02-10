export function generateEmailContent(campaign: any) {
  return {
    subject: `NexAgua Campaign - ${new Date().toLocaleDateString()}`,
    body: "<p>Welcome to NexAgua! This is a sample email from the AI content generator.</p>"
  };
}

export default {
  generateEmailContent
};