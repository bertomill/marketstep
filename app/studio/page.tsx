'use client'

import { useState, useEffect, useRef } from 'react'
import { Sidebar } from '../components/Sidebar'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { Loader2, FileText, MessageSquare, Calendar, Save, Plus, Menu } from 'lucide-react'
import { getEvents, Event } from '../calendar/calendarService'
import { getChatResponse, ChatMessage, generateContent } from './studioService'
import { v4 as uuidv4 } from 'uuid'
import { Card } from '@/components/ui/card'
import { MagicCard } from '@/components/magicui/magic-card'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function StudioPage() {
  // Authentication and routing
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // Mount effect to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Determine the current theme safely
  const currentTheme = mounted ? (theme === 'system' ? systemTheme : theme) : 'light'
  const gradientColor = currentTheme === 'dark' ? "#262626" : "#D9D9D955"
  
  // Document state
  const [documentTitle, setDocumentTitle] = useState('Untitled Document')
  const [documentContent, setDocumentContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [documentType, setDocumentType] = useState<'competitor-analysis' | 'market-research' | 'earnings-summary' | 'company-profile' | 'industry-report'>('company-profile')
  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [showSidebar, setShowSidebar] = useState(true)
  
  // Chat drawer state
  const [showChatDrawer, setShowChatDrawer] = useState(true)
  const [chatInput, setChatInput] = useState('')
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [processingChat, setProcessingChat] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  
  // Calendar events integration
  const [showEventsDrawer, setShowEventsDrawer] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([])
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])
  
  // Fetch events when component mounts
  useEffect(() => {
    if (!user) return;
    
    const fetchEvents = async () => {
      setLoadingEvents(true)
      try {
        const userEvents = await getEvents(user.uid)
        setEvents(userEvents)
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        setLoadingEvents(false)
      }
    }
    
    fetchEvents()
  }, [user])
  
  // Scroll to bottom of chat when new messages are added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])
  
  // Handle chat input submission
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!chatInput.trim() || processingChat) return
    
    // Add user message to chat history
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    }
    
    setChatHistory(prev => [...prev, userMessage])
    setChatInput('')
    setProcessingChat(true)
    
    try {
      // Get AI response
      const aiResponse = await getChatResponse(
        chatHistory, 
        chatInput, 
        documentContent
      )
      
      // Add AI response to chat history
      const aiMessage: ChatMessage = {
        id: uuidv4(),
        role: 'ai',
        content: aiResponse,
        timestamp: new Date()
      }
      
      setChatHistory(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error getting chat response:', error)
      
      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: 'ai',
        content: 'Sorry, I encountered an error processing your message.',
        timestamp: new Date()
      }
      
      setChatHistory(prev => [...prev, errorMessage])
    } finally {
      setProcessingChat(false)
    }
  }
  
  // Generate content from selected events
  const generateFromEvents = async () => {
    if (selectedEvents.length === 0) {
      alert('Please select at least one event')
      return
    }
    
    setIsSaving(true)
    setShowEventsDrawer(false)
    
    try {
      const prompt = `Generate a detailed document based on the selected events. Include relevant information from each event.`
      const generatedContent = await generateContent(prompt, selectedEvents)
      
      // Update document content
      setDocumentContent(generatedContent)
      
      // Also add an AI message to chat history explaining what was done
      const aiMessage: ChatMessage = {
        id: uuidv4(),
        role: 'ai',
        content: `I've generated content based on the ${selectedEvents.length} events you selected. You can now edit this document and continue to chat with me for further assistance.`,
        timestamp: new Date()
      }
      
      setChatHistory(prev => [...prev, aiMessage])
      
      // Auto-open chat drawer after generation
      setShowChatDrawer(true)
    } catch (error) {
      console.error('Error generating content:', error)
      alert('Failed to generate content. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }
  
  // Toggle selection of an event
  const toggleEventSelection = (event: Event) => {
    if (selectedEvents.some(e => e.id === event.id)) {
      setSelectedEvents(selectedEvents.filter(e => e.id !== event.id))
    } else {
      setSelectedEvents([...selectedEvents, event])
    }
  }

  // Mock save function (would save to Firebase in a real implementation)
  const saveDocument = async () => {
    setIsSaving(true)
    
    // Simulate saving with a delay
    setTimeout(() => {
      setIsSaving(false)
      alert('Document saved successfully!')
    }, 1000)
  }
  
  // If loading auth state, show loading spinner
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

  return (
    <div className="flex min-h-screen">
      {/* Sidebar with responsive visibility */}
      <div className={`fixed md:relative z-40 transition-transform duration-300 ease-in-out ${
        showSidebar ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar />
      </div>
      
      <main className={`flex-1 flex flex-col h-screen transition-all duration-300 ease-in-out ${
        showSidebar ? 'md:ml-64' : 'md:ml-0'
      }`}>
        {/* Top toolbar */}
        <div className="border-b p-4 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="flex flex-col space-y-4 md:space-y-2">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold">Content Studio</h1>
              <input
                type="text"
                value={documentTitle}
                onChange={e => setDocumentTitle(e.target.value)}
                className="border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-2 py-1 font-medium text-lg"
                placeholder="Document Title"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="text-sm border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-2 py-1 flex-1 min-w-[200px]"
                placeholder="Company Name"
              />
              <input
                type="text"
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                className="text-sm border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-2 py-1 flex-1 min-w-[200px]"
                placeholder="Industry"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as 'competitor-analysis' | 'market-research' | 'earnings-summary' | 'company-profile' | 'industry-report')}
              className="text-sm border rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[150px]"
            >
              <option value="company-profile">Company Profile</option>
              <option value="competitor-analysis">Competitor Analysis</option>
              <option value="market-research">Market Research</option>
              <option value="earnings-summary">Earnings Summary</option>
              <option value="industry-report">Industry Report</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEventsDrawer(true)}
            >
              <Calendar className="h-4 w-4" />
              Research Events
            </Button>
            
            <Button
              variant={showChatDrawer ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowChatDrawer(!showChatDrawer)}
            >
              <MessageSquare className="h-4 w-4" />
              Research Assistant
            </Button>
            
            <Button
              variant="default"
              size="sm"
              onClick={saveDocument}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Research
            </Button>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Document editor */}
          <div className="grow overflow-y-auto p-4 md:p-8 bg-white">
            <div className="mb-4 flex flex-wrap gap-2">
              {tags.map(tag => (
                <span key={tag} className="px-2 py-1 text-xs bg-gray-100 rounded-full">
                  {tag}
                  <button
                    onClick={() => setTags(tags.filter(t => t !== tag))}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder="Add research tags..."
                className="text-sm border-none focus:outline-none"
                onKeyDown={e => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    setTags([...tags, e.currentTarget.value])
                    e.currentTarget.value = ''
                  }
                }}
              />
            </div>
            <textarea
              value={documentContent}
              onChange={e => setDocumentContent(e.target.value)}
              className="w-full h-full min-h-[600px] p-4 text-lg border-none focus:outline-none resize-none"
              placeholder={`Start your ${documentType.replace('-', ' ')} here, or use the 'Research Events' button to generate content from your calendar events...`}
            />
          </div>
          
          {/* Research Assistant drawer */}
          <div 
            className={`shrink-0 border-l bg-white transition-all duration-300 ease-in-out flex flex-col ${
              showChatDrawer 
                ? 'relative w-96 translate-x-0' 
                : 'absolute right-0 w-0 translate-x-full'
            }`}
          >
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-medium">Research Assistant</h3>
              <button onClick={() => setShowChatDrawer(false)} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="h-full p-4">
                {chatHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                    <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                    <p className="mb-1">No research queries yet</p>
                    <p className="text-sm">Ask the Research Assistant to help analyze companies, markets, or industry trends</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatHistory.map(message => (
                      <div
                        key={message.id}
                        className={`p-3 rounded-lg ${
                          message.role === 'user'
                            ? 'ml-auto bg-blue-500 text-white max-w-[85%]'
                            : 'bg-gray-100 text-gray-800 max-w-[90%]'
                        }`}
                      >
                        {message.role === 'user' ? (
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        ) : (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                // Override heading styles
                                h1: (props) => <h1 className="text-lg font-bold mt-3 mb-2" {...props}/>,
                                h2: (props) => <h2 className="text-base font-bold mt-2 mb-1" {...props}/>,
                                h3: (props) => <h3 className="text-sm font-bold mt-2 mb-1" {...props}/>,
                                // Style links
                                a: (props) => <a className="text-blue-600 hover:underline" {...props}/>,
                                // Style lists
                                ul: (props) => <ul className="list-disc pl-4 my-2" {...props}/>,
                                ol: (props) => <ol className="list-decimal pl-4 my-2" {...props}/>,
                                // Style code blocks
                                code: ({inline, ...props}: {inline?: boolean} & React.HTMLProps<HTMLElement>) => 
                                  inline ? (
                                    <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm" {...props}/>
                                  ) : (
                                    <code className="block bg-gray-200 dark:bg-gray-700 p-2 rounded text-sm my-2 overflow-x-auto" {...props}/>
                                  ),
                                // Style blockquotes
                                blockquote: (props) => (
                                  <blockquote className="border-l-4 border-gray-300 pl-4 my-2 italic" {...props}/>
                                ),
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        )}
                        <p className="text-xs mt-1 opacity-70">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                )}
              </div>
            </div>
            
            <form onSubmit={handleChatSubmit} className="p-4 border-t mt-auto">
              <div className="flex">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Ask about company analysis, market trends, or research methods..."
                  className="flex-1 border rounded-l-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  disabled={processingChat}
                />
                <button
                  type="submit"
                  disabled={processingChat || !chatInput.trim()}
                  className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 disabled:opacity-50"
                >
                  {processingChat ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      
      {/* Events selection drawer */}
      <div
        className={`fixed inset-0 z-30 ${showEventsDrawer ? 'block' : 'hidden'}`}
      >
        <div
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={() => setShowEventsDrawer(false)}
        />
        <div className="absolute right-0 top-0 h-full w-1/3 bg-white shadow-lg overflow-y-auto">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-medium">Select Events</h3>
            <button
              onClick={() => setShowEventsDrawer(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-4">
              Select events from your calendar to include in your document.
            </p>
            
            {loadingEvents ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No calendar events found</p>
                <p className="text-sm mt-1">Add events to your calendar first</p>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map(event => (
                  <Card key={event.id} className="overflow-hidden">
                    {mounted && (
                      <MagicCard gradientColor={gradientColor}>
                        <div
                          className={`p-3 cursor-pointer transition-colors ${
                            selectedEvents.some(e => e.id === event.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => toggleEventSelection(event)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-sm">
                                {/* Handle summary title format */}
                                {event.title.includes('::SUMMARY::')
                                  ? event.title.split('::SUMMARY::')[0]
                                  : event.title}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(event.start).toLocaleDateString()}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <div className="flex-shrink-0 h-4 w-4 rounded-full" style={{ backgroundColor: event.color }} />
                              {selectedEvents.some(e => e.id === event.id) && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </div>
                          
                          {/* Show if this is an event with notes or summary content */}
                          {(event.metadata?.notes || event.title.includes('::SUMMARY::')) && (
                            <div className="mt-2 text-xs text-gray-600">
                              <div className="flex items-center">
                                <FileText className="h-3 w-3 mr-1" />
                                {event.title.includes('::SUMMARY::') ? 'Contains summary' : 'Has notes'}
                              </div>
                            </div>
                          )}
                        </div>
                      </MagicCard>
                    )}
                  </Card>
                ))}
              </div>
            )}
            
            <div className="mt-6 flex justify-between">
              <div>
                {selectedEvents.length > 0 && (
                  <span className="text-sm text-gray-600">
                    {selectedEvents.length} events selected
                  </span>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowEventsDrawer(false)}
                  className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                
                <button
                  onClick={generateFromEvents}
                  disabled={selectedEvents.length === 0 || isSaving}
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Generate Content
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 