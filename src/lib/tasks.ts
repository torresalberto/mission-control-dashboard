export interface Task {
  id: number;
  project_id: number;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  result: string | null;
  error: string | null;
  task_type: string;
  config: string; // JSON string
}

export interface TaskActivityLog {
  id: number;
  task_id: number;
  action: string;
  details: string;
  timestamp: string;
  metadata: string | null;
}

// Get all pending tasks
export async function getPendingTasks(): Promise<Task[]> {
  try {
    const response = await fetch('/api/tasks?status=pending&running');
    if (!response.ok) throw new Error('Failed to fetch tasks');
    const data = await response.json();
    return data.tasks || [];
  } catch (error) {
    console.error('Error fetching pending tasks:', error);
    return [];
  }
}

// Get all tasks for a project
export async function getTasksByProject(projectId: number): Promise<Task[]> {
  try {
    const response = await fetch(`/api/tasks?project_id=${projectId}`);
    if (!response.ok) throw new Error('Failed to fetch tasks');
    const data = await response.json();
    return data.tasks || [];
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    return [];
  }
}

// Execute a pending task
export async function executeTask(taskId: number): Promise<Task> {
  const response = await fetch(`/api/tasks/${taskId}/execute`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to execute task');
  }
  
  return response.json();
}

// Execute all pending tasks
export async function executeAllPendingTasks(): Promise<Task[]> {
  const response = await fetch('/api/tasks/execute-all', {
    method: 'POST',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to execute tasks');
  }
  
  return response.json();
}

// Log task activity
export async function logTaskActivity(taskId: number, action: string, details: string, metadata?: any): Promise<void> {
  const response = await fetch('/api/tasks/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskId, action, details, metadata }),
  });
  
  if (!response.ok) {
    console.error('Failed to log task activity');
  }
}

// Get task activity logs
export async function getTaskActivity(taskId: number): Promise<TaskActivityLog[]> {
  try {
    const response = await fetch(`/api/tasks/${taskId}/activity`);
    if (!response.ok) throw new Error('Failed to fetch activity');
    const data = await response.json();
    return data.activity || [];
  } catch (error) {
    console.error('Error fetching task activity:', error);
    return [];
  }
}