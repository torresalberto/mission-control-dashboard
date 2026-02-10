import { Bell, Settings, User } from 'lucide-react'

interface HeaderProps {
  title?: string
  description?: string
  children?: React.ReactNode
}

export default function Header({ title, description, children }: HeaderProps) {
  return (
    <div className="border-b border-navy-700">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            {title && (
              <h1 className="text-2xl font-bold text-white">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-sm text-gray-400 mt-1">
                {description}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {children}
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-white hover:bg-navy-800 rounded-lg transition-colors">
                <Bell className="h-4 w-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-navy-800 rounded-lg transition-colors">
                <Settings className="h-4 w-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-navy-800 rounded-lg transition-colors">
                <User className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}