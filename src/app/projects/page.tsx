'use client';

import { useState, useEffect } from 'react';
import EnhancedProjectCard from '@/components/EnhancedProjectCard';
import { Plus, RefreshCcw, Database, Play, Clock } from 'lucide-react';
import { getAllProjects } from '@/lib/projects';
import { Toaster } from 'react-hot-toast';

interface Project {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  progress: number;
  last_activity: string;
  config_json: string;
  suggestions: any[];
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [runningTasks, setRunningTasks] = useState(0);

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      const pending = data.tasks.filter((t: any) => t.status === 'pending').length;
      const running = data.tasks.filter((t: any) => t.status === 'running').length;
      setPendingTasks(pending);
      setRunningTasks(running);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const executeAllPendingTasks = async () => {
    try {
      const response = await fetch('/api/tasks/execute-all', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to execute tasks');
      toast.success('Executing all pending tasks...');
      loadTasks();
    } catch (error) {
      console.error('Error executing tasks:', error);
      toast.error('Failed to execute tasks');
    }
  };

  useEffect(() => {
    loadProjects();
    loadTasks();
    
    // Auto-refresh every 30 seconds for projects and 5 seconds for tasks
    const projectsInterval = setInterval(() => {
      loadProjects();
    }, 30000);
    
    const tasksInterval = setInterval(() => {
      loadTasks();
    }, 5000);
    
    return () => {
      clearInterval(projectsInterval);
      clearInterval(tasksInterval);
    };
  }, []);
  
  useEffect(() => {
    if (!loading && projects.length === 0) {
      console.log('Projects empty - auto-seeding...');
    }
  }, [loading, projects]);


    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        loadProjects();
        alert('Database seeded successfully!');
      } else {
        alert('Error seeding database. Check console for details.');
      }
    } catch (error) {
      console.error('Error seeding database:', error);
      alert('Error seeding database. Check console for details.');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadProjects();
  };

  const activeProjects = projects.filter(p => p.status === 'active');
  const completedProjects = projects.filter(p => p.status === 'completed');
  const otherProjects = projects.filter(p => !['active', 'completed'].includes(p.status));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6">
                  <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Project Workflow Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                AI-powered project management with intelligent suggestions
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCcw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
              >
                <Database className="w-4 h-4 mr-2" />
              </button>
              </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Stats Overview */}
        {/* Task Queue Section */}
        {(pendingTasks > 0 || runningTasks > 0) && (
          <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Task Queue</h2>
                <p className="text-sm text-gray-600">Monitor and execute pending tasks</p>
              </div>
              {pendingTasks > 0 && (
                <button
                  onClick={executeAllPendingTasks}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Run {pendingTasks} Pending Tasks
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{pendingTasks}</div>
                <div className="text-sm text-gray-600">Pending Tasks</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{runningTasks}</div>
                <div className="text-sm text-gray-600">Running Tasks</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{(runningTasks / (pendingTasks + runningTasks || 1) * 100).toFixed(0)}%</div>
                <div className="text-sm text-gray-600">Completion Rate</div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-2xl font-bold text-gray-900">{projects.length}</div>
            <div className="text-sm text-gray-600">Total Projects</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-2xl font-bold text-green-600">{activeProjects.length}</div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-2xl font-bold text-blue-600">{completedProjects.length}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-2xl font-bold text-purple-600">
              {projects.reduce((total, p) => total + p.suggestions.filter(s => s.status === 'pending').length, 0)}
            </div>
            <div className="text-sm text-gray-600">Pending AI Suggestions</div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.length === 0 ? (
            <div className="col-span-full">
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-600 mb-4">
                  Get started by creating your first project with AI suggestions
                </p>
                <div className="flex justify-center space-x-3">
                  <button
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
                  >
                    <Database className="w-4 h-4 mr-2" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            projects.map(project => (
              <EnhancedProjectCard key={project.id} project={project} onUpdate={loadProjects} />
            ))
          )}
        </div>

        {/* Analytics Summary */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Suggestions Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-bold text-green-600">
                {projects.reduce((total, p) => 
                  total + p.suggestions.filter(s => s.status === 'approved').length, 0
                )}
              </div>
              <div className="text-sm text-gray-600">Suggestions Approved</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600">
                {projects.reduce((total, p) => 
                  total + p.suggestions.filter(s => s.status === 'declined').length, 0
                )}
              </div>
              <div className="text-sm text-gray-600">Suggestions Declined</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-600">
                {Math.round(
                  (projects.reduce((total, p) => 
                    total + p.suggestions.filter(s => s.status === 'approved').length, 0
                  ) / projects.reduce((total, p) => total + p.suggestions.length, 0)) * 100 || 0
                )}%
              </div>
              <div className="text-sm text-gray-600">Acceptance Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}