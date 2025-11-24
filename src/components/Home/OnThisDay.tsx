import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import { getOnThisDay } from '../../services/firestore'
import { JournalEntry } from '../../types'
import { formatDateWithYear, getTextSnippet, getMoodEmoji } from '../../utils/helpers'

const OnThisDay = () => {
  const navigate = useNavigate()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOnThisDay = async () => {
      try {
        const today = new Date()
        const results = await getOnThisDay(today)
        // Filter out entries from the current year to only show previous years
        const currentYear = today.getFullYear()
        const previousYearEntries = results.filter(entry => {
          const entryYear = new Date(entry.date).getFullYear()
          return entryYear < currentYear
        })
        setEntries(previousYearEntries)
      } catch (error) {
        console.error('Error loading On This Day entries:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOnThisDay()
  }, [])

  if (loading) {
    return null
  }

  if (entries.length === 0) {
    return null
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={20} className="text-gray-600" />
        <h2 className="text-xl font-semibold text-gray-800">On This Day</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {entries.map((entry) => (
          <motion.div
            key={entry.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/entry/${entry.id}`)}
            className="glassmorphism rounded-xl p-4 min-w-[280px] max-w-[280px] cursor-pointer hover:bg-white/20 transition-colors flex-shrink-0"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                {formatDateWithYear(entry.date)}
              </span>
              <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
            </div>
            <p className="text-gray-700 text-sm line-clamp-3">
              {getTextSnippet(entry.text, 80)}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default OnThisDay

