'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, Timestamp, orderBy, updateDoc, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Save, Loader2, Tag, X, Edit2, FileText, Code, Book, Link, Star, Lightbulb, LucideIcon, LayoutGrid, Table2 } from 'lucide-react';
import { Note } from '@/types/note';

// Map of label icons - add more as needed
const LABEL_ICONS: Record<string, LucideIcon> = {
  'code': Code,
  'article': FileText,
  'documentation': Book,
  'link': Link,
  'important': Star,
  'idea': Lightbulb,
};

type ViewMode = 'grid' | 'table';

export default function NotesPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState({ title: '', content: '', labels: [] as string[] });
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [availableLabels, setAvailableLabels] = useState<string[]>([]);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Load notes and extract unique labels when component mounts
  useEffect(() => {
    if (!user) return;
    loadNotes();
  }, [user]);

  const loadNotes = async () => {
    if (!user) return;

    try {
      const q = query(
        collection(db, 'notes'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const loadedNotes: Note[] = [];
      const labels = new Set<string>();
      
      querySnapshot.forEach((doc) => {
        const note = { id: doc.id, ...doc.data() } as Note;
        loadedNotes.push(note);
        note.labels?.forEach(label => labels.add(label));
      });
      
      setNotes(loadedNotes);
      setAvailableLabels(Array.from(labels));
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const createOrUpdateNote = async () => {
    if (!user || !newNote.title || !newNote.content) return;
    
    setIsSaving(true);
    try {
      const noteData = {
        title: newNote.title,
        content: newNote.content,
        userId: user.uid,
        labels: newNote.labels,
        ...(editingNote ? {} : { createdAt: Timestamp.now() })
      };
      
      if (editingNote) {
        await updateDoc(doc(db, 'notes', editingNote.id), noteData);
      } else {
        await addDoc(collection(db, 'notes'), noteData);
      }

      setNewNote({ title: '', content: '', labels: [] });
      setIsCreating(false);
      setEditingNote(null);
      loadNotes();
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const startEditing = (note: Note) => {
    setEditingNote(note);
    setNewNote({
      title: note.title,
      content: note.content,
      labels: note.labels || []
    });
    setIsCreating(true);
  };

  const addLabel = () => {
    if (!newLabel.trim()) return;
    
    if (!newNote.labels.includes(newLabel)) {
      setNewNote(prev => ({
        ...prev,
        labels: [...prev.labels, newLabel.trim()]
      }));
      if (!availableLabels.includes(newLabel)) {
        setAvailableLabels(prev => [...prev, newLabel]);
      }
    }
    setNewLabel('');
  };

  const removeLabel = (labelToRemove: string) => {
    setNewNote(prev => ({
      ...prev,
      labels: prev.labels.filter(label => label !== labelToRemove)
    }));
  };

  const cancelEditing = () => {
    setNewNote({ title: '', content: '', labels: [] });
    setIsCreating(false);
    setEditingNote(null);
  };

  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {notes.map((note) => (
        <Card 
          key={note.id} 
          className="p-6 cursor-pointer hover:shadow-md transition-shadow relative group"
          onClick={() => startEditing(note)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <h3 className="text-xl font-semibold mb-2">{note.title}</h3>
          <p className="text-gray-600 line-clamp-3">{note.content}</p>
          {note.labels && note.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {note.labels.map((label) => (
                <span
                  key={label}
                  className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs flex items-center gap-1"
                >
                  {LABEL_ICONS[label] && (
                    <span className="mr-0.5">
                      {React.createElement(LABEL_ICONS[label], { size: 12 })}
                    </span>
                  )}
                  {label}
                </span>
              ))}
            </div>
          )}
          <p className="text-sm text-gray-400 mt-4">
            {note.createdAt.toDate().toLocaleDateString()}
          </p>
        </Card>
      ))}
    </div>
  );

  const renderTableView = () => (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-12 px-4 text-left font-medium">Title</th>
              <th className="h-12 px-4 text-left font-medium">Content</th>
              <th className="h-12 px-4 text-left font-medium">Labels</th>
              <th className="h-12 px-4 text-left font-medium">Created</th>
              <th className="h-12 px-4 text-left font-medium w-[100px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {notes.map((note) => (
              <tr key={note.id} className="border-b hover:bg-muted/50 transition-colors">
                <td className="p-4 font-medium">{note.title}</td>
                <td className="p-4 max-w-[300px]">
                  <p className="truncate">{note.content}</p>
                </td>
                <td className="p-4">
                  {note.labels && note.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.labels.map((label) => (
                        <span
                          key={label}
                          className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs flex items-center gap-1"
                        >
                          {LABEL_ICONS[label] && (
                            <span className="mr-0.5">
                              {React.createElement(LABEL_ICONS[label], { size: 12 })}
                            </span>
                          )}
                          {label}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="p-4 text-sm text-gray-500">
                  {note.createdAt.toDate().toLocaleDateString()}
                </td>
                <td className="p-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(note);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-8">
              <h1 className="text-3xl font-bold">Notes</h1>
              <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => setViewMode('table')}
                >
                  <Table2 className="h-4 w-4" />
                  Table
                </Button>
              </div>
            </div>
            <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Note
            </Button>
          </div>

          {isCreating && (
            <Card className="mb-8 p-6">
              <input
                type="text"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                placeholder="Note title..."
                className="w-full text-xl font-semibold mb-4 p-2 border-b focus:outline-none focus:border-primary"
              />
              <textarea
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                placeholder="Write your note here..."
                className="w-full h-40 p-2 border rounded-md focus:outline-none focus:border-primary resize-none"
              />
              
              {/* Labels Section */}
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4" />
                  <span className="font-medium">Labels</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newNote.labels.map((label) => (
                    <span
                      key={label}
                      className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {LABEL_ICONS[label] && (
                        <span className="mr-1">
                          {React.createElement(LABEL_ICONS[label], { size: 12 })}
                        </span>
                      )}
                      {label}
                      <button
                        onClick={() => removeLabel(label)}
                        className="hover:text-primary/80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addLabel()}
                    placeholder="Add a label..."
                    className="flex-1 p-2 border rounded-md focus:outline-none focus:border-primary text-sm"
                    list="available-labels"
                  />
                  <datalist id="available-labels">
                    {availableLabels.map(label => (
                      <option key={label} value={label} />
                    ))}
                  </datalist>
                  <Button size="sm" onClick={addLabel}>Add</Button>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={cancelEditing}>
                  Cancel
                </Button>
                <Button 
                  onClick={createOrUpdateNote} 
                  disabled={isSaving || !newNote.title || !newNote.content}
                  className="flex items-center gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {editingNote ? 'Update Note' : 'Save Note'}
                </Button>
              </div>
            </Card>
          )}

          {viewMode === 'grid' ? renderCardView() : renderTableView()}
        </div>
      </main>
    </div>
  );
}