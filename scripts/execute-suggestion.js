#!/usr/bin/env node

// Background script for executing approved suggestions
const sqlite3 = require('sqlite3').verbose';
const path = require('path');
const fs = require('fs');

const suggestionId = process.argv[2];

if (!suggestionId) {
  console.error('Usage: node execute-suggestion.js <suggestion-id>');
  process.exit(1);
}

// Update status to executed in database
const dbPath = path.join(__dirname, '..', 'mission-control.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Get suggestion details
  db.get(
    `SELECT ps.*, p.name as project_name, p.config_json 
     FROM project_suggestions ps 
     JOIN projects p ON ps.project_id = p.id 
     WHERE ps.id = ?`,
    [suggestionId],
    (err, row) => {
      if (err) {
        console.error('Error fetching suggestion:', err);
        process.exit(1);
      }

      if (!row) {
        console.error('Suggestion not found:', suggestionId);
        process.exit(1);
      }

      const suggestion = row;
      
      // Load AI suggestions templates
      const templates = {
        'email_drip_campaign': {
          description: 'Create email drip campaign',
          handler: 'createEmailDripCampaign'
        },
        'linkedin_posts': {
          description: 'Generate LinkedIn posts from blog',
          handler: 'generateLinkedInPosts'
        },
        'competitor_analysis': {
          description: 'Review competitor pricing',
          handler: 'analyzeCompetitors'
        }
      };

      const template = templates[suggestion.suggestion_type];
      if (!template) {
        console.error('Unknown suggestion type:', suggestion.suggestion_type);
        process.exit(1);
      }

      console.log(`Executing suggestion ${suggestionId}: ${suggestion.title}`);
      console.log(`Project: ${suggestion.project_name}`);
      console.log(`Type: ${suggestion.suggestion_type}`);

      // Generate execution plan based on suggestion type
      generateExecutionPlan(
        suggestion.suggestion_type,
        suggestion,
        JSON.parse(suggestion.config_json || '{}')
      );

      // Update status to executed
      db.run(
        `UPDATE project_suggestions SET status = 'executed', acted_at = ? WHERE id = ?`,
        [new Date().toISOString(), suggestionId],
        (err) => {
          if (err) {
            console.error('Error updating suggestion status:', err);
          } else {
            console.log(`Suggestion ${suggestionId} marked as executed`);
          }
          db.close();
        }
      );
    }
  );
});

function generateExecutionPlan(type, suggestion, config) {
  const outputDir = path.join(__dirname, '..', 'execution_plans');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const planFile = path.join(outputDir, `suggestion-${suggestionId}.json`);
  const plan = {
    suggestionId,
    type,
    project: suggestion.project_name,
    title: suggestion.title,
    description: suggestion.description,
    config,
    executionSteps: []
  };

  switch (type) {
    case 'email_drip_campaign':
      plan.executionSteps = [
        {
          type: 'research',
          description: 'Research target audience and email segments'
        },
        {
          type: 'design',
          description: 'Design email templates for drip sequence'
        },
        {
          type: 'implement',
          description: 'Set up Mailchimp/Brevo automation workflow'
        }
      ];
      break;
    case 'linkedin_posts':
      plan.executionSteps = [
        {
          type: 'analyze',
          description: 'Analyze existing blog content for repurposing opportunities'
        },
        {
          type: 'generate',
          description: 'Generate LinkedIn post variants using AI'
        },
        {
          type: 'schedule',
          description: 'Schedule posts across next 7 days'
        }
      ];
      break;
    case 'competitor_analysis':
      plan.executionSteps = [
        {
          type: 'research',
          description: 'Research competitor pricing and feature lists'
        },
        {
          type: 'analyze',
          description: 'Analyze pricing strategy gaps and opportunities'
        },
        {
          type: 'report',
          description: 'Create detailed comparative analysis report'
        }
      ];
      break;
  }

  fs.writeFileSync(planFile, JSON.stringify(plan, null, 2));
  console.log(`Execution plan written to: ${planFile}`);
}

console.log('Background suggestion execution started...');