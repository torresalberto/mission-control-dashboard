export function initDb() { return Promise.resolve(); }
export function getDb() { return Promise.resolve({ all: () => Promise.resolve([]) }); }
export function logActivity(action: string, details: string) { 
  console.log(`[Activity] ${action}: ${details}`);
  return Promise.resolve();
}

// Export for compatibility
class ActivityDb {
  async logActivity(action: string, details: string) {
    console.log(`[Activity] ${action}: ${details}`);
    return Promise.resolve(true);
  }

  async getRecentActivities(limit = 50) {
    return Promise.resolve([]);
  }
}

export default new ActivityDb();