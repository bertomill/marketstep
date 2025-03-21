'use client'

import { Sidebar } from '../components/Sidebar'
import { useState, ReactNode, useEffect } from 'react'
import { Event, getEvents, addEvent, updateEvent, deleteEvent } from './calendarService'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { Loader2, Info, FileText, ArrowLeft, Link as LinkIcon, ExternalLink } from 'lucide-react'
import { getUserFollowedCompanies } from '@/lib/userService'
import { 
  getFollowedCompaniesEarnings, 
  convertEarningsToCalendarEvents,
  formatEarningsHour,
  formatRevenue,
  EarningsEvent,
  fetchEarningsTranscript,
  EarningsTranscript
} from './finnhubService'
import { summarizeTranscript } from './aiService'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, formatISO } from 'date-fns'

// Extended Event type to include earnings data
type ExtendedEvent = Event & {
  isEarningsEvent?: boolean;
  earningsData?: EarningsEvent;
  isSummaryNote?: boolean;
  createdAt?: Date | string; // Add createdAt to ExtendedEvent
};

export default function CalendarPage() {
  // Authentication check
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  // State for current date and view type
  const [date, setDate] = useState(new Date())
  const [viewType, setViewType] = useState('month') // 'day', 'week', or 'month'
  const [events, setEvents] = useState<ExtendedEvent[]>([])
  const [showEventDrawer, setShowEventDrawer] = useState(false)
  const [showEarningsDetails, setShowEarningsDetails] = useState<string | null>(null)
  const [isShowingEarningsInDrawer, setIsShowingEarningsInDrawer] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingEarnings, setLoadingEarnings] = useState(false)
  const [newEvent, setNewEvent] = useState<Partial<Event & { 
    summaryContent?: string, 
    eventUrl?: string,
    notes?: string 
  }>>({
    title: '',
    start: new Date(),
    end: new Date(),
    color: '#3b82f6', // Default blue color
    eventUrl: '',
    notes: ''
  })
  const [transcriptData, setTranscriptData] = useState<EarningsTranscript | null>(null)
  const [loadingTranscript, setLoadingTranscript] = useState(false)
  const [showingTranscript, setShowingTranscript] = useState(false)
  const [summaryData, setSummaryData] = useState<string | null>(null)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [savingNote, setSavingNote] = useState(false)
  const [extractSuccess, setExtractSuccess] = useState<string | null>(null)
  const [sortOption, setSortOption] = useState<'date' | 'created'>('date') // Add sort option

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

  // Fetch earnings events when the date changes
  useEffect(() => {
    if (!user) return;

    const fetchEarningsEvents = async () => {
      setLoadingEarnings(true)
      try {
        // Get the user's followed companies
        const followedCompanies = await getUserFollowedCompanies(user.uid)
        
        if (followedCompanies.length === 0) {
          setLoadingEarnings(false)
          return;
        }
        
        // Calculate date range (current month +/- 1 month)
        const start = startOfMonth(subMonths(date, 1))
        const end = endOfMonth(addMonths(date, 1))
        
        // Format dates for API
        const fromDate = formatISO(start, { representation: 'date' })
        const toDate = formatISO(end, { representation: 'date' })
        
        // Fetch earnings events
        const earningsEvents = await getFollowedCompaniesEarnings(
          followedCompanies,
          fromDate,
          toDate
        )
        
        // Convert to calendar events
        const earningsCalendarEvents = convertEarningsToCalendarEvents(earningsEvents)
        
        // Add userId to each earnings event to match Event type requirements
        const typedEarningsEvents: ExtendedEvent[] = earningsCalendarEvents.map(event => ({
          ...event,
          userId: user.uid
        }))
        
        // Merge with user events, replacing any existing earnings events
        setEvents(prevEvents => {
          // Filter out old earnings events
          const userEvents = prevEvents.filter(event => !event.isEarningsEvent)
          // Add new earnings events
          return [...userEvents, ...typedEarningsEvents]
        })
      } catch (error) {
        console.error('Error fetching earnings events:', error)
      } finally {
        setLoadingEarnings(false)
      }
    }
    
    fetchEarningsEvents()
  }, [user, date])

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
      color: '#3b82f6',
      eventUrl: '',
      notes: ''
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
      alert('End date must be after start date')
      return
    }
    
    setLoading(true)
    
    try {
      // Check if this is a summary note
      const isSummaryNote = newEvent.color === '#10b981' && newEvent.title.includes('Earnings Summary');
      let finalTitle = newEvent.title;
      
      // If this is a summary note, store the content in a special format
      if (isSummaryNote && newEvent.summaryContent) {
        // Store a marker in the title to identify this as a summary note
        finalTitle = `${newEvent.title}::SUMMARY::${newEvent.summaryContent}`;
      }
      
      // Store notes data
      const eventMetadata = {
        notes: newEvent.notes || ''
      };
      
      // If editing an existing event, update it
      if (newEvent.id) {
        const updatedEvent = {
          ...newEvent as Event,
          title: finalTitle,
          userId: user?.uid,
          metadata: eventMetadata
        }
        const success = await updateEvent(updatedEvent)
        if (success) {
          setEvents(events.map(event => 
            event.id === newEvent.id ? {...updatedEvent, isSummaryNote} : event
          ))
        }
      } else {
        // Otherwise add a new event
        const savedEvent = await addEvent({
          title: finalTitle,
          start: newEvent.start!,
          end: newEvent.end!,
          color: newEvent.color as string,
          eventUrl: newEvent.eventUrl,
          metadata: eventMetadata,
          userId: user!.uid // Assert user is not null
        }, user!.uid);
        
        if (savedEvent) {
          setEvents([...events, isSummaryNote ? {...savedEvent, isSummaryNote} : savedEvent])
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

  // Edit function used through event handlers - keep but mark with eslint disable
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const editEvent = (event: Event) => {
    // Extract notes from metadata if available
    const notes = event.metadata?.notes || '';
    
    setNewEvent({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
      notes: notes
    })
    setShowEventDrawer(true)
  }

  // Toggle function used by the UI - keep but mark with eslint disable
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const toggleEarningsDetails = (eventId: string | null) => {
    if (eventId) {
      setShowEarningsDetails(eventId)
      setIsShowingEarningsInDrawer(true)
      setShowEventDrawer(true)
      setShowingTranscript(false) // Reset transcript view when showing earnings details
      setTranscriptData(null) // Clear any previous transcript data
    } else {
      setShowEarningsDetails(null)
      setIsShowingEarningsInDrawer(false)
      setShowEventDrawer(false)
      setShowingTranscript(false)
    }
  }

  // Function to fetch and display the transcript
  const viewEarningsTranscript = async (ticker: string, year: number, quarter: number) => {
    setLoadingTranscript(true)
    setSummaryData(null) // Reset summary when loading a new transcript
    try {
      const transcript = await fetchEarningsTranscript(ticker, year, quarter)
      setTranscriptData(transcript)
      setShowingTranscript(true)
    } catch (error) {
      console.error('Error fetching transcript:', error)
      alert('Failed to load transcript. Please try again.')
    } finally {
      setLoadingTranscript(false)
    }
  }
  
  // Function to generate a summary of the transcript
  const generateTranscriptSummary = async () => {
    if (!transcriptData) return
    
    setLoadingSummary(true)
    try {
      // Combine all transcript sections into a single text
      const fullText = transcriptData.transcript_split.map(section => 
        `${section.speaker}: ${section.text}`
      ).join('\n\n');
      
      // Call the Gemini API through our service
      const result = await summarizeTranscript(fullText);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setSummaryData(result.summary);
    } catch (error) {
      console.error('Error generating summary:', error);
      alert('Failed to generate summary. Please try again.');
    } finally {
      setLoadingSummary(false);
    }
  }
  
  // Function to go back from transcript view to earnings details
  const backToEarningsDetails = () => {
    setShowingTranscript(false)
    setSummaryData(null) // Clear summary when navigating away
  }

  // Helper function to check if a date has events
  const getEventsForDate = (date: Date) => {
    const dateString = date.toDateString()
    // Apply the selected sort option
    const sortedEvents = [...events].sort((a, b) => {
      if (sortOption === 'created' && a.createdAt && b.createdAt) {
        // Sort by creation date, newest first
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      // Default: sort by event date (as is)
      return 0;
    });
    
    return sortedEvents.filter(event => {
      const eventDate = new Date(event.start)
      return eventDate.toDateString() === dateString
    })
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

  // Format time input field helper - keep but mark with eslint disable
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formatTimeForInput = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }

  // Update the renderEvent function to handle earnings events and summary notes
  const renderEvent = (event: ExtendedEvent) => {
    // Special handling for earnings events
    if (event.isEarningsEvent) {
      return (
        <div 
          key={event.id}
          onClick={(e) => {
            e.stopPropagation()
            setShowEarningsDetails(event.id)
            setIsShowingEarningsInDrawer(true)
            setShowEventDrawer(true)
          }}
          className={`p-1 text-xs rounded mb-1 cursor-pointer`}
          style={{ backgroundColor: event.color }}
        >
          <div className="font-medium text-white">{event.title}</div>
        </div>
      )
    }
    
    // Special handling for summary notes
    if (event.isSummaryNote) {
      const parts = event.title.split('::SUMMARY::')
      const title = parts[0]
      
      return (
        <div 
          key={event.id}
          onClick={(e) => {
            e.stopPropagation()
            setNewEvent({
              ...event,
              title: title, // Strip the summary marker from display
              summaryContent: parts[1] || ''
            })
            setShowEventDrawer(true)
          }}
          className="p-1 text-xs bg-green-500 text-white rounded mb-1 cursor-pointer"
        >
          <div className="font-medium">{title}</div>
        </div>
      )
    }
    
    // Regular events
    return (
      <div 
        key={event.id}
        onClick={(e) => {
          e.stopPropagation()
          setNewEvent(event)
          setShowEventDrawer(true)
        }}
        className="p-1 text-xs rounded mb-1 cursor-pointer"
        style={{ backgroundColor: event.color }}
      >
        <div className="font-medium text-white truncate">{event.title}</div>
        {event.eventUrl && (
          <div className="flex items-center text-white text-opacity-80 mt-0.5">
            <LinkIcon className="h-3 w-3 mr-1" />
            <span className="truncate">Has link</span>
          </div>
        )}
      </div>
    )
  }

  // Edit summary note function - keep but mark with eslint disable
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const editSummaryNote = (event: ExtendedEvent) => {
    // Extract the title and summary content
    let title = event.title;
    let summaryContent = '';
    
    // Check if the title contains the special summary marker
    if (event.title.includes('::SUMMARY::')) {
      const parts = event.title.split('::SUMMARY::');
      title = parts[0];
      summaryContent = parts[1] || '';
    }
    
    setNewEvent({
      ...event,
      title: title, // Just keep the main title part
      summaryContent: summaryContent,
      start: new Date(event.start),
      end: new Date(event.end)
    });
    
    setShowEventDrawer(true);
    setIsShowingEarningsInDrawer(false);
    setShowingTranscript(false);
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
            {dayEvents.slice(0, 3).map(event => 
              renderEvent(event as ExtendedEvent)
            )}
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
            {dayEvents.map(event => 
              renderEvent(event as ExtendedEvent)
            )}
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
            {eventsByHour[hour]?.map(event => 
              renderEvent(event as ExtendedEvent)
            )}
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

  // Render the appropriate calendar view based on viewType
  const renderCalendarView = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    }
    
    return (
      <div>
        <div className="mb-4 flex justify-end">
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
        
        {viewType === 'month' && renderMonthView()}
        {viewType === 'week' && renderWeekView()}
        {viewType === 'day' && renderDayView()}
      </div>
    )
  }

  // Function to save the summary as a calendar note
  const saveSummaryAsNote = async () => {
    if (!transcriptData || !summaryData || !showEarningsDetails || !user) return;
    
    setSavingNote(true);
    try {
      // Find the original earnings event
      const earningsEvent = events.find(e => e.id === showEarningsDetails);
      if (!earningsEvent || !earningsEvent.earningsData) {
        throw new Error('Could not find earnings event data');
      }
      
      // Create a date for the note based on the earnings event date
      const eventDate = new Date(earningsEvent.start);
      const endDate = new Date(eventDate);
      endDate.setHours(endDate.getHours() + 1); // Add 1 hour for the event duration
      
      // Format the note title with the earnings information and include the summary content
      const noteTitle = `${earningsEvent.earningsData.companyName || earningsEvent.earningsData.symbol} Earnings Summary`;
      const finalTitle = `${noteTitle}::SUMMARY::${summaryData}`;
      
      // Make sure we have a valid user ID
      const userId = user.uid;
      
      // Save the note as a calendar event with required userId
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const savedEvent = await addEvent({
        title: finalTitle,
        start: eventDate,
        end: endDate,
        color: '#10b981', // Green color for notes
        userId: userId // Add the required userId field
      }, userId);
      
      if (savedEvent) {
        // Add the full saved event to the events list
        const fullEvent: ExtendedEvent = {
          ...savedEvent,
          isSummaryNote: true
        };
        setEvents(prev => [...prev, fullEvent]);
        alert('Summary saved as a calendar note!');
      }
    } catch (error) {
      console.error('Error saving summary as note:', error);
      alert('Failed to save summary as note. Please try again.');
    } finally {
      setSavingNote(false);
    }
  };

  const extractContentFromUrl = async () => {
    if (!newEvent.eventUrl) {
      alert('Please enter a URL to extract content from')
      return
    }
    
    try {
      setLoading(true)
      setExtractSuccess(null) // Reset success message
      // Call the API endpoint for content extraction
      const response = await fetch('/api/extract-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: newEvent.eventUrl }),
      })
      
      const data = await response.json()
      
      // Check if there was an error but we got fallback content
      if (data.error && data.pageContent) {
        setNewEvent({
          ...newEvent,
          title: data.title || newEvent.title,
          summaryContent: data.pageContent
        });
        
        setExtractSuccess('Extraction partially succeeded with limited content. You may want to edit it.')
        return
      }
      
      // If response was not ok and we don't have fallback content, show error
      if (!response.ok && !data.pageContent) {
        throw new Error(data.error || `Failed to extract content: ${response.status}`)
      }
      
      // Update the event title with extracted information if available
      if (data.title) {
        setNewEvent({
          ...newEvent,
          title: data.title
        })
      }
      
      // Display content or YouTube transcript if available
      if (data.isYouTube && data.transcriptText) {
        setNewEvent({
          ...newEvent,
          title: data.title || newEvent.title,
          summaryContent: data.transcriptText
        });
        
        // Show a success message
        setExtractSuccess('YouTube transcript extracted successfully!')
      } else if (data.pageContent) {
        // Handle regular webpage content
        setNewEvent({
          ...newEvent,
          title: data.title || newEvent.title,
          summaryContent: data.pageContent
        });
        
        setExtractSuccess('Page content extracted successfully!')
      } else {
        setExtractSuccess('Title extracted, but no content found')
      }
      
    } catch (error) {
      console.error('Error extracting content:', error)
      
      // Try to extract the domain from the URL to provide a more helpful message
      let domain = ''
      try {
        domain = new URL(newEvent.eventUrl).hostname
      } catch {
        // No parameter needed as we don't use the error
        domain = newEvent.eventUrl
      }
      
      setExtractSuccess(`Could not extract content from ${domain}. You can enter content manually below.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-64 min-h-screen w-full p-6">
        <div className="max-w-6xl mx-auto">
          <header className="mb-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Calendar</h1>
              <div className="flex items-center space-x-2">
                {loadingEarnings && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading earnings...
                  </div>
                )}
                <button
                  onClick={goToToday}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  Today
                </button>
                <button
                  onClick={goToPreviousMonth}
                  className="p-1 border border-gray-300 rounded-md"
                >
                  &lt;
                </button>
                <button
                  onClick={goToNextMonth}
                  className="p-1 border border-gray-300 rounded-md"
                >
                  &gt;
                </button>
                <h2 className="text-xl font-semibold ml-2">
                  {format(date, 'MMMM yyyy')}
                </h2>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm">Before Market</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-sm">After Market</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-sm">During Market</span>
                </div>
                <div className="flex items-center space-x-1 ml-4">
                  <Info className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Click on an earnings event for details</span>
                </div>
              </div>
              
              {/* Sort options */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select 
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as 'date' | 'created')}
                  className="text-sm border rounded p-1"
                >
                  <option value="date">Date (chronological)</option>
                  <option value="created">Created (newest first)</option>
                </select>
              </div>
            </div>
          </header>

          {/* Calendar view */}
          {renderCalendarView()}
        </div>
        
        {/* Event Side Drawer */}
        <div 
          className={`fixed top-0 right-0 h-full bg-white shadow-lg w-96 border-l border-gray-200 z-50 transition-transform duration-300 ease-in-out ${
            showEventDrawer ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">
                {showingTranscript ? 'Earnings Transcript' : 
                 isShowingEarningsInDrawer ? 'Earnings Details' : 
                 newEvent.id ? 'Edit Event' : 'Add Event'}
              </h3>
              <button 
                onClick={() => {
                  setShowEventDrawer(false)
                  setIsShowingEarningsInDrawer(false)
                  setShowEarningsDetails(null)
                  setShowingTranscript(false)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {showingTranscript ? (
                // Transcript view
                <div className="space-y-4">
                  {loadingTranscript ? (
                    <div className="flex justify-center items-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : transcriptData ? (
                    <div>
                      <button 
                        onClick={backToEarningsDetails}
                        className="flex items-center text-blue-600 mb-4"
                      >
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back to details
                      </button>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Earnings Call Date</p>
                        <p className="font-medium">{transcriptData.date}</p>
                      </div>
                      
                      {/* Summary button and result */}
                      <div className="mb-6">
                        {!summaryData && !loadingSummary ? (
                          <button
                            onClick={generateTranscriptSummary}
                            className="w-full flex items-center justify-center py-2 px-4 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                          >
                            <Info className="h-4 w-4 mr-2" />
                            Summarize for me
                          </button>
                        ) : loadingSummary ? (
                          <div className="w-full py-4 bg-gray-50 rounded flex items-center justify-center">
                            <Loader2 className="h-5 w-5 animate-spin text-gray-500 mr-2" />
                            <span className="text-gray-500">Generating summary...</span>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="bg-green-50 p-4 rounded border border-green-100 mb-4">
                              <h4 className="font-medium text-green-700 mb-2">Summary</h4>
                              <p className="text-sm text-gray-700">{summaryData}</p>
                            </div>
                            
                            <button
                              onClick={saveSummaryAsNote}
                              disabled={savingNote}
                              className="w-full flex items-center justify-center py-2 px-4 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors disabled:opacity-50"
                            >
                              {savingNote ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <FileText className="h-4 w-4 mr-2" />
                                  Save as Calendar Note
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-6">
                        {transcriptData.transcript_split.slice(0, 10).map((section, index) => (
                          <div key={index} className="pb-4 border-b border-gray-100">
                            <p className="font-semibold mb-1">{section.speaker}</p>
                            <p className="text-sm text-gray-700">{section.text}</p>
                          </div>
                        ))}
                        
                        {transcriptData.transcript_split.length > 10 && (
                          <p className="text-center text-gray-500 text-sm">
                            {transcriptData.transcript_split.length - 10} more sections (scroll to see full transcript)
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      Transcript not available
                    </div>
                  )}
                </div>
              ) : isShowingEarningsInDrawer ? (
                // Earnings event details view
                (() => {
                  const event = events.find(e => e.id === showEarningsDetails);
                  if (!event || !event.earningsData) return <div>No earnings data found</div>;
                  
                  const earnings = event.earningsData;
                  
                  return (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Company</p>
                        <p className="font-medium">{earnings.companyName || earnings.symbol}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium">{earnings.date} ({formatEarningsHour(earnings.hour)})</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">EPS Estimate</p>
                          <p className="font-medium">{earnings.epsEstimate !== null ? `$${earnings.epsEstimate.toFixed(2)}` : 'N/A'}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">EPS Actual</p>
                          <p className="font-medium">{earnings.epsActual !== null ? `$${earnings.epsActual.toFixed(2)}` : 'N/A'}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Revenue Estimate</p>
                          <p className="font-medium">{formatRevenue(earnings.revenueEstimate)}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Revenue Actual</p>
                          <p className="font-medium">{formatRevenue(earnings.revenueActual)}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Quarter</p>
                        <p className="font-medium">Q{earnings.quarter} {earnings.year}</p>
                      </div>
                      
                      <button
                        onClick={() => viewEarningsTranscript(earnings.symbol, earnings.year, earnings.quarter)}
                        className="w-full mt-4 flex items-center justify-center py-2 px-4 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Earnings Call Transcript
                      </button>
                    </div>
                  );
                })()
              ) : (
                // Regular event edit view or Summary Note view
                <>
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
                  
                  {/* Display creation timestamp if available */}
                  {newEvent.id && newEvent.createdAt && (
                    <div className="mb-4 text-xs text-gray-500">
                      Created: {new Date(newEvent.createdAt).toLocaleString()}
                    </div>
                  )}
                  
                  {/* Summary content field for summary notes or transcripts */}
                  {(newEvent.summaryContent || (newEvent.color === '#10b981' && newEvent.title?.includes('Earnings Summary')) || newEvent.eventUrl) && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">
                        {newEvent.eventUrl?.includes('youtube.com') ? 'Video Transcript' : 
                         newEvent.summaryContent ? 'Content from URL' : 'Content'}
                      </label>
                      <textarea
                        name="summaryContent"
                        value={newEvent.summaryContent || ''}
                        onChange={(e) => setNewEvent({...newEvent, summaryContent: e.target.value})}
                        className="w-full p-2 border rounded h-40 resize-none"
                        placeholder={newEvent.eventUrl?.includes('youtube.com') 
                          ? "Click Extract to get the video transcript or enter manually" 
                          : newEvent.eventUrl 
                            ? "Click Extract to get the page content or enter manually" 
                            : "Enter content"}
                        disabled={loading}
                      />
                    </div>
                  )}
                  
                  {/* Notes field for user's own notes */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Notes
                      {newEvent.summaryContent && (
                        <span className="text-xs text-gray-500 ml-2">
                          (Your personal notes about the content)
                        </span>
                      )}
                    </label>
                    <textarea
                      name="notes"
                      value={newEvent.notes || ''}
                      onChange={(e) => setNewEvent({...newEvent, notes: e.target.value})}
                      className="w-full p-2 border rounded h-32 resize-none"
                      placeholder="Add your personal notes here..."
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
                    <label className="block text-sm font-medium mb-1">Event URL</label>
                    <div className="flex space-x-2">
                      <input
                        type="url"
                        name="eventUrl"
                        value={newEvent.eventUrl || ''}
                        onChange={(e) => setNewEvent({...newEvent, eventUrl: e.target.value})}
                        className="flex-1 p-2 border rounded"
                        placeholder="https://example.com/event"
                        disabled={loading}
                      />
                      <button
                        onClick={extractContentFromUrl}
                        className="px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors disabled:opacity-50 flex items-center"
                        disabled={loading || !newEvent.eventUrl}
                        title="Extract content from URL"
                      >
                        {loading ? (
                          <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading...</>
                        ) : (
                          <><ExternalLink className="h-5 w-5 mr-2" /> Extract</>
                        )}
                      </button>
                    </div>
                    
                    {extractSuccess && (
                      <div className="mt-2 p-2 bg-green-50 text-green-700 text-sm rounded border border-green-100">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {extractSuccess}
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-1">
                      Enter a URL and click the Extract button to automatically get content, or add content manually below
                    </p>
                    {newEvent.eventUrl && (
                      <a 
                        href={newEvent.eventUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs text-blue-600 flex items-center mt-1 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Open link
                      </a>
                    )}
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
                </>
              )}
            </div>
            
            <div className="pt-4 border-t mt-4">
              <div className="flex justify-between">
                {isShowingEarningsInDrawer || showingTranscript ? (
                  <button
                    onClick={() => {
                      setShowEventDrawer(false)
                      setIsShowingEarningsInDrawer(false)
                      setShowEarningsDetails(null)
                      setShowingTranscript(false)
                    }}
                    className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Close
                  </button>
                ) : (
                  <>
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
                        onClick={() => {
                          // For summary notes, include the summary content in the title
                          if (newEvent.color === '#10b981' && newEvent.title?.includes('Earnings Summary') && newEvent.summaryContent) {
                            const updatedEvent = {
                              ...newEvent,
                              title: newEvent.title
                            };
                            setNewEvent(updatedEvent);
                          }
                          saveEvent();
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 