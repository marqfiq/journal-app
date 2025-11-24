import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'

const QuickAdd = () => {
  const navigate = useNavigate()
  const [focused, setFocused] = useState(false)

  const handleFocus = () => {
    setFocused(true)
    // Navigate to new entry page immediately on focus
    navigate('/entry/new')
  }

  return (
    <motion.div
      initial={false}
      animate={{ scale: focused ? 1.02 : 1 }}
      className="w-full"
    >
      <div
        className="glassmorphism rounded-xl p-4 cursor-text hover:bg-white/15 transition-colors"
        onClick={handleFocus}
      >
        <div className="flex items-center gap-3">
          <Plus size={20} className="text-gray-600" />
          <input
            type="text"
            placeholder="What's on your mind?"
            onFocus={handleFocus}
            className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 text-lg"
          />
        </div>
      </div>
    </motion.div>
  )
}

export default QuickAdd

