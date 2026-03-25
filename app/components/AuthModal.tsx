'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

interface SignUpData {
  fullName: string
  email: string
  phone: string
  country: string
  password: string
  confirmPassword: string
}

interface SignInData {
  email: string
  password: string
}

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuthSuccess: (user: any, token: string) => void
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(true)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const signUpForm = useForm<SignUpData>()
  const signInForm = useForm<SignInData>()
  const forgotPasswordForm = useForm<{ email: string }>()

  const onSignUp = async (data: SignUpData) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          country: data.country,
          password: data.password
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Account created successfully! Please sign in.')
        setIsSignUp(false)
        signUpForm.reset()
      } else {
        toast.error(result.message || 'Failed to create account')
      }
    } catch (error) {
      toast.error('Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  const onSignIn = async (data: SignInData) => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Signed in successfully!')
        onAuthSuccess(result.user, result.token)
        onClose()
        signInForm.reset()
      } else {
        toast.error(result.message || 'Failed to sign in')
      }
    } catch (error) {
      toast.error('Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  const onForgotPassword = async (data: { email: string }) => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Password reset instructions sent to your email!')
        setIsForgotPassword(false)
        forgotPasswordForm.reset()
      } else {
        toast.error(result.message || 'Failed to send reset email')
      }
    } catch (error) {
      toast.error('Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white/95 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {isForgotPassword ? 'Reset Password' : isSignUp ? 'Create Account' : 'Sign In'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-gray-900 text-2xl"
              >
                ×
              </button>
            </div>

            {isForgotPassword ? (
              <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPassword)} className="space-y-4">
                <p className="text-gray-700 mb-4">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>
                
                <div>
                  <label className="block text-gray-900 font-semibold mb-2">Email *</label>
                  <input
                    {...forgotPasswordForm.register('email', { 
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                    })}
                    type="email"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-coral-500 focus:outline-none bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Enter your email"
                  />
                  {forgotPasswordForm.formState.errors.email && (
                    <p className="text-red-400 text-sm mt-1">{forgotPasswordForm.formState.errors.email.message}</p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="btn-coral w-full py-3 rounded-xl text-white font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? 'Sending...' : 'Send Reset Instructions'}
                </motion.button>

                <button
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="w-full text-coral-600 hover:text-coral-700 font-semibold"
                >
                  ← Back to Sign In
                </button>
              </form>
            ) : isSignUp ? (
              <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
                <div>
                  <label className="block text-gray-900 font-semibold mb-2">Full Name *</label>
                  <input
                    {...signUpForm.register('fullName', { required: 'Full name is required' })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-coral-500 focus:outline-none bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Enter your full name"
                  />
                  {signUpForm.formState.errors.fullName && (
                    <p className="text-red-400 text-sm mt-1">{signUpForm.formState.errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-900 font-semibold mb-2">Email *</label>
                  <input
                    {...signUpForm.register('email', { 
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                    })}
                    type="email"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-coral-500 focus:outline-none bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Enter your email"
                  />
                  {signUpForm.formState.errors.email && (
                    <p className="text-red-400 text-sm mt-1">{signUpForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-900 font-semibold mb-2">Phone *</label>
                  <input
                    {...signUpForm.register('phone', { required: 'Phone number is required' })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-coral-500 focus:outline-none bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Enter your phone number"
                  />
                  {signUpForm.formState.errors.phone && (
                    <p className="text-red-400 text-sm mt-1">{signUpForm.formState.errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-900 font-semibold mb-2">Country *</label>
                  <input
                    {...signUpForm.register('country', { required: 'Country is required' })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-coral-500 focus:outline-none bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Enter your country"
                  />
                  {signUpForm.formState.errors.country && (
                    <p className="text-red-400 text-sm mt-1">{signUpForm.formState.errors.country.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-900 font-semibold mb-2">Password *</label>
                  <input
                    {...signUpForm.register('password', { 
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    })}
                    type="password"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-coral-500 focus:outline-none bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Enter your password"
                  />
                  {signUpForm.formState.errors.password && (
                    <p className="text-red-400 text-sm mt-1">{signUpForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-900 font-semibold mb-2">Confirm Password *</label>
                  <input
                    {...signUpForm.register('confirmPassword', { required: 'Please confirm your password' })}
                    type="password"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-coral-500 focus:outline-none bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Confirm your password"
                  />
                  {signUpForm.formState.errors.confirmPassword && (
                    <p className="text-red-400 text-sm mt-1">{signUpForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="btn-coral w-full py-3 rounded-xl text-white font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </motion.button>
              </form>
            ) : (
              <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
                <div>
                  <label className="block text-gray-900 font-semibold mb-2">Email *</label>
                  <input
                    {...signInForm.register('email', { 
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                    })}
                    type="email"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-coral-500 focus:outline-none bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Enter your email"
                  />
                  {signInForm.formState.errors.email && (
                    <p className="text-red-400 text-sm mt-1">{signInForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-900 font-semibold mb-2">Password *</label>
                  <input
                    {...signInForm.register('password', { required: 'Password is required' })}
                    type="password"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-coral-500 focus:outline-none bg-white text-gray-900 placeholder-gray-500"
                    placeholder="Enter your password"
                  />
                  {signInForm.formState.errors.password && (
                    <p className="text-red-400 text-sm mt-1">{signInForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-coral-600 hover:text-coral-700 text-sm font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="btn-coral w-full py-3 rounded-xl text-white font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </motion.button>
              </form>
            )}

            {!isForgotPassword && (
              <div className="mt-6 text-center">
                <p className="text-gray-700">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                  <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-coral-600 hover:text-coral-700 ml-2 font-semibold"
                  >
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </button>
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}