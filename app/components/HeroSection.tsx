'use client'

import { motion } from 'framer-motion'

export default function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="glass-effect rounded-3xl p-12 coral-glow"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-6xl md:text-8xl font-bold mb-6 gradient-text"
          >
            AIDP
          </motion.h1>
          
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-2xl md:text-3xl text-white mb-8 font-light"
          >
            Agency for International Development Program
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-lg md:text-xl text-gray-200 mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            AIDP, in conjunction with the Private Grant Foundation, issues billions of dollars in grants 
            to help the poor, retired, disabled, separated, and many more. This worldwide program helps 
            pay medical bills, buy homes, start businesses, go to school, retire, and much more. 
            Grant money is yours, never needs to be repaid, and is not taxable.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center"
          >
            <div className="glass-effect rounded-xl p-6">
              <h3 className="text-3xl font-bold gradient-text mb-2">Billions</h3>
              <p className="text-gray-300">Dollars in Grants</p>
            </div>
            <div className="glass-effect rounded-xl p-6">
              <h3 className="text-3xl font-bold gradient-text mb-2">Daily</h3>
              <p className="text-gray-300">Awards Given</p>
            </div>
            <div className="glass-effect rounded-xl p-6">
              <h3 className="text-3xl font-bold gradient-text mb-2">Worldwide</h3>
              <p className="text-gray-300">Program Reach</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}