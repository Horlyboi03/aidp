'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function TestSubmission() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const createTestApplication = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/debug/test-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const checkApplications = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/debug/test-submission')
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Test Application Submission</h1>
        
        <div className="space-y-4 mb-8">
          <motion.button
            onClick={createTestApplication}
            disabled={loading}
            className="btn-coral px-6 py-3 rounded-lg font-semibold mr-4"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? 'Creating...' : 'Create Test Application'}
          </motion.button>
          
          <motion.button
            onClick={checkApplications}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? 'Checking...' : 'Check Applications'}
          </motion.button>
        </div>

        {result && (
          <div className="glass-effect rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Result:</h2>
            <pre className="text-gray-300 text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}