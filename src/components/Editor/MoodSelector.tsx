import { motion } from 'framer-motion'

interface MoodSelectorProps {
  mood: number
  onMoodChange: (mood: number) => void
}

const moods = [
  { value: 1, emoji: '😢', label: 'Sad' },
  { value: 2, emoji: '😐', label: 'Neutral' },
  { value: 3, emoji: '🙂', label: 'Good' },
  { value: 4, emoji: '😊', label: 'Great' },
  { value: 5, emoji: '😄', label: 'Amazing' },
]

const MoodSelector = ({ mood, onMoodChange }: MoodSelectorProps) => {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-gray-700">Mood</label>
      <div className="flex gap-2 flex-wrap">
        {moods.map((m) => (
          <motion.button
            key={m.value}
            onClick={() => onMoodChange(m.value)}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
              mood === m.value
                ? 'bg-white/40 scale-110 ring-2 ring-white/50'
                : 'bg-white/20 hover:bg-white/30'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title={m.label}
          >
            {m.emoji}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export default MoodSelector

