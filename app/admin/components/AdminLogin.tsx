'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

interface LoginData {
  username: string
  password: string
}

interface ForgotPasswordData {
  email: string
}

interface ResetPasswordData {
  otp: string
  newPassword: string
  confirmPassword: string
}

interface AdminLoginProps {
  onLogin: () => void
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [loading, setLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>()
  const { register: registerForgot, handleSubmit: handleSubmitForgot, formState: { errors: errorsForgot } } = useForm<ForgotPasswordData>()
  const { register: registerReset, handleSubmit: handleSubmitReset, formState: { errors: errorsReset }, watch } = useForm<ResetPasswordData>()

  const newPassword = watch('newPassword')

  const onSubmit = async (data: LoginData) => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        const result = await response.json()
        localStorage.setItem('adminToken', result.token)
        toast.success('Login successful!')
        onLogin()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Invalid credentials')
      }
    } catch (error) {
      toast.error('Login failed. Please try again.')
    }
    
    setLoading(false)
  }

  const onForgotPassword = async (data: ForgotPasswordData) => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success) {
        toast.success('OTP sent to your email!')
        setResetEmail(data.email)
        setShowForgotPassword(false)
        setShowResetPassword(true)
      } else {
        toast.error(result.message || 'Failed to send OTP')
      }
    } catch (error) {
      toast.error('Failed to send OTP. Please try again.')
    }
    
    setLoading(false)
  }

  const onResetPassword = async (data: ResetPasswordData) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/admin/forgot-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail,
          otp: data.otp,
          newPassword: data.newPassword
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Password reset successfully!')
        setShowResetPassword(false)
        setResetEmail('')
      } else {
        toast.error(result.message || 'Failed to reset password')
      }
    } catch (error) {
      toast.error('Failed to reset password. Please try again.')
    }
    
    setLoading(false)
  }

  return (
    <section className="min-h-screen flex items-center justify-center px-4 relative">
      {/* Logo Header - Same size as homepage */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute top-4 left-4 md:top-8 md:left-8 z-20"
      >
        <img
          src="/images/aidp-logo-white.svg"
          alt="AIDP Grant Program"
          className="w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 drop-shadow-2xl hover:scale-110 transition-transform duration-300"
        />
      </motion.div>

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
            <p className="text-gray-300">
              {showForgotPassword ? 'Reset Your Password' : showResetPassword ? 'Enter OTP' : 'Access the administrative dashboard'}
            </p>
          </motion.div>

          {!showForgotPassword && !showResetPassword ? (
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

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-coral-400 hover:text-coral-300 text-sm font-semibold"
                >
                  Forgot Password?
                </button>
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
          ) : showForgotPassword ? (
            <form onSubmit={handleSubmitForgot(onForgotPassword)} className="space-y-6">
              <div>
                <label className="block text-white font-semibold mb-2">Admin Email</label>
                <input
                  {...registerForgot('email', { 
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                  })}
                  type="email"
                  className="form-input w-full px-4 py-3 rounded-xl text-white placeholder-gray-400"
                  placeholder="maryygeorge193@gmail.com"
                  disabled={loading}
                />
                {errorsForgot.email && (
                  <p className="text-red-400 text-sm mt-1">{errorsForgot.email.message}</p>
                )}
                <p className="text-gray-400 text-xs mt-2">
                  We'll send a 6-digit OTP to your email
                </p>
              </div>

              <div className="flex space-x-3">
                <motion.button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Back
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-coral py-3 rounded-xl text-white font-semibold disabled:opacity-50"
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </motion.button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmitReset(onResetPassword)} className="space-y-6">
              <div>
                <label className="block text-white font-semibold mb-2">Enter OTP</label>
                <input
                  {...registerReset('otp', { 
                    required: 'OTP is required',
                    pattern: { value: /^\d{6}$/, message: 'OTP must be 6 digits' }
                  })}
                  className="form-input w-full px-4 py-3 rounded-xl text-white placeholder-gray-400 text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  disabled={loading}
                />
                {errorsReset.otp && (
                  <p className="text-red-400 text-sm mt-1">{errorsReset.otp.message}</p>
                )}
                <p className="text-gray-400 text-xs mt-2">
                  Check your email for the 6-digit code
                </p>
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">New Password</label>
                <input
                  {...registerReset('newPassword', { 
                    required: 'New password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  type="password"
                  className="form-input w-full px-4 py-3 rounded-xl text-white placeholder-gray-400"
                  placeholder="Enter new password"
                  disabled={loading}
                />
                {errorsReset.newPassword && (
                  <p className="text-red-400 text-sm mt-1">{errorsReset.newPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Confirm Password</label>
                <input
                  {...registerReset('confirmPassword', { 
                    required: 'Please confirm your password',
                    validate: value => value === newPassword || 'Passwords do not match'
                  })}
                  type="password"
                  className="form-input w-full px-4 py-3 rounded-xl text-white placeholder-gray-400"
                  placeholder="Confirm new password"
                  disabled={loading}
                />
                {errorsReset.confirmPassword && (
                  <p className="text-red-400 text-sm mt-1">{errorsReset.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex space-x-3">
                <motion.button
                  type="button"
                  onClick={() => {
                    setShowResetPassword(false)
                    setResetEmail('')
                  }}
                  className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-coral py-3 rounded-xl text-white font-semibold disabled:opacity-50"
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </motion.button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </section>
  )
}
