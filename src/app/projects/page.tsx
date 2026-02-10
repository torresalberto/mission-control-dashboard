'use client';

import { useState, useEffect } from 'react';
import ProjectCard from '@/components/ProjectCard';
import { Plus, RefreshCcw, Database } from 'lucide-react';
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

  useEffect(() => {
    loadProjects();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadProjects();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Auto-seed if empty
  useEffect(() => {
    if (!loading && projects.length === 0) {
      console.log('Projects empty - auto-seeding...');
      handleSeedDatabase();
    }
  }, [loading, projects]);

  const handleCreateSampleProject = async () => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'NexAgua Marketing Campaign',
          description: 'Comprehensive digital marketing strategy for NexAgua water optimization solutions',
          status: 'active',
          progress: 35,
          config_json: JSON.stringify({
            targetAudience: 'SaaS businesses',
            channels: ['LinkedIn', 'Email', 'Blog'],
            goal: 'Generate 100 qualified leads'
          })
        })
      });

      if (response.ok) {
        loadProjects();
      }
    } catch (error) {
      console.error('Error creating sample project:', error);
    }
  };

  const handleSeedDatabase = async () => {
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
                onClick={handleSeedDatabase}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
              >
                <Database className="w-4 h-4 mr-2" />
                Seed Database
              </button>
              </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
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
                    onClick={handleSeedDatabase}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Seed Database
                  </button>
                </div>
              </div>
            </div>
          ) : (
            projects.map(project => (
              <ProjectCard key={project.id} project={project} onUpdate={loadProjects} />
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