'use client'

import { Sidebar } from '../components/Sidebar'
import { useState, ReactNode, useEffect } from 'react'
import { Event, getEvents, addEvent, updateEvent, deleteEvent } from './calendarService'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function CalendarPage() {
  // Authentication check
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  // State for current date and view type
  const [date, setDate] = useState(new Date())
  const [viewType, setViewType] = useState('month') // 'day', 'week', or 'month'
  const [events, setEvents] = useState<Event[]>([])
  const [showEventDrawer, setShowEventDrawer] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    start: new Date(),
    end: new Date(),
    color: '#3b82f6' // Default blue color
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  // Load events from Firebase on component mount
  useEffect(() => {
    if (!user) return; // Skip fetching if user isn't authenticated
    
    const fetchEvents = async () => {
      setLoading(true)
      try {
        const fetchedEvents = await getEvents(user.uid)
        setEvents(fetchedEvents)
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [user])

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // If not authenticated, don't render the page content
  if (!user) {
    return null
  }

  const currentMonth = date.getMonth()
  const currentYear = date.getFullYear()
  const today = new Date()

  // Navigation functions
  const goToPreviousMonth = () => {
    setDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const goToNextMonth = () => {
    setDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const goToToday = () => {
    setDate(new Date())
  }

  // Event handling functions
  const openEventDrawer = (date: Date) => {
    const newDate = new Date(date)
    
    // Set default times (current time for start, +1 hour for end)
    const startTime = new Date(newDate)
    const endTime = new Date(newDate)
    endTime.setHours(endTime.getHours() + 1)
    
    setNewEvent({
      title: '',
      start: startTime,
      end: endTime,
      color: '#3b82f6'
    })
    
    setShowEventDrawer(true)
  }

  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (name === 'startDate' || name === 'endDate') {
      const [year, month, day] = value.split('-').map(Number)
      const updatedDate = name === 'startDate' ? 
        new Date(newEvent.start as Date) : 
        new Date(newEvent.end as Date)
      
      updatedDate.setFullYear(year, month - 1, day)
      
      setNewEvent({
        ...newEvent,
        [name === 'startDate' ? 'start' : 'end']: updatedDate
      })
    } else if (name === 'startTime' || name === 'endTime') {
      const [hours, minutes] = value.split(':').map(Number)
      const updatedTime = name === 'startTime' ? 
        new Date(newEvent.start as Date) : 
        new Date(newEvent.end as Date)
      
      updatedTime.setHours(hours, minutes)
      
      setNewEvent({
        ...newEvent,
        [name === 'startTime' ? 'start' : 'end']: updatedTime
      })
    } else {
      setNewEvent({
        ...newEvent,
        [name]: value
      })
    }
  }

  const saveEvent = async () => {
    if (!newEvent.title || !newEvent.start || !newEvent.end) {
      alert('Please fill in all required fields')
      return
    }
    
    if (newEvent.start > newEvent.end) {
      alert('End time must be after start time')
      return
    }
    
    setLoading(true)
    
    try {
      // If editing an existing event, update it
      if (newEvent.id) {
        const updatedEvent = {
          ...newEvent as Event,
          userId: user?.uid
        }
        const success = await updateEvent(updatedEvent)
        if (success) {
          setEvents(events.map(event => 
            event.id === newEvent.id ? updatedEvent : event
          ))
        }
      } else {
        // Otherwise add a new event
        const savedEvent = await addEvent({
          title: newEvent.title,
          start: newEvent.start,
          end: newEvent.end,
          color: newEvent.color
        }, user?.uid)
        
        if (savedEvent) {
          setEvents([...events, savedEvent])
        }
      }
      
      setShowEventDrawer(false)
    } catch (error) {
      console.error('Error saving event:', error)
      alert('Failed to save event. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEvent = async (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      setLoading(true)
      
      try {
        const success = await deleteEvent(id)
        if (success) {
          setEvents(events.filter(event => event.id !== id))
          setShowEventDrawer(false)
        } else {
          alert('Failed to delete event. Please try again.')
        }
      } catch (error) {
        console.error('Error deleting event:', error)
        alert('Failed to delete event. Please try again.')
      } finally {
        setLoading(false)
      }
    }
  }

  const editEvent = (event: Event) => {
    setNewEvent({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end)
    })
    setShowEventDrawer(true)
  }

  // Helper function to check if a date has events
  const getEventsForDate = (date: Date) => {
    const dateString = date.toDateString()
    return events.filter(event => 
      new Date(event.start).toDateString() === dateString ||
      new Date(event.end).toDateString() === dateString
    )
  }

  // Get days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  
  // Get first day of month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()

  // Create calendar grid
  const days: ReactNode[] = []
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Format date for input fields
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Format time for input fields
  const formatTimeForInput = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }

  // Month View Rendering
  const renderMonthView = () => {
    // Clear the days array
    days.length = 0
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 border-t border-r bg-white" />)
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(currentYear, currentMonth, day)
      const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
      const dayEvents = getEventsForDate(currentDate)
      
      days.push(
        <div
          key={day}
          className={`h-32 p-2 border-t border-r bg-white hover:bg-zinc-50 transition-colors ${
            isToday ? 'bg-zinc-50 border-zinc-400' : ''
          }`}
          onClick={() => openEventDrawer(currentDate)}
        >
          <div className="flex justify-between items-center mb-1">
            <span className={`text-sm ${isToday ? 'font-bold' : ''}`}>{day}</span>
            {dayEvents.length > 0 && (
              <span className="text-xs bg-gray-200 rounded-full px-1.5 py-0.5">
                {dayEvents.length}
              </span>
            )}
          </div>
          <div className="overflow-y-auto max-h-24">
            {dayEvents.slice(0, 3).map(event => (
              <div 
                key={event.id}
                className="text-xs p-1 mb-1 rounded truncate cursor-pointer"
                style={{ backgroundColor: event.color + '33' }} // Add transparency
                onClick={(e) => {
                  e.stopPropagation()
                  editEvent(event)
                }}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-xs text-gray-500">
                +{dayEvents.length - 3} more
              </div>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-7 border-l border-b">
        {weekDays.map(day => (
          <div key={day} className="text-center font-medium text-sm p-2 border-t border-r bg-white">
            {day}
          </div>
        ))}
        {days}
      </div>
    )
  }

  // Week View Rendering
  const renderWeekView = () => {
    // Get the current week's Sunday
    const currentDate = new Date(date)
    const dayOfWeek = currentDate.getDay()
    const diff = currentDate.getDate() - dayOfWeek
    const weekStart = new Date(currentDate)
    weekStart.setDate(diff)
    
    const weekDaysElements = []
    
    // Create 7 days starting from Sunday
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart)
      day.setDate(weekStart.getDate() + i)
      const isToday = day.toDateString() === today.toDateString()
      const dayEvents = getEventsForDate(day)
      
      weekDaysElements.push(
        <div key={i} className={`flex-1 border-r p-2 min-h-[500px] ${isToday ? 'bg-zinc-50' : 'bg-white'}`}>
          <div 
            className={`text-center mb-2 p-1 rounded cursor-pointer hover:bg-gray-100 ${isToday ? 'font-bold' : ''}`}
            onClick={() => openEventDrawer(day)}
          >
            <div>{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.getDay()]}</div>
            <div className="text-xl">{day.getDate()}</div>
          </div>
          <div className="h-full">
            {dayEvents.map(event => (
              <div 
                key={event.id}
                className="text-xs p-2 mb-1 rounded cursor-pointer"
                style={{ backgroundColor: event.color + '33' }}
                onClick={() => editEvent(event)}
              >
                <div className="font-semibold">{event.title}</div>
                <div>
                  {new Date(event.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                  {new Date(event.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }
    
    return (
      <div className="flex border-l border-b border-t">
        {weekDaysElements}
      </div>
    )
  }

  // Day View Rendering
  const renderDayView = () => {
    const hours = []
    const isToday = date.toDateString() === today.toDateString()
    const dayEvents = getEventsForDate(date)
    
    // Group events by hour
    const eventsByHour: { [hour: number]: Event[] } = {}
    dayEvents.forEach(event => {
      const startHour = new Date(event.start).getHours()
      if (!eventsByHour[startHour]) {
        eventsByHour[startHour] = []
      }
      eventsByHour[startHour].push(event)
    })
    
    for (let hour = 0; hour < 24; hour++) {
      const displayHour = hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`
      const hourDate = new Date(date)
      hourDate.setHours(hour, 0, 0, 0)
      
      hours.push(
        <div key={hour} className="flex border-b h-16 group">
          <div className="w-20 text-right pr-2 text-sm text-gray-500 -mt-2">
            {displayHour}
          </div>
          <div 
            className="flex-1 border-l relative hover:bg-gray-50 cursor-pointer"
            onClick={() => {
              const newDate = new Date(date)
              newDate.setHours(hour, 0, 0, 0)
              openEventDrawer(newDate)
            }}
          >
            {eventsByHour[hour]?.map(event => (
              <div 
                key={event.id}
                className="absolute left-0 right-0 mx-1 p-1 text-xs rounded overflow-hidden"
                style={{ 
                  backgroundColor: event.color + '33',
                  top: '2px',
                  zIndex: 10
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  editEvent(event)
                }}
              >
                <div className="font-semibold truncate">{event.title}</div>
                <div>
                  {new Date(event.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                  {new Date(event.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }
    
    return (
      <div className={`border-r ${isToday ? 'bg-zinc-50' : 'bg-white'}`}>
        <div className="text-center p-2 font-bold border-b">
          {date.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
        <div>
          {hours}
        </div>
      </div>
    )
  }

  // Render the appropriate view based on viewType
  const renderCalendarView = () => {
    switch (viewType) {
      case 'day':
        return renderDayView()
      case 'week':
        return renderWeekView()
      case 'month':
      default:
        return renderMonthView()
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-64 min-h-screen w-full p-4">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold">
              {date.toLocaleString('default', {
                month: 'long',
                year: 'numeric'
              })}
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={goToPreviousMonth} 
                className="px-3 py-1 bg-white border rounded hover:bg-gray-50"
              >
                ←
              </button>
              <button 
                onClick={goToToday} 
                className="px-3 py-1 bg-white border rounded hover:bg-gray-50"
              >
                Today
              </button>
              <button 
                onClick={goToNextMonth} 
                className="px-3 py-1 bg-white border rounded hover:bg-gray-50"
              >
                →
              </button>
            </div>
          </div>
          <div className="flex border rounded overflow-hidden">
            <button 
              onClick={() => setViewType('day')} 
              className={`px-4 py-1 ${viewType === 'day' ? 'bg-blue-500 text-white' : 'bg-white'}`}
            >
              Day
            </button>
            <button 
              onClick={() => setViewType('week')} 
              className={`px-4 py-1 border-l ${viewType === 'week' ? 'bg-blue-500 text-white' : 'bg-white'}`}
            >
              Week
            </button>
            <button 
              onClick={() => setViewType('month')} 
              className={`px-4 py-1 border-l ${viewType === 'month' ? 'bg-blue-500 text-white' : 'bg-white'}`}
            >
              Month
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          renderCalendarView()
        )}
        
        {/* Event Side Drawer */}
        <div 
          className={`fixed top-0 right-0 h-full bg-white shadow-lg w-96 border-l border-gray-200 z-50 transition-transform duration-300 ease-in-out ${
            showEventDrawer ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">
                {newEvent.id ? 'Edit Event' : 'Add Event'}
              </h3>
              <button 
                onClick={() => setShowEventDrawer(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={newEvent.title}
                  onChange={handleEventChange}
                  className="w-full p-2 border rounded"
                  placeholder="Event title"
                  disabled={loading}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formatDateForInput(newEvent.start as Date)}
                  onChange={handleEventChange}
                  className="w-full p-2 border rounded"
                  disabled={loading}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Start Time</label>
                <input
                  type="time"
                  name="startTime"
                  value={formatTimeForInput(newEvent.start as Date)}
                  onChange={handleEventChange}
                  className="w-full p-2 border rounded"
                  disabled={loading}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formatDateForInput(newEvent.end as Date)}
                  onChange={handleEventChange}
                  className="w-full p-2 border rounded"
                  disabled={loading}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">End Time</label>
                <input
                  type="time"
                  name="endTime"
                  value={formatTimeForInput(newEvent.end as Date)}
                  onChange={handleEventChange}
                  className="w-full p-2 border rounded"
                  disabled={loading}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Color</label>
                <select
                  name="color"
                  value={newEvent.color}
                  onChange={handleEventChange}
                  className="w-full p-2 border rounded"
                  disabled={loading}
                >
                  <option value="#3b82f6">Blue</option>
                  <option value="#ef4444">Red</option>
                  <option value="#10b981">Green</option>
                  <option value="#f59e0b">Yellow</option>
                  <option value="#8b5cf6">Purple</option>
                </select>
              </div>
            </div>
            
            <div className="pt-4 border-t mt-4">
              <div className="flex justify-between">
                {newEvent.id && (
                  <button
                    onClick={() => handleDeleteEvent(newEvent.id as string)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                    disabled={loading}
                  >
                    Delete
                  </button>
                )}
                <div className="flex gap-2 ml-auto">
                  <button
                    onClick={() => setShowEventDrawer(false)}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEvent}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 