import React, { useState, useEffect } from 'react';
import { Check, X, Clock, ArrowRight, Sparkles, Play, Circle, CheckCircle, AlertCircle } from 'lucide-react';
import { ProjectWithSuggestions } from '@/lib/projects';
import { getTasksByProject, executeTask, Task } from '@/lib/tasks';
import { toast } from 'react-hot-toast';

interface EnhancedProjectCardProps {
  project: ProjectWithSuggestions;
  onUpdate: () => void;
}

const EnhancedProjectCard: React.FC<EnhancedProjectCardProps> = ({ project, onUpdate }) => {
  const [loadingActions, setLoadingActions] = useState<number[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const loadTasks = async () => {
    setLoadingTasks(true);
    try {
      const tasks = await getTasksByProject(project.id);
      setTasks(tasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleSuggestionAction = async (
    suggestionId: number,
    action: 'approve' | 'decline' | 'snooze',
    reason?: string
  ) => {
    setLoadingActions(prev => [...prev, suggestionId]);
    
    try {
      const endpoint = `/api/suggestions/${suggestionId}/${action}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason || '' })
      });

      if (response.ok) {
        toast.success(`${action === 'approve' ? 'Approved' : action === 'decline' ? 'Declined' : 'Snoozed'} suggestion`);
        onUpdate();
        loadTasks(); // Refresh tasks
      } else {
        throw new Error('Failed to process suggestion');
      }
    } catch (error) {
      toast.error('Failed to process suggestion');
    } finally {
      setLoadingActions(prev => prev.filter(id => id !== suggestionId));
    }
  };

  const handleExecuteTask = async (taskId: number) => {
    try {
      toast.loading('Executing task...');
      await executeTask(taskId);
      toast.success('Task executed successfully');
      loadTasks();
      onUpdate();
    } catch (error) {
      toast.error('Failed to execute task');
    }
  };

  useEffect(() => {
    loadTasks();
  }, [project.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Circle className="w-4 h-4 text-yellow-500" />;
      case 'running': return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending').length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{project.description}</p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
          {project.status}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium">{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${project.progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Last activity: {new Date(project.last_activity).toLocaleDateString()}
        </p>
      </div>

      {/* Task Status Badge */}
      {tasks.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Tasks</span>
            <div className="flex items-center space-x-2">
              {pendingTasks > 0 && (
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                  {pendingTasks} pending
                </span>
              )}
            </div>
          </div>
          <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
            {tasks.slice(0, 5).map(task => (
              <div key={task.id} className="flex items-center justify-between p-2 bg-white rounded text-sm">
                <div className="flex items-center space-x-2">
                  {getTaskStatusIcon(task.status)}
                  <span className="text-gray-700 text-xs">{task.title}</span>
                </div>
                {task.status === 'pending' && (
                  <button
                    onClick={() => handleExecuteTask(task.id)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    title="Run Task"
                  >
                    <Play className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {project.suggestions.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center mb-3">
            <Sparkles className="w-4 h-4 text-purple-500 mr-2" />
            <h4 className="text-sm font-medium text-gray-900">AI Suggestions</h4>
            {project.suggestions.filter(s => s.status === 'pending').length > 0 && (
              <span className="ml-auto px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                {project.suggestions.filter(s => s.status === 'pending').length} new
              </span>
            )}
          </div>
          
          <div className="space-y-3">
            {project.suggestions.map((suggestion) => (
              suggestion.status === 'pending' && (
                <div key={suggestion.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h5 className="text-sm font-medium text-gray-900">{suggestion.title}</h5>
                      <p className="text-xs text-gray-600 mt-1">{suggestion.description}</p>
                    </div>
                    <span className={`text-xs font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                      {suggestion.confidence}% confidence
                    </span>
                  </div>
                  
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => handleSuggestionAction(suggestion.id, 'approve')}
                      disabled={loadingActions.includes(suggestion.id)}
                      className="flex items-center px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleSuggestionAction(suggestion.id, 'decline')}
                      disabled={loadingActions.includes(suggestion.id)}
                      className="flex items-center px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Decline
                    </button>
                    <button
                      onClick={() => handleSuggestionAction(suggestion.id, 'snooze')}
                      disabled={loadingActions.includes(suggestion.id)}
                      className="flex items-center px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      Snooze
                    </button>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {project.suggestions.filter(s => s.status === 'pending').length === 0 && tasks.length === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">No active suggestions or tasks</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedProjectCard;