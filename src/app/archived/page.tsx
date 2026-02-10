'use client';

import { Archive, Calendar, Users } from 'lucide-react';

interface ArchivedProject {
  id: string;
  name: string;
  description: string;
  archivedDate: string;
  reason: string;
  dataLocation: string;
  reactivateCommand: string;
}

const ARCHIVED_PROJECTS: ArchivedProject[] = [
  {
    id: 'family-system',
    name: 'Family Support System',
    description: 'Automated weather messages, goodnight reminders, and image analysis for Dad, Mom, and Sister. WhatsApp-based family communication.',
    archivedDate: '2026-02-09',
    reason: 'Guardian reassigned to system testing role',
    dataLocation: '/archive/projects/family-2026-02-09/',
    reactivateCommand: 'mv /archive/projects/family-2026-02-09/* /home/alb/.openclaw/workspace/ && enable family cron jobs'
  }
];

export default function ArchivedPage() {
  return (
    <div className="p-6 h-full overflow-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Archive className="w-6 h-6 text-[#FF6B35]" />
          Archived Projects
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Projects temporarily suspended. Data preserved, can be reactivated.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {ARCHIVED_PROJECTS.map((project) => (
          <div
            key={project.id}
            className="p-5 rounded-lg border border-gray-700 bg-[#0A2540]/50"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-400" />
                  <h3 className="font-semibold text-white text-lg">{project.name}</h3>
                </div>
                <p className="text-gray-400 mt-2">{project.description}</p>
                
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="w-4 h-4" />
                    Archived: {project.archivedDate}
                  </div>
                  <div className="text-red-400">
                    Reason: {project.reason}
                  </div>
                  <div className="text-gray-500 font-mono text-xs">
                    Data: {project.dataLocation}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-900/50 rounded border border-gray-800">
              <p className="text-xs text-gray-500 mb-1">To reactivate:</p>
              <code className="text-xs text-[#FF6B35] font-mono">
                {project.reactivateCommand}
              </code>
            </div>
          </div>
        ))}
      </div>

      {ARCHIVED_PROJECTS.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Archive className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No archived projects</p>
        </div>
      )}
    </div>
  );
}
