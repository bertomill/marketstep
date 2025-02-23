'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/lib/context/UserContext';
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Headphones, Play, MessageSquare, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ChatInterface } from "@/components/chat/ChatInterface";

interface Event {
  id: string;
  company: string;
  symbol: string;
  type: 'filing' | 'report' | 'transcript' | 'audio' | 'presentation';
  date: string;
  title: string;
  description?: string;
  form?: string;  // For SEC filings
  url?: string;
  quarter?: string;
  year?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ActivityFeed() {
  const { userProfile } = useUser();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!userProfile?.followedCompanies?.length) {
        setEvents([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Get tickers of followed companies
        const symbols = userProfile.followedCompanies.map(c => c.ticker).join(',');

        // Fetch SEC filings
        const secResponse = await fetch(`/api/sec?symbols=${symbols}`);
        if (!secResponse.ok) {
          throw new Error('Failed to fetch SEC filings');
        }
        const secData = await secResponse.json();

        // Fetch other company events (earnings, etc.)
        const eventsResponse = await fetch(`/api/events?symbols=${symbols}`);
        if (!eventsResponse.ok) {
          throw new Error('Failed to fetch company events');
        }
        const eventsData = await eventsResponse.json();

        // Combine and sort all events by date
        const allEvents = [...(Array.isArray(secData) ? secData : []), ...eventsData]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setEvents(allEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError(error instanceof Error ? error.message : 'Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [userProfile?.followedCompanies]);

  const getEventIcon = (type: Event['type']) => {
    switch (type) {
      case 'filing':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'report':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'transcript':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case 'audio':
        return <Headphones className="h-4 w-4 text-orange-500" />;
      case 'presentation':
        return <Play className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleEventSelect = async (event: Event) => {
    setSelectedEvent(event);
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          userContext: {
            interests: userProfile?.currentProjects,
            industry: userProfile?.industry,
            jobTitle: userProfile?.jobTitle
          }
        })
      });

      const data = await response.json();
      setMessages([{
        role: 'assistant',
        content: data.analysis
      }]);
    } catch (error) {
      console.error('Error analyzing event:', error);
      setMessages([{
        role: 'assistant',
        content: 'Sorry, I encountered an error analyzing this document.'
      }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Activity Feed</h2>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Activity Feed</h2>
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!userProfile?.followedCompanies?.length) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Activity Feed</h2>
          <p className="text-sm text-muted-foreground">No companies followed</p>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          Follow companies to see their latest filings and events
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Activity Feed</h2>
          <p className="text-sm text-muted-foreground">
            Latest updates from your followed companies
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ScrollArea className="h-[600px]">
          <div className="space-y-6">
            {Object.entries(groupEventsByDate(events)).map(([date, dayEvents]) => (
              <div key={date} className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground sticky top-0 bg-background py-2">
                  {formatDate(date)}
                </h3>
                <div className="space-y-2">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`flex items-start space-x-4 p-3 rounded-lg border transition-colors cursor-pointer ${
                        selectedEvent?.id === event.id 
                          ? 'bg-accent' 
                          : 'bg-card hover:bg-accent/50'
                      }`}
                      onClick={() => handleEventSelect(event)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{event.company}</span>
                          {getEventIcon(event.type)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {event.title}
                          {event.form && ` • ${event.form}`}
                          {event.quarter && ` • ${event.quarter} ${event.year}`}
                        </p>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {selectedEvent && (
          <div className="rounded-lg border bg-card">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{selectedEvent.company}</h3>
                {selectedEvent.url && (
                  <Button variant="ghost" size="sm" asChild>
                    <a 
                      href={selectedEvent.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      View Original <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{selectedEvent.title}</p>
            </div>
            <ChatInterface
              messages={messages}
              onSendMessage={async (message) => {
                // Add user message
                setMessages(prev => [...prev, { role: 'user', content: message }]);
                
                try {
                  const response = await fetch('/api/analyze/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      event: selectedEvent,
                      userContext: {
                        interests: userProfile?.currentProjects,
                        industry: userProfile?.industry,
                        jobTitle: userProfile?.jobTitle
                      },
                      messages: [...messages, { role: 'user', content: message }]
                    })
                  });

                  const data = await response.json();
                  setMessages(prev => [...prev, { 
                    role: 'assistant', 
                    content: data.response 
                  }]);
                } catch (error) {
                  console.error('Error in chat:', error);
                  setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: 'Sorry, I encountered an error processing your request.'
                  }]);
                }
              }}
              isLoading={isAnalyzing}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function groupEventsByDate(events: Event[]) {
  return events.reduce((groups, event) => {
    const date = event.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {} as Record<string, Event[]>);
} 