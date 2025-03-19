'use client';

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface FileContentProps {
  content: string
  onClose: () => void
}

export function FileContent({ content, onClose }: FileContentProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">File Content</h2>
        <Button variant="ghost" onClick={onClose}>Close</Button>
      </div>
      <ScrollArea className="flex-1 p-4">
        <pre className="whitespace-pre-wrap font-mono text-sm">
          {content}
        </pre>
      </ScrollArea>
    </div>
  )
}
