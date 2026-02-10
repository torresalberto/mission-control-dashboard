// @ts-nocheck - Seeding script, run manually with: ts-node src/lib/seed.ts
import { initDb } from './db';

// Only run if executed directly, not during build
if (typeof window === 'undefined' && require.main === module) {
  seedDatabase();
}

function seedDatabase() {
  const db = initDb();

  const cronJobs = {
    'family-weather': {
      name: 'family-weather',
      schedule: '0 7 * * *',
      description: 'Daily weather report for family at 7 AM',
      category: 'cron',
      status: 'active'
    },
    'goodnight-dad': {
      name: 'goodnight-dad',
      schedule: '0 20 * * *',
      description: 'Send goodnight message to Dad at 8 PM',
      category: 'cron',
      status: 'active'
    },
    'goodnight-mom': {
      name: 'goodnight-mom',
      schedule: '0 21 * * *',
      description: 'Send goodnight message to Mom at 9 PM',
      category: 'cron',
      status: 'active'
    },
    'goodnight-sister': {
      name: 'goodnight-sister',
      schedule: '0 21 * * *',
      description: 'Send goodnight message to Sister at 9 PM',
      category: 'cron',
      status: 'active'
    },
    'model-health-check': {
      name: 'model-health-check',
      schedule: '0 */6 * * *',
      description: 'Check model health every 6 hours',
      category: 'maintenance',
      status: 'active'
    },
    'whatsapp-real-keepalive': {
      name: 'whatsapp-real-keepalive',
      schedule: '*/5 * * * *',
      description: 'WhatsApp keepalive every 5 minutes',
      category: 'maintenance',
      status: 'active'
    }
  };

  console.log('🌱 Seeding database with cron jobs...');

  try {
    const insertTask = db.prepare(
      `INSERT INTO scheduled_tasks (name, schedule, description, category, status, next_run) VALUES (?, ?, ?, ?, ?, ?)`
    );

    const now = new Date();
    const nextDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    Object.entries(cronJobs).forEach(([key, job]: [string, any]) => {
      const nextRunDate = new Date(nextDay);
      nextRunDate.setSeconds(0);
      switch (key) {
        case 'family-weather':
          nextRunDate.setHours(7, 0);
          break;
        case 'goodnight-dad':
          nextRunDate.setHours(20, 0);
          break;
        case 'goodnight-mom':
        case 'goodnight-sister':
          nextRunDate.setHours(21, 0);
          break;
        case 'model-health-check':
          nextRunDate.setHours(Math.floor(now.getHours() / 6 + 1) * 6, 0);
          break;
        case 'whatsapp-real-keepalive':
          nextRunDate.setTime(now.getTime() + 5 * 60 * 1000);
          break;
      }
      insertTask.run(
        job.name,
        job.schedule,
        job.description,
        job.category,
        job.status,
        nextRunDate.toISOString()
      );
    });

    console.log('✅ Database seeded successfully!');
    console.log(`- ${Object.keys(cronJobs).length} scheduled tasks added`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}
