export class ProjectsDb {
  async getAllProjects() {
    return Promise.resolve([
      {
        id: 1,
        name: 'Activity Feed Fix',
        description: 'Simple working activity feed with Director/agent visibility',
        status: 'completed',
        progress: 100,
        last_activity: new Date().toISOString(),
        config_json: JSON.stringify({ success: true })
      },
      {
        id: 2,
        name: 'Mission Control Dashboard',
        description: 'Real-time monitoring and control interface',
        status: 'active',
        progress: 95,
        last_activity: new Date().toISOString(),
        config_json: JSON.stringify({ features: ['activity-feed', 'real-time', 'agents'] })
      }
    ]);
  }

  async getProjectById(id: number) {
    return Promise.resolve({
      id,
      name: `Project ${id}`,
      description: 'Simple mock project',
      status: 'active',
      progress: 75,
      last_activity: new Date().toISOString(),
      config_json: JSON.stringify({ mock: true }),
      suggestions: []
    });
  }
}

export default new ProjectsDb();
