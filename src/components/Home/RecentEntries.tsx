import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { getEntries } from '../../services/firestore'
import { JournalEntry } from '../../types'
import { formatDate, getTextSnippet, getMoodEmoji } from '../../utils/helpers'

const RecentEntries = () => {
  const navigate = useNavigate()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadEntries = async () => {
      try {
        const results = await getEntries(5)
        setEntries(results)
      } catch (error) {
        console.error('Error loading recent entries:', error)
      } finally {
        setLoading(false)
      }
    }

    loadEntries()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-sage" size={24} />
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No entries yet. Start writing!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Entries</h2>
      {entries.map((entry) => (
        <motion.div
          key={entry.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => navigate(`/entry/${entry.id}`)}
          className="glassmorphism rounded-xl p-5 cursor-pointer hover:bg-white/20 transition-colors"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="text-lg">{getMoodEmoji(entry.mood)}</span>
              <span className="text-sm font-medium text-gray-600">
                {formatDate(entry.date)}
              </span>
            </div>
            {entry.image_urls && entry.image_urls.length > 0 && (
              <div className="flex gap-1">
                {entry.image_urls.slice(0, 3).map((photo, idx) => (
                  <img
                    key={idx}
                    src={photo}
                    alt={`Photo ${idx + 1}`}
                    className="w-8 h-8 rounded object-cover border border-white/20"
                  />
                ))}
                {entry.image_urls.length > 3 && (
                  <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center text-xs text-gray-600">
                    +{entry.image_urls.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="text-gray-700 line-clamp-2">
            {getTextSnippet(entry.text, 150)}
          </p>
        </motion.div>
      ))}
    </div>
  )
}

export default RecentEntries

