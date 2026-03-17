'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

interface LoginData {
  username: string
  password: string
}

interface AdminLoginProps {
  onLogin: () => void
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>()

  const onSubmit = async (data: LoginData) => {
    setLoading(true)
    
    // Mock authentication - in a real app, this would be a proper API call
    if (data.username === 'admin' && data.password === 'aidp2024') {
      localStorage.setItem('adminToken', 'mock-jwt-token')
      toast.success('Login successful!')
      onLogin()
    } else {
      toast.error('Invalid credentials')
    }
    
    setLoading(false)
  }

  return (
    <section className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        <div className="glass-effect rounded-3xl p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold gradient-text mb-2">AIDP Admin</h1>
            <p className="text-gray-300">Access the administrative dashboard</p>
          </motion.div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-white font-semibold mb-2">Username</label>
              <input
                {...register('username', { required: 'Username is required' })}
                className="form-input w-full px-4 py-3 rounded-xl text-white placeholder-gray-400"
                placeholder="Enter your username"
                disabled={loading}
              />
              {errors.username && (
                <p className="text-red-400 text-sm mt-1">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Password</label>
              <input
                {...register('password', { required: 'Password is required' })}
                type="password"
                className="form-input w-full px-4 py-3 rounded-xl text-white placeholder-gray-400"
                placeholder="Enter your password"
                disabled={loading}
              />
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="btn-coral w-full py-3 rounded-xl text-white font-semibold disabled:opacity-50"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </motion.button>
          </form>

          <div className="mt-6 p-4 glass-effect rounded-xl">
            <p className="text-sm text-gray-400 text-center">
              Demo Credentials:<br />
              Username: <span className="text-coral-400">admin</span><br />
              Password: <span className="text-coral-400">aidp2024</span>
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}