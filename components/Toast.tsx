import { motion, AnimatePresence } from 'framer-motion'

interface ToastProps {
  message: string
  isVisible: boolean
  color: string
}

export default function Toast({ message, isVisible, color }: ToastProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 left-0 right-0 flex justify-center md:bottom-8 z-50"
          style={{ fontFamily: "receipt-narrow, sans-serif" }}
        >
          <div 
            className="px-4 py-2 rounded mx-4 md:mx-8"
            style={{ 
              color,
              textShadow: `0 0 5px ${color}40`,
              border: `1px solid ${color}50`,
              whiteSpace: 'nowrap'
            }}
          >
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 