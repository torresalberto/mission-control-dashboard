import { format, startOfWeek, addDays, addHours, isSameDay } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  type: 'nexagua' | 'system' | 'success' | 'maintenance'
  description?: string
  color: string
}

interface CalendarGridProps {
  events: CalendarEvent[]
  currentDate: Date
  onDateChange: (date: Date) => void
}

const hourInMinutes = (hour: number) => hour * 60

export default function CalendarGrid({ events, currentDate, onDateChange }: CalendarGridProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }) // Sunday
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const hours = Array.from({ length: 24 }, (_, i) => i)
  
  const formatHour = (hour: number) => 
    hour === 0 ? '12am' : hour === 12 ? '12pm' : hour > 12 ? `${hour - 12}pm` : `${hour}am`

  const getEventPosition = (event: CalendarEvent, dayIndex: number) => {
    const dayStart = addHours(weekStart, dayIndex * 24)
    const dayEnd = addHours(dayStart, 24)
    
    if (event.start >= dayStart && event.start < dayEnd) {
      const startHour = event.start.getHours() + event.start.getMinutes() / 60
      const endHour = event.end.getHours() + event.end.getMinutes() / 60
      const duration = (endHour - startHour) * 4 // Each hour is 4rem
      
      return {
        hour: startHour,
        duration,
        event
      }
    }
    return null
  }

  return (
    <div className="h-full bg-navy-900 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Calendar Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-700">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">Calendar</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onDateChange(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000))}
                className="p-2 hover:bg-navy-800 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-gray-400" />
              </button>
              <span className="text-sm font-medium text-gray-300">
                Week of {format(weekStart, 'MMM d')}
              </span>
              <button
                onClick={() => onDateChange(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000))}
                className="p-2 hover:bg-navy-800 rounded-lg transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>
          
          <button
            onClick={() => onDateChange(new Date())}
            className="px-3 py-1.5 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Today
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto">
          <div className="min-w-max">
            {/* Day headers */}
            <div className="grid grid-cols-[4rem_repeat(7,1fr)] border-b border-navy-700">
              <div className="border-r border-navy-700 p-2"></div>
              {days.map((day) => (
                <div key={day.toISOString()} className="border-r border-navy-700 p-3 text-center">
                  <div className="text-xs font-medium text-gray-400 uppercase">
                    {format(day, 'EEE')}
                  </div>
                  <div className={`text-sm font-semibold ${isSameDay(day, new Date()) ? 'text-orange-400' : 'text-gray-300'}`}>
                    {format(day, 'd')}
                  </div>
                </div>
              ))}
            </div>

            {/* Time slots */}
            <div className="relative">
              {hours.map((hour) => (
                <div key={hour} className="grid grid-cols-[4rem_repeat(7,1fr)]">
                  <div className="border-r border-b border-navy-700 p-2 text-xs text-gray-400 text-right pr-2">
                    {formatHour(hour)}
                  </div>
                  {days.map((day, dayIndex) => (
                    <div
                      key={`${day.toISOString()}-${hour}`}
                      className="border-r border-b border-navy-700 h-16 relative hover:bg-navy-800/50 transition-colors"
                      onClick={() => {
                        // TODO: Open add event dialog
                        console.log('Clicked cell', { day: format(day, 'yyyy-MM-dd'), hour })
                      }}
                    >
                      {events
                        .map(event => getEventPosition(event, dayIndex))
                        .filter(Boolean)
                        .filter(pos => pos!.hour >= hour && pos!.hour < hour + 1)
                        .map(pos => {
                          const event = pos!.event
                          const isStarting = Math.floor(pos!.hour) === hour
                          
                          if (!isStarting) return null
                          
                          return (
                            <div
                              key={event.id}
                              className={`absolute inset-x-1 text-xs p-1 rounded cursor-pointer transition-opacity hover:opacity-90`}
                              style={{ 
                                height: `${pos!.duration}rem`, 
                                top: '0',
                                left: '0',
                                right: '0',
                                background: `${event.color}20`,
                                borderLeft: `3px solid ${event.color}`,
                              }}
                              onClick={(e) => {
                                e.stopPropagation()
                                console.log('Viewing event:', event)
                              }}
                              title={event.description || event.title}
                            >
                              <div className="flex items-center space-x-1">
                                <div 
                                  className="w-2 h-2 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: event.color }}
                                ></div>
                                <span 
                                  className="font-medium text-gray-800 dark:text-gray-200 truncate"
                                  style={{ 
                                    color: event.type === 'success' ? '#22c55e' : 
                                           event.type === 'nexagua' ? '#FF6B35' : '#3b82f6' 
                                  }}
                                >
                                  {event.title}
                                </span>
                              </div>
                              {event.description && (
                                <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 truncate">
                                  {event.description}
                                </p>
                              )}
                            </div>
                          )
                        })}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}