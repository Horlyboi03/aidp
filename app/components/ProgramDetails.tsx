'use client'

import { motion } from 'framer-motion'

const details = [
  {
    title: "Program Purpose",
    content: "AIDP helps the poor, retired, disabled, separated, and many more. In conjunction with the Private Grant Foundation, we issue billions of dollars in grants to individuals every day.",
    icon: "🎯"
  },
  {
    title: "Grant Benefits", 
    content: "Grant programs are not loans. The money is yours and never needs to be repaid. Grant money is not taxable and bears no interest. A one-time processing fee is required before grant release.",
    icon: "💰"
  },
  {
    title: "Program Uses",
    content: "This program helps pay medical bills, buy a home, start a business, go to school, retire, and much more. You decide how much you need and how to receive it (cash or cheque).",
    icon: "🏠"
  },
  {
    title: "Eligibility & Process",
    content: "You can apply even if you have bad credit. No credit check, security deposit, or cosigner required. After approval, you'll receive payment details for the processing fee.",
    icon: "🌍"
  }
]

export default function ProgramDetails() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold text-center mb-16 gradient-text"
        >
          Program Details
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {details.map((detail, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="glass-effect rounded-2xl p-8 hover:coral-glow transition-all duration-300"
            >
              <div className="text-4xl mb-4">{detail.icon}</div>
              <h3 className="text-2xl font-bold text-white mb-4">{detail.title}</h3>
              <p className="text-gray-300 leading-relaxed">{detail.content}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}