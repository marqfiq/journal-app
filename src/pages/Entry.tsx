import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getEntry, addEntry, updateEntry, uploadImage } from '../services/firestore'
import { JournalEntry } from '../types'
import EditorSheet from '../components/Editor/EditorSheet'
import MoodSelector from '../components/Editor/MoodSelector'
import PhotoUpload from '../components/Editor/PhotoUpload'
import { useDebounce } from '../hooks/useDebounce'

const Entry = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isNewEntry = id === 'new'

  const [loading, setLoading] = useState(!isNewEntry)
  const [saving, setSaving] = useState(false)
  const [entry, setEntry] = useState<Partial<JournalEntry>>({
    text: '',
    photos: [],
    date: Date.now(),
    mood: 3,
    tags: [],
  })

  // Load existing entry
  useEffect(() => {
    if (isNewEntry || !id) {
      setLoading(false)
      return
    }

    const loadEntry = async () => {
      try {
        const loadedEntry = await getEntry(id)
        if (loadedEntry) {
          setEntry(loadedEntry)
        } else {
          // Entry not found, redirect to home
          navigate('/')
        }
      } catch (error) {
        console.error('Error loading entry:', error)
        navigate('/')
      } finally {
        setLoading(false)
      }
    }

    loadEntry()
  }, [id, isNewEntry, navigate])

  // Debounced text for auto-save
  const debouncedText = useDebounce(entry.text || '', 1000)

  // Auto-save when text changes (only for existing entries)
  useEffect(() => {
    if (isNewEntry || !id || loading) return
    if (!debouncedText || debouncedText === '' || debouncedText === '<p></p>') return

    const autoSave = async () => {
      try {
        await updateEntry(id, {
          text: debouncedText,
          photos: entry.photos || [],
          mood: entry.mood || 3,
          tags: entry.tags || [],
        })
      } catch (error) {
        console.error('Error auto-saving:', error)
      }
    }

    autoSave()
  }, [debouncedText, id, isNewEntry, loading, entry.photos, entry.mood, entry.tags])

  const handleSave = async () => {
    if (!user) return

    if (!entry.text || entry.text.trim() === '' || entry.text === '<p></p>') {
      alert('Please write something before saving!')
      return
    }

    setSaving(true)
    try {
      if (isNewEntry) {
        const newId = await addEntry({
          userId: user.uid,
          text: entry.text,
          photos: entry.photos || [],
          date: entry.date || Date.now(),
          mood: entry.mood || 3,
          tags: entry.tags || [],
        })
        navigate(`/entry/${newId}`)
      } else {
        await updateEntry(id!, {
          text: entry.text,
          photos: entry.photos || [],
          date: entry.date,
          mood: entry.mood,
          tags: entry.tags,
        })
        navigate('/')
      }
    } catch (error) {
      console.error('Error saving entry:', error)
      alert('Failed to save entry. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value).getTime()
    setEntry({ ...entry, date: newDate })
  }

  const handlePhotoUpload = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated')
    return await uploadImage(file, user.uid)
  }

  const formatDateInput = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toISOString().split('T')[0]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-sage" size={32} />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glassmorphism rounded-xl w-full max-w-4xl shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between mb-4">
            <input
              type="date"
              value={formatDateInput(entry.date || Date.now())}
              onChange={handleDateChange}
              className="text-xl font-semibold text-gray-800 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-white/30 rounded px-2 py-1"
            />
            <motion.button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-white/30 hover:bg-white/40 rounded-lg font-medium text-gray-800 transition-colors disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check size={18} />
                  <span>Done</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Editor */}
        <div className="p-6">
          <EditorSheet
            content={entry.text || ''}
            onUpdate={(html) => setEntry({ ...entry, text: html })}
          />
        </div>

        {/* Metadata Drawer */}
        <div className="p-6 border-t border-white/20 space-y-6">
          <MoodSelector
            mood={entry.mood || 2}
            onMoodChange={(mood) => setEntry({ ...entry, mood })}
          />
          
          <PhotoUpload
            photos={entry.photos || []}
            onPhotosChange={(photos) => setEntry({ ...entry, photos })}
            onUpload={handlePhotoUpload}
            userId={user?.uid}
          />
        </div>
      </motion.div>
    </div>
  )
}

export default Entry
