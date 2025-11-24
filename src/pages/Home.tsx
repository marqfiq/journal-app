import { motion } from 'framer-motion'
import QuickAdd from '../components/Home/QuickAdd'
import OnThisDay from '../components/Home/OnThisDay'
import RecentEntries from '../components/Home/RecentEntries'
import { getGreeting } from '../utils/helpers'

const Home = () => {
  const greeting = getGreeting()

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            {greeting}
          </h1>
          <p className="text-gray-600">Welcome back to your journal</p>
        </div>

        {/* Quick Add */}
        <QuickAdd />

        {/* On This Day */}
        <OnThisDay />

        {/* Recent Entries */}
        <RecentEntries />
      </motion.div>
    </div>
  )
}

export default Home
