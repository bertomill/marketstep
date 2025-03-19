'use client'

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import { LogOut, Star, Settings, FileBarChart, BarChart3, BookOpen, X } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { MobileMenuToggle } from './MobileMenuToggle'

// This is the main navigation sidebar component that appears on all pages
// It provides access to different sections of the application and handles user authentication
export function Sidebar() {
  const { user, logout } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handlePreferences = () => {
    router.push('/settings')
  }

  // Don't render dropdown content until client-side
  const renderDropdownContent = () => {
    if (!mounted || !user) return null

    return (
      <DropdownMenuContent className="w-56" align="end" side="right">
        <DropdownMenuLabel className="flex items-center gap-2">
          <UserIcon className="h-4 w-4" />
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handlePreferences}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Preferences</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    )
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="flex h-full w-full flex-col gap-4 p-4">
      <MobileMenuToggle />
      
      <nav 
        id="sidebar"
        className={`fixed top-0 left-0 h-screen flex flex-col border-r bg-background transition-all duration-300 z-40
          ${isCollapsed ? 'md:w-16' : 'md:w-64'} 
          ${isMobileOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:translate-x-0'}`}
      >
        {/* Header */}
        <div className="flex h-14 items-center border-b px-4 justify-between">
          <Link href="/" className={`flex items-center gap-2 font-semibold ${isCollapsed ? 'md:hidden' : ''}`}>
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6">
              <circle cx="16" cy="16" r="15" className="fill-primary" />
              <path d="M8 24L12 20L16 24L20 20L24 24" 
                    stroke="white" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"/>
              <circle cx="12" cy="20" r="2" fill="white"/>
              <circle cx="16" cy="24" r="2" fill="white"/>
              <circle cx="20" cy="20" r="2" fill="white"/>
            </svg>
            <span>MarketStep</span>
          </Link>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 hidden md:flex"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2"/>
              <path d="M9 3v18"/>
            </svg>
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsMobileOpen(false)}
            className="h-8 w-8 md:hidden"
          >
            <X size={18} />
          </Button>
        </div>

        {/* Main Navigation */}
        <ScrollArea className="flex-1">
          <div className="space-y-4 p-2">
            {/* Content Section */}
            <div className="px-2 py-1">
              <h2 className={`mb-2 px-2 text-xs font-semibold tracking-tight ${isCollapsed ? 'md:text-center' : ''}`}>
                {!isCollapsed || !mounted ? 'Content' : ''}
              </h2>
              <div className="space-y-1">
                <Button variant="ghost" className={`w-full justify-start ${isCollapsed ? 'md:px-2' : ''}`} asChild>
                  <Link href="/calendar">
                    <CalendarIcon className={`${isCollapsed ? 'md:mx-auto' : 'mr-2'} h-4 w-4`} />
                    {(!isCollapsed || !mounted) && <span>Calendar</span>}
                  </Link>
                </Button>
                <Button variant="ghost" className={`w-full justify-start ${isCollapsed ? 'md:px-2' : ''}`} asChild>
                  <Link href="/studio">
                    <PenToolIcon className={`${isCollapsed ? 'md:mx-auto' : 'mr-2'} h-4 w-4`} />
                    {(!isCollapsed || !mounted) && <span>Content Studio</span>}
                  </Link>
                </Button>
                <Button variant="ghost" className={`w-full justify-start ${isCollapsed ? 'md:px-2' : ''}`} asChild>
                  <Link href="/chat">
                    <MessageSquareIcon className={`${isCollapsed ? 'md:mx-auto' : 'mr-2'} h-4 w-4`} />
                    {(!isCollapsed || !mounted) && <span>Chat</span>}
                  </Link>
                </Button>
                <Button variant="ghost" className={`w-full justify-start ${isCollapsed ? 'md:px-2' : ''}`} asChild>
                  <Link href="/notes">
                    <BookOpen className={`${isCollapsed ? 'md:mx-auto' : 'mr-2'} h-4 w-4`} />
                    {(!isCollapsed || !mounted) && <span>Notes</span>}
                  </Link>
                </Button>
              </div>
            </div>

            {/* Analysis Section */}
            <div className="px-2 py-1">
              <h2 className={`mb-2 px-2 text-xs font-semibold tracking-tight ${isCollapsed ? 'md:text-center' : ''}`}>
                {!isCollapsed || !mounted ? 'Analysis' : ''}
              </h2>
              <div className="space-y-1">
                <Button variant="ghost" className={`w-full justify-start ${isCollapsed ? 'md:px-2' : ''}`} asChild>
                  <Link href="/sec-filings">
                    <FileBarChart className={`${isCollapsed ? 'md:mx-auto' : 'mr-2'} h-4 w-4`} />
                    {(!isCollapsed || !mounted) && <span>SEC Filings</span>}
                  </Link>
                </Button>
                <Button variant="ghost" className={`w-full justify-start ${isCollapsed ? 'md:px-2' : ''}`} asChild>
                  <Link href="/insights">
                    <BarChart3 className={`${isCollapsed ? 'md:mx-auto' : 'mr-2'} h-4 w-4`} />
                    {(!isCollapsed || !mounted) && <span>Machine Learning</span>}
                  </Link>
                </Button>
              </div>
            </div>

            {/* Personal Section */}
            <div className="px-2 py-1">
              <h2 className={`mb-2 px-2 text-xs font-semibold tracking-tight ${isCollapsed ? 'md:text-center' : ''}`}>
                {!isCollapsed || !mounted ? 'Personal' : ''}
              </h2>
              <div className="space-y-1">
                <Button variant="ghost" className={`w-full justify-start ${isCollapsed ? 'md:px-2' : ''}`} asChild>
                  <Link href="/companies">
                    <Star className={`${isCollapsed ? 'md:mx-auto' : 'mr-2'} h-4 w-4`} />
                    {(!isCollapsed || !mounted) && <span>My Companies</span>}
                  </Link>
                </Button>
                <Button variant="ghost" className={`w-full justify-start ${isCollapsed ? 'md:px-2' : ''}`} asChild>
                  <Link href="/settings">
                    <SettingsIcon className={`${isCollapsed ? 'md:mx-auto' : 'mr-2'} h-4 w-4`} />
                    {(!isCollapsed || !mounted) && <span>Settings</span>}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* User Account */}
        <div className="mt-auto p-4">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                      {user.displayName ? user.displayName[0] : 'U'}
                    </div>
                    {(!isCollapsed || !mounted) && (
                      <div className="flex flex-col items-start text-left">
                        <span className="text-sm font-medium">{user.displayName || 'User'}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-[140px]">{user.email}</span>
                      </div>
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              {renderDropdownContent()}
            </DropdownMenu>
          )}
        </div>
      </nav>
      
      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 md:hidden" 
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </div>
  )
}

// Simple icon components
function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <line x1="3" x2="21" y1="9" y2="9" />
      <line x1="9" x2="9" y1="3" y2="21" />
    </svg>
  )
}

// Add PenTool icon for Content Studio
const PenToolIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 19l7-7 3 3-7 7-3-3z"/>
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
    <path d="M2 2l7.586 7.586"/>
    <circle cx="11" cy="11" r="2"/>
  </svg>
)

function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

// Add MessageSquare icon for Chat
function MessageSquareIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}