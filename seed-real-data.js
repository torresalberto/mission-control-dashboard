const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'mission-control.db');
const db = new sqlite3.Database(dbPath);

console.log('🌱 Seeding real project data...\n');

db.serialize(() => {
  // Clear existing data
  db.run(`DELETE FROM suggestion_actions`);
  db.run(`DELETE FROM project_suggestions`);
  db.run(`DELETE FROM projects`);

  // Project 1: NexAgua
  db.run(`INSERT INTO projects (name, description, status, progress) VALUES (?, ?, ?, ?)`,
    ['NexAgua', 'Fire pump certification blog + email marketing systems', 'active', 65],
    function(err) {
      if (err) console.error('NexAgua insert error:', err);
      else {
        const projectId = this.lastID;
        db.run(`INSERT INTO project_suggestions (project_id, suggestion_type, title, description, confidence) VALUES (?, ?, ?, ?, ?)`,
          [projectId, 'content', 'Create email drip campaign for NexAgua blog subscribers', 'Build automated 5-email sequence for fire pump certification guide visitors. Capture leads + nurture to consultation.', 85]);
        db.run(`INSERT INTO project_suggestions (project_id, suggestion_type, title, description, confidence) VALUES (?, ?, ?, ?, ?)`,
          [projectId, 'social', 'Auto-generate LinkedIn posts from blog content', 'Repurpose UL/FM certification article into 3 LinkedIn posts with carousel graphics.', 78]);
        db.run(`INSERT INTO project_suggestions (project_id, suggestion_type, title, description, confidence) VALUES (?, ?, ?, ?, ?)`,
          [projectId, 'research', 'Review competitor pricing for fire pump services', 'Analyze 5 competitor websites in Mexico — price positioning + service gaps.', 72]);
      }
    });

  // Project 2: Sports Email/SMS Marketing
  db.run(`INSERT INTO projects (name, description, status, progress) VALUES (?, ?, ?, ?)`,
    ['Sports Picks Marketing', 'Email/SMS system for sports betting picks (SendClaw + Brevo)', 'active', 40],
    function(err) {
      if (err) console.error('Sports insert error:', err);
      else {
        const projectId = this.lastID;
        db.run(`INSERT INTO project_suggestions (project_id, suggestion_type, title, description, confidence) VALUES (?, ?, ?, ?, ?)`,
          [projectId, 'config', 'Configure SendClaw with email domain', 'Set up sender domain + SPF/DKIM records for sports picks delivery.', 90]);
        db.run(`INSERT INTO project_suggestions (project_id, suggestion_type, title, description, confidence) VALUES (?, ?, ?, ?, ?)`,
          [projectId, 'integration', 'Set up Brevo API key for SMS', 'Store Brevo API key for transactional SMS alerts on pick releases.', 88]);
      }
    });

  // Project 3: Doctoriofy.com
  db.run(`INSERT INTO projects (name, description, status, progress) VALUES (?, ?, ?, ?)`,
    ['Doctoriofy.com', 'WordPress doctor directory - needs image/content updates', 'paused', 20],
    function(err) {
      if (err) console.error('Doctoriofy insert error:', err);
      else {
        const projectId = this.lastID;
        db.run(`INSERT INTO project_suggestions (project_id, suggestion_type, title, description, confidence) VALUES (?, ?, ?, ?, ?)`,
          [projectId, 'blocked', 'BLOCKED: Awaiting SSH or cPanel credentials', 'Need access to proceed with image updates. Options: SSH credentials, cPanel login, or WordPress admin.', 95]);
      }
    });

  // Project 4: GitHub Cleanup
  db.run(`INSERT INTO projects (name, description, status, progress) VALUES (?, ?, ?, ?)`,
    ['GitHub Repo Cleanup', 'Delete old repos (FoodiesCustomet variants)', 'active', 30],
    function(err) {
      if (err) console.error('GitHub insert error:', err);
      else {
        const projectId = this.lastID;
        db.run(`INSERT INTO project_suggestions (project_id, suggestion_type, title, description, confidence) VALUES (?, ?, ?, ?, ?)`,
          [projectId, 'blocked', 'BLOCKED: Missing delete_repo scope', 'gh auth needs delete_repo permission. Run: gh auth refresh -h github.com -s delete_repo', 100]);
        db.run(`INSERT INTO project_suggestions (project_id, suggestion_type, title, description, confidence) VALUES (?, ?, ?, ?, ?)`,
          [projectId, 'action', 'Delete torresalberto/FoodiesCustomet', 'Ready to delete once scope is granted.', 95]);
        db.run(`INSERT INTO project_suggestions (project_id, suggestion_type, title, description, confidence) VALUES (?, ?, ?, ?, ?)`,
          [projectId, 'action', 'Delete torresalberto/FoodiesCustomet2.1.6', 'Ready to delete once scope is granted.', 95]);
      }
    });

  // Project 5: Image Analysis Backlog
  db.run(`INSERT INTO projects (name, description, status, progress) VALUES (?, ?, ?, ?)`,
    ['Sister Image Analysis', 'Coco WhatsApp image backlog processor', 'active', 75],
    function(err) {
      if (err) console.error('Image insert error:', err);
      else {
        const projectId = this.lastID;
        db.run(`INSERT INTO project_suggestions (project_id, suggestion_type, title, description, confidence) VALUES (?, ?, ?, ?, ?)`,
          [projectId, 'monitoring', '7 images remaining in backlog', 'Cron running every 15 min — 3 images per batch. ETA: 2 more runs.', 80]);
      }
    });
});

db.close(() => {
  console.log('✅ Real data seeded: 5 projects, 9 suggestions');
});
