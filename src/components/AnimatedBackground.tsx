import { motion } from 'framer-motion'

const AnimatedBackground = () => {
  const circles = [
    { size: 400, x: '10%', y: '20%', color: 'rgba(156, 175, 136, 0.3)', delay: 0 }, // Sage
    { size: 350, x: '80%', y: '10%', color: 'rgba(184, 169, 201, 0.3)', delay: 0.5 }, // Lavender
    { size: 450, x: '50%', y: '60%', color: 'rgba(232, 197, 192, 0.3)', delay: 1 }, // Blush
    { size: 380, x: '20%', y: '80%', color: 'rgba(168, 213, 226, 0.3)', delay: 1.5 }, // Sky
    { size: 320, x: '70%', y: '70%', color: 'rgba(156, 175, 136, 0.25)', delay: 2 }, // Sage lighter
    { size: 360, x: '40%', y: '30%', color: 'rgba(184, 169, 201, 0.25)', delay: 2.5 }, // Lavender lighter
  ]

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {circles.map((circle, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full blur-3xl"
          style={{
            width: circle.size,
            height: circle.size,
            background: circle.color,
            left: circle.x,
            top: circle.y,
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 20 + index * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: circle.delay,
          }}
        />
      ))}
    </div>
  )
}

export default AnimatedBackground

