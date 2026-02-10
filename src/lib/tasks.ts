export interface QueuedTask {
  id: string;
  suggestionId: string;
  projectId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  agentType: string;
  task: any;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
}

// Simple in-memory task queue for now
const tasks = new Map<string, QueuedTask>();

export function queueTask(task: Omit<QueuedTask, 'id' | 'createdAt' | 'status'>): QueuedTask {
  const id = `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const newTask: QueuedTask = {
    ...task,
    id,
    createdAt: new Date(),
    status: 'pending'
  };
  
  tasks.set(id, newTask);
  return newTask;
}

export function getPendingTasks(limit?: number): QueuedTask[] {
  const pendingTasks = Array.from(tasks.values())
    .filter(task => task.status === 'pending')
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  
  return limit ? pendingTasks.slice(0, limit) : pendingTasks;
}

export function getTasksByStatus(status?: QueuedTask['status']): QueuedTask[] {
  if (!status) {
    return Array.from(tasks.values()).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  
  return Array.from(tasks.values())
    .filter(task => task.status === status)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

export function getTaskById(id: string): QueuedTask | undefined {
  return tasks.get(id);
}

export function startTask(id: string): QueuedTask | null {
  const task = tasks.get(id);
  if (!task || task.status !== 'pending') {
    return null;
  }
  
  task.status = 'running';
  task.startedAt = new Date();
  tasks.set(id, task);
  return task;
}

export function completeTask(id: string, result: any): QueuedTask | null {
  const task = tasks.get(id);
  if (!task || task.status !== 'running') {
    return null;
  }
  
  task.status = 'completed';
  task.result = result;
  task.completedAt = new Date();
  tasks.set(id, task);
  return task;
}

export function failTask(id: string, error: string): QueuedTask | null {
  const task = tasks.get(id);
  if (!task || task.status !== 'running') {
    return null;
  }
  
  task.status = 'failed';
  task.error = error;
  task.completedAt = new Date();
  tasks.set(id, task);
  return task;
}

export function deleteTask(id: string): boolean {
  return tasks.delete(id);
}