"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, Search, Activity, Cpu, FolderKanban, Archive } from 'lucide-react'

const navigation = [
  { name: 'Activity', href: '/activity', icon: Activity, description: 'Real-time activity feed' },
  { name: 'Projects', href: '/projects', icon: FolderKanban, description: 'AI-suggested workflows' },
  { name: 'Agents', href: '/agents', icon: Cpu, description: 'Agent status grid' },
  { name: 'Calendar', href: '/calendar', icon: Calendar, description: 'Weekly task schedule' },
  { name: 'Search', href: '/search', icon: Search, description: 'Search memories & tasks' },
  { name: 'Archived', href: '/archived', icon: Archive, description: 'Suspended projects' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-[#0A2540] border-r border-gray-700">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-16 border-b border-gray-700">
          <h1 className="text-xl font-bold text-[#FF6B35]">
            Mission Control
          </h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-8">
          <div>
            <h3 className="px-3 mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Core
            </h3>
            <ul className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-[#FF6B35] text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isActive ? 'text-white' : 'text-gray-400'
                      }`} />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs opacity-75">{item.description}</div>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </nav>
        <div className="px-4 py-4 border-t border-gray-700">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm text-gray-400">5 Agents Active</span>
          </div>
        </div>
      </div>
    </div>
  )
}
