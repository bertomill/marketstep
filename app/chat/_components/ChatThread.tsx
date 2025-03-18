import {
  ActionBarPrimitive,
  BranchPickerPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from "@assistant-ui/react";
import type { FC } from "react";
import {
  ArrowDownIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  PencilIcon,
  RefreshCwIcon,
  SendHorizontalIcon,
  FileText,
  X,
  Tag,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { MarkdownText } from "@/components/assistant-ui/markdown-text";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { Card } from "@/components/ui/card";
import { Note } from "@/types/note";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChatThreadProps {
  notes: Note[];
  selectedModel: 'claude' | 'gemini';
  onModelChange: (model: 'claude' | 'gemini') => void;
}

export const ChatThread: FC<ChatThreadProps> = ({ notes, selectedModel, onModelChange }) => {
  const [showNoteSelector, setShowNoteSelector] = useState(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [selectedLabel, setSelectedLabel] = useState<string>('');

  const handleNoteClick = (noteId: string) => {
    setSelectedNoteIds(prev =>
      prev.includes(noteId)
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
  };

  const insertSelectedNotes = () => {
    const selectedNotes = notes.filter(note => selectedNoteIds.includes(note.id));
    const noteReferences = selectedNotes
      .map(note => {
        const labels = note.labels?.length 
          ? ` [${note.labels.join(', ')}]` 
          : '';
        return `[📝 ${note.title}${labels}] ${note.content.slice(0, 100)}${note.content.length > 100 ? '...' : ''}`;
      })
      .join('\n\n');
    
    setCurrentMessage(prev => 
      prev.trim() 
        ? `${noteReferences}\n\n${prev}` 
        : noteReferences
    );
    setSelectedNoteIds([]);
    setShowNoteSelector(false);
  };

  // Get unique labels from all notes
  const availableLabels = Array.from(
    new Set(
      notes.flatMap(note => note.labels || [])
    )
  );

  // Filter notes by selected label
  const filteredNotes = selectedLabel
    ? notes.filter(note => note.labels?.includes(selectedLabel))
    : notes;

  return (
    <ThreadPrimitive.Root
      className="bg-background box-border flex h-full flex-col overflow-hidden"
      style={{
        ["--thread-max-width" as string]: "80rem",
      }}
    >
      <ThreadPrimitive.Viewport className="flex h-full flex-col items-center overflow-y-scroll scroll-smooth bg-inherit px-4 pt-8">
        <ThreadWelcome />
        <ThreadPrimitive.Messages
          components={{
            UserMessage: UserMessage,
            EditComposer: EditComposer,
            AssistantMessage: AssistantMessage,
          }}
        />
        <ThreadPrimitive.If empty={false}>
          <div className="min-h-8 flex-grow" />
        </ThreadPrimitive.If>

        <div className="sticky bottom-0 mt-3 flex w-full max-w-[var(--thread-max-width)] flex-col items-center justify-end rounded-t-lg bg-inherit pb-4">
          <ThreadScrollToBottom />
          <div className="w-full">
            {showNoteSelector && (
              <Card className="mb-4 p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Select Notes to Reference</h4>
                  <Button variant="ghost" size="sm" onClick={() => setShowNoteSelector(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Labels filter */}
                {availableLabels.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="h-4 w-4" />
                      <span className="text-sm font-medium">Filter by label</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availableLabels.map((label) => (
                        <button
                          key={label}
                          onClick={() => setSelectedLabel(prev => prev === label ? '' : label)}
                          className={`px-2 py-1 rounded-full text-xs transition-colors ${
                            selectedLabel === label
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-primary/10 text-primary hover:bg-primary/20'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filteredNotes.map((note) => (
                    <div
                      key={note.id}
                      className={`p-2 rounded border cursor-pointer transition-colors ${
                        selectedNoteIds.includes(note.id)
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => handleNoteClick(note.id)}
                    >
                      <h5 className="font-medium text-sm">{note.title}</h5>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {note.content}
                      </p>
                      {note.labels && note.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {note.labels.map((label) => (
                            <span
                              key={label}
                              className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-[10px]"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {selectedNoteIds.length > 0 && (
                  <div className="mt-3 flex justify-end">
                    <Button size="sm" onClick={insertSelectedNotes}>
                      Insert Selected Notes
                    </Button>
                  </div>
                )}
              </Card>
            )}
            <div className="flex flex-col w-full">
              <ComposerPrimitive.Root className="focus-within:border-ring/20 flex w-full flex-wrap items-end rounded-lg border bg-inherit px-2.5 shadow-sm transition-colors ease-in">
                <div className="flex w-full items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="my-2 flex-shrink-0"
                    onClick={() => setShowNoteSelector(true)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Add Notes
                  </Button>
                  <ComposerPrimitive.Input
                    rows={1}
                    autoFocus
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Write a message..."
                    className="placeholder:text-muted-foreground flex-1 resize-none border-none bg-transparent px-2 py-4 text-sm outline-none focus:ring-0 disabled:cursor-not-allowed min-w-0"
                  />
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Select value={selectedModel} onValueChange={onModelChange}>
                      <SelectTrigger className="w-[120px] h-8 my-2 border-none bg-transparent text-sm">
                        <div className="flex items-center">
                          <Sparkles className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                          <SelectValue className="truncate" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="claude" className="text-sm">Claude</SelectItem>
                        <SelectItem value="gemini" className="text-sm">Gemini</SelectItem>
                      </SelectContent>
                    </Select>
                    <ComposerPrimitive.Send asChild>
                      <TooltipIconButton
                        tooltip="Send"
                        variant="default"
                        className="my-2.5 size-8 p-2 transition-opacity ease-in"
                        onClick={() => setCurrentMessage('')}
                      >
                        <SendHorizontalIcon />
                      </TooltipIconButton>
                    </ComposerPrimitive.Send>
                  </div>
                </div>
              </ComposerPrimitive.Root>
            </div>
          </div>
        </div>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
};

const ThreadScrollToBottom: FC = () => {
  return (
    <ThreadPrimitive.ScrollToBottom asChild>
      <TooltipIconButton
        tooltip="Scroll to bottom"
        variant="outline"
        className="absolute -top-8 rounded-full disabled:invisible"
      >
        <ArrowDownIcon />
      </TooltipIconButton>
    </ThreadPrimitive.ScrollToBottom>
  );
};

const ThreadWelcome: FC = () => {
  return (
    <ThreadPrimitive.Empty>
      <div className="flex w-full max-w-[var(--thread-max-width)] flex-grow flex-col">
        <div className="flex w-full flex-grow flex-col items-center justify-center">
          <p className="mt-4 font-medium">
            How can I help you today?
          </p>
        </div>
        <ThreadWelcomeSuggestions />
      </div>
    </ThreadPrimitive.Empty>
  );
};

const ThreadWelcomeSuggestions: FC = () => {
  return (
    <div className="mt-3 flex w-full items-stretch justify-center gap-4">
      <ThreadPrimitive.Suggestion
        className="hover:bg-muted/80 flex max-w-sm grow basis-0 flex-col items-center justify-center rounded-lg border p-3 transition-colors ease-in"
        prompt="Summarize my recent notes and highlight key insights"
        method="replace"
        autoSend
      >
        <span className="line-clamp-2 text-ellipsis text-sm font-semibold text-center">
          Summarize my recent notes and highlight key insights
        </span>
      </ThreadPrimitive.Suggestion>
      <ThreadPrimitive.Suggestion
        className="hover:bg-muted/80 flex max-w-sm grow basis-0 flex-col items-center justify-center rounded-lg border p-3 transition-colors ease-in"
        prompt="What events do I have coming up on my calendar?"
        method="replace"
        autoSend
      >
        <span className="line-clamp-2 text-ellipsis text-sm font-semibold text-center">
          What events do I have coming up on my calendar?
        </span>
      </ThreadPrimitive.Suggestion>
      <ThreadPrimitive.Suggestion
        className="hover:bg-muted/80 flex max-w-sm grow basis-0 flex-col items-center justify-center rounded-lg border p-3 transition-colors ease-in"
        prompt="Help me analyze recent market trends in my tracked companies"
        method="replace"
        autoSend
      >
        <span className="line-clamp-2 text-ellipsis text-sm font-semibold text-center">
          Analyze market trends in my tracked companies
        </span>
      </ThreadPrimitive.Suggestion>
    </div>
  );
};

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="grid auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] gap-y-2 [&:where(>*)]:col-start-2 w-full max-w-[var(--thread-max-width)] py-4">
      <UserActionBar />

      <div className="bg-muted text-foreground max-w-[calc(var(--thread-max-width)*0.8)] break-words rounded-3xl px-5 py-2.5 col-start-2 row-start-2">
        <MessagePrimitive.Content />
      </div>

      <BranchPicker className="col-span-full col-start-1 row-start-3 -mr-1 justify-end" />
    </MessagePrimitive.Root>
  );
};

const UserActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="flex flex-col items-end col-start-1 row-start-2 mr-3 mt-2.5"
    >
      <ActionBarPrimitive.Edit asChild>
        <TooltipIconButton tooltip="Edit">
          <PencilIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Edit>
    </ActionBarPrimitive.Root>
  );
};

const EditComposer: FC = () => {
  return (
    <ComposerPrimitive.Root className="bg-muted my-4 flex w-full max-w-[var(--thread-max-width)] flex-col gap-2 rounded-xl">
      <ComposerPrimitive.Input className="text-foreground flex h-8 w-full resize-none bg-transparent p-4 pb-0 outline-none" />

      <div className="mx-3 mb-3 flex items-center justify-center gap-2 self-end">
        <ComposerPrimitive.Cancel asChild>
          <Button variant="ghost">Cancel</Button>
        </ComposerPrimitive.Cancel>
        <ComposerPrimitive.Send asChild>
          <Button>Send</Button>
        </ComposerPrimitive.Send>
      </div>
    </ComposerPrimitive.Root>
  );
};

const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="grid grid-cols-[auto_auto_1fr] grid-rows-[auto_1fr] relative w-full max-w-[var(--thread-max-width)] py-4">
      <div className="text-foreground max-w-[calc(var(--thread-max-width)*0.8)] break-words leading-7 col-span-2 col-start-2 row-start-1 my-1.5">
        <MessagePrimitive.Content components={{ Text: MarkdownText }} />
      </div>

      <AssistantActionBar />

      <BranchPicker className="col-start-2 row-start-2 -ml-2 mr-2" />
    </MessagePrimitive.Root>
  );
};

const AssistantActionBar: FC = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      autohideFloat="single-branch"
      className="text-muted-foreground flex gap-1 col-start-3 row-start-2 -ml-1 data-[floating]:bg-background data-[floating]:absolute data-[floating]:rounded-md data-[floating]:border data-[floating]:p-1 data-[floating]:shadow-sm"
    >
      <ActionBarPrimitive.Copy asChild>
        <TooltipIconButton tooltip="Copy">
          <MessagePrimitive.If copied>
            <CheckIcon />
          </MessagePrimitive.If>
          <MessagePrimitive.If copied={false}>
            <CopyIcon />
          </MessagePrimitive.If>
        </TooltipIconButton>
      </ActionBarPrimitive.Copy>
      <ActionBarPrimitive.Reload asChild>
        <TooltipIconButton tooltip="Refresh">
          <RefreshCwIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Reload>
    </ActionBarPrimitive.Root>
  );
};

const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({
  className,
  ...rest
}) => {
  return (
    <BranchPickerPrimitive.Root
      hideWhenSingleBranch
      className={cn("text-muted-foreground inline-flex items-center text-xs", className)}
      {...rest}
    >
      <BranchPickerPrimitive.Previous asChild>
        <TooltipIconButton tooltip="Previous">
          <ChevronLeftIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Previous>
      <span className="font-medium">
        <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
      </span>
      <BranchPickerPrimitive.Next asChild>
        <TooltipIconButton tooltip="Next">
          <ChevronRightIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  );
}; 