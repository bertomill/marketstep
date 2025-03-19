import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MobileMenuToggleProps {
  isOpen?: boolean
  onToggle?: () => void
}

export function MobileMenuToggle({ isOpen, onToggle }: MobileMenuToggleProps) {
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="md:hidden fixed top-3 left-3 z-50 h-10 w-10 rounded-full bg-background shadow-md"
      onClick={onToggle}
    >
      {isOpen ? <X size={20} /> : <Menu size={20} />}
    </Button>
  )
} 