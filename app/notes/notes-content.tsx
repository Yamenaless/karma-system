"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { addNote, getAllNotes, updateNote, deleteNote, Note, NoteFormData } from "@/app/actions/notes"
import { Plus, Pencil, Trash2, FileText } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

export function NotesContent() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)

  const [formData, setFormData] = useState<NoteFormData>({
    title: "",
    content: "",
  })

  const loadNotes = async () => {
    setLoading(true)
    const result = await getAllNotes()
    if (result.success && result.data) {
      setNotes(result.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadNotes()
  }, [])

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await addNote(formData)
    if (result.success) {
      setDialogOpen(false)
      setFormData({
        title: "",
        content: "",
      })
      await loadNotes()
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  const handleEditClick = (note: Note) => {
    setEditingNote(note)
    setFormData({
      title: note.title,
      content: note.content,
    })
    setEditDialogOpen(true)
  }

  const handleUpdateNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingNote) return

    const result = await updateNote(editingNote.id, formData)
    if (result.success) {
      setEditDialogOpen(false)
      setEditingNote(null)
      setFormData({
        title: "",
        content: "",
      })
      await loadNotes()
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  const handleDeleteNote = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return

    const result = await deleteNote(id)
    if (result.success) {
      await loadNotes()
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Notes</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Manage your notes and reminders
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Note
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:w-full max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Add New Note</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddNote} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter note title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    placeholder="Enter note content"
                    rows={8}
                    required
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="w-full sm:w-auto">Save Note</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Note Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="w-[95vw] sm:w-full max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Edit Note</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateNote} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows={8}
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditDialogOpen(false)
                  setEditingNote(null)
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto">Update Note</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Notes List */}
      <Card>
        <CardHeader>
          <CardTitle>My Notes</CardTitle>
        </CardHeader>
        <CardContent className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="lg" text="Loading notes..." />
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No notes yet</p>
              <p className="text-gray-400 text-sm mt-1">Click "Add Note" to create your first note</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow p-4 sm:p-6"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 break-words">
                        {note.title}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Created: {formatDate(note.created_at)}
                        {note.updated_at !== note.created_at && (
                          <span className="ml-2">• Updated: {formatDate(note.updated_at)}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditClick(note)}
                        className="h-8 w-8 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200"
                        title="Edit note"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteNote(note.id)}
                        className="h-8 w-8 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200"
                        title="Delete note"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-gray-700 whitespace-pre-wrap break-words leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

