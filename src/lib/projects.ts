export const getAllProjects = () => Promise.resolve([
  {
    id: 1,
    name: 'Activity Feed Fix',
    description: 'Simple working activity feed with Director/agent visibility',
    status: 'completed',
    progress: 100,
    last_activity: new Date().toISOString(),
    config_json: JSON.stringify({ type: 'simple' }),
    suggestions: []
  }
]);

export const getProjectById = (id: number) => Promise.resolve({
  id,
  name: 'Activity Feed Fix',
  description: 'Simple static activity feed implementation',
  status: 'completed',
  progress: 100,
  last_activity: new Date().toISOString(),
  config_json: JSON.stringify({ type: 'vercel-compatible' }),
  suggestions: []
});

export const createProject = (data: any) => 
  Promise.resolve({ id: Date.now(), ...data, suggestions: [] });

export const updateProject = (id: number, data: any) => 
  Promise.resolve({ id, ...data, suggestions: [] });

export const updateSuggestionStatus = (id: number, status: string) => 
  Promise.resolve({ id, status, suggestion_type: 'activity_fix' });

export const createSuggestion = (data: any) =>
  Promise.resolve({ id: Date.now(), ...data, status: 'executed' });