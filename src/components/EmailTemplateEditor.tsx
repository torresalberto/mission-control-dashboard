/**
 * Email Template Editor Component for Mission Control
 * 
 * Features: Rich text editor, Preview mode, Send test functionality
 * Integration with email templates and Brevo API
 */

import React, { useState, useEffect } from 'react';
import { Button, Card, CardContent, CardHeader, TextField } from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { createBrevoApi } from '@/lib/brevo-api';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  templateType: 'welcome' | 'education' | 'case-study' | 'offer';
  personalizationTokens: string[];
  trackingEnabled: boolean;
}

interface EmailTemplateEditorProps {
  templateId?: string;
  onSave?: (template: EmailTemplate) => void;
  onTest?: (template: EmailTemplate, testEmail: string) => void;
}

const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({ 
  templateId, 
  onSave, 
  onTest 
}) => {
  const [template, setTemplate] = useState<EmailTemplate>({
    id: templateId || '',
    name: '',
    subject: '',
    htmlContent: '',
    templateType: 'welcome',
    personalizationTokens: ['{{first_name}}', '{{company_name}}', '{{industry}}'],
    trackingEnabled: true
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Available tokens for personalization
  const activeTokens = [
    { token: '{{first_name}}', description: 'User first name' },
    { token: '{{company_name}}', description: 'Company name' },
    { token: '{{industry}}', description: 'Business industry' },
    { token: '{{signup_source}}', description: 'How user found us' },
    { token: '{{company_size}}', description: 'Small/Medium/Large' },
    { token: '{{trial_deadline}}', description: 'Trial expiration date' }
  ];

  // Email templates for quick start
  const templatePresets = {
    welcome: {
      name: 'Welcome Series Template',
      subject: 'Welcome to NexAgua - Your Water Solutions Journey Starts Here',
      htmlContent: `<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
  <div style="background: linear-gradient(135deg, #2c5282, #3182ce); color: white; padding: 30px; text-align: center;">
    <h1>Welcome to NexAgua, {{first_name}}!</h1>
    <p>Your water transformation journey begins today</p>
  </div>
  
  <div style="padding: 40px 30px; background: white;">
    <p>Hi {{first_name}},</p>
    
    <p>Welcome to the NexAgua family! I'm thrilled you've decided to explore how we can help {{company_name}} reduce water costs and operate more sustainably.</p>
    
    <p>As a {{industry}} business, you know how quickly water costs can add up. Over the next few days, I'll share exactly how companies like {{company_name}} have transformed their water operations.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="#" style="background: linear-gradient(135deg, #38a169, #48bb78); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
        Explore Our Solutions
      </a>
    </div>
    
    <p>Best regards,<br>
    The NexAgua Team</p>
  </div>
  
  <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666;">
    <p>NexAgua Water Solutions | hello@nexagua.com</p>
  </div>
</div>`
    },
    
    education: {
      name: 'Educational Content Template',
      subject: '3 Ways NexAgua Cuts Your Water Costs by 40%',
      htmlContent: `<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
  <div style="background: linear-gradient(135deg, #2c5282, #3182ce); color: white; padding: 30px; text-align: center;">
    <h1>How {{company_name}} Can Save 30-40% on Water</h1>
  </div>
  
  <div style="padding: 40px 30px; background: white;">
    <p>Hello {{first_name}},</p>
    
    <p>Here are the three proven strategies {{industry}} businesses use to cut water costs by 30-40%:</p>
    
    <div style="margin: 30px 0;">
      <h3>1. Smart Water Monitoring</h3>
      <p>IoT sensors track usage patterns and detect leaks instantly. Hotels save $2,400-3,800/month.</p>
      
      <h3>2. Efficient Filtration</h3>
      <p>Modern filtration reduces waste by 25-35%. ROI achieved in 8-12 months.</p>
      
      <h3>3. Automated Flow Controls</h3>
      <p>Advanced valves optimize water pressure throughout {{company_name}}.</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="#" style="background: linear-gradient(135deg, #38a169, #48bb78); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
        Get the Case Studies
      </a>
    </div>
  </div>
</div>`
    },
    
    'case-study': {
      name: 'Case Study Template',
      subject: 'How {{industry}} Business {{company_name}} Cut Costs 35%',
      htmlContent: `<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
  <div style="background: linear-gradient(135deg, #2c5282, #3182ce); color: white; padding: 30px; text-align: center;">
    <h1>Real Results from a {{industry}} Business Like {{company_name}}</h1>
  </div>
  
  <div style="padding: 40px 30px; background: white;">
    <p>Hi {{first_name}},</p>
    
    <p>I want to share a success story from a {{industry}} company just like {{company_name}}. They reduced their water costs by 35% in just 90 days.</p>
    
    <div style="background: #f8f9fa; padding: 25px; margin: 25px 0; border-radius: 10px;">
      <h3>Before & After Results</h3>
      <p><strong>Before:</strong> $12,000/month water costs</p>
      <p><strong>After:</strong> $7,800/month (35% reduction)</p>
      <p><strong>Annual Savings:</strong> $50,400</p>
      <p><strong>Payback Period:</strong> 4.2 months</p>
    </div>
    
    <p>This isn't hypothetical - these are real numbers from a company in your industry.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="#" style="background: linear-gradient(135deg, #38a169, #48bb78); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
        Book My Consultation
      </a>
    </div>
  </div>
</div>`
    },
    
    offer: {
      name: 'Offer Template',
      subject: 'Ready to Try NexAgua? 30-Day Trial + $500 Setup Credit',
      htmlContent: `<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
  <div style="background: linear-gradient(135deg, #2c5282, #3182ce); color: white; padding: 30px; text-align: center;">
    <h1>Your 30-Day NexAgua Trial</h1>
    <p>With $500 setup credit - No commitment required</p>
  </div>
  
  <div style="padding: 40px 30px; background: white;">
    <p>Ready {{first_name}},</p>
    
    <p>You've seen what's possible for {{company_name}}. Now it's time to experience it for yourself.</p>
    
    <div style="background: #f8f9fa; padding: 25px; margin: 25px 0; border-radius: 10px;">
      <h3>30-Day Trial Includes:</h3>
      <ul>
        <li>$500 setup credit</li>
        <li>Full system installation</li>
        <li>Staff training included</li>
        <li>24/7 customer support</li>
      </ul>
      <p><strong>No commitment required</strong></p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="#" style="background: linear-gradient(135deg, #38a169, #48bb78); color: white; padding: 20px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px;">
        Start Free Trial Now
      </a>
    </div>
    
    <p style="text-align: center; font-size: 12px; color: #666;">
      Trial expires in {{trial_deadline}}
    </p>
  </div>
</div>`
    }
  };

  // Module configuration for ReactQuill
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      [{ 'align': [] }],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ]
  };

  // Add personalization token
  const addToken = (token: string) => {
    setTemplate(prev => ({
      ...prev,
      htmlContent: prev.htmlContent + ` ${token}`
    }));
  };

  // Load template preset
  const loadTemplate = (type: keyof typeof templatePresets) => {
    setTemplate({
      ...template,
      ...templatePresets[type],
      templateType: type
    });
  };

  // Send test email
  const handleSendTest = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setIsTesting(true);
    try {
      if (onTest) {
        await onTest(template, testEmail);
      } else {
        // Fallback to direct Brevo API
        const brevo = createBrevoApi(process.env.NEXT_PUBLIC_BREVO_API_KEY || '');
        const emailData = {
          sender: { name: "NexAgua Test", email: "test@nexagua.com" },
          to: [{ email: testEmail }],
          subject: `[TEST] ${template.subject}`,
          htmlContent: template.htmlContent
        };
        
        await brevo.sendTransactionalEmail(emailData);
        alert('Test email sent successfully!');
      }
    } catch (error) {
      console.error('Failed to send test email:', error);
      alert('Failed to send test email. Please check console.');
    }
    setIsTesting(false);
  };

  // Save template
  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(template);
      }
      alert('Template saved successfully!');
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('Failed to save template.');
    }
    setIsSaving(false);
  };

  return (
    <Card>
      <CardHeader title={`Email Template Editor - ${template.templateType}`} />
      <CardContent>
        <div style={{ marginBottom: 20 }}>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => setPreviewMode(!previewMode)}
            style={{ marginRight: 10 }}
          >
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
          
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 10 }}>
            {Object.keys(templatePresets).map(type => (
              <Button
                key={type}
                variant={template.templateType === type ? "contained" : "outlined"}
                size="small"
                onClick={() => loadTemplate(type as keyof typeof templatePresets)}
              >
                {templatePresets[type as keyof typeof templatePresets].name}
              </Button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <TextField
            label="Template Name"
            fullWidth
            value={template.name}
            onChange={(e) => setTemplate({ ...template, name: e.target.value })}
            style={{ marginBottom: 10 }}
          />
          <TextField
            label="Subject Line"
            fullWidth
            value={template.subject}
            onChange={(e) => setTemplate({ ...template, subject: e.target.value })}
          />
        </div>

        {previewMode ? (
          <div style={{ border: '1px solid #ddd', padding: 20, maxHeight: 500, overflow: 'auto' }}>
            <div dangerouslySetInnerHTML={{ __html: template.htmlContent }} />
          </div>
        ) : (
          <div style={{ marginBottom: 20 }}>
            <ReactQuill
              theme="snow"
              value={template.htmlContent}
              onChange={(content) => setTemplate({ ...template, htmlContent: content })}
              modules={modules}
              style={{ height: 300, marginBottom: 20 }}
            />
            
            <div style={{ marginTop: 40 }}>
              <h4>Personalization Tokens:</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 20 }}>
                {activeTokens.map(({ token, description }) => (
                  <Button
                    key={token}
                    variant="text"
                    size="small"
                    onClick={() => addToken(token)}
                    title={description}
                  >
                    {token}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: 20, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <TextField
              label="Test Email"
              variant="outlined"
              size="small"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="your-email@example.com"
            />
            <Button
              variant="outlined"
              onClick={handleSendTest}
              disabled={isTesting || !testEmail}
            >
              {isTesting ? 'Sending...' : 'Send Test'}
            </Button>
          </div>
          
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailTemplateEditor;