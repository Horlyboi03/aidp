'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

interface ResetPasswordData {
  token: string
  newPassword: string
  confirmPassword: string
}

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [tokenFromUrl, setTokenFromUrl] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors }, watch } = useForm<ResetPasswordData>()

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      setTokenFromUrl(token)
    }
  }, [searchParams])

  const onSubmit = async (data: ResetPasswordData) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (data.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: data.token || tokenFromUrl,
          newPassword: data.newPassword
        })
      })

      const result = await response.json()

      if (result.success) {
        setShowSuccess(true)
        setTimeout(() => {
          router.push('/')
        }, 3000)
      } else {
        toast.error(result.message || 'Failed to reset password')
      }
    } catch (error) {
      toast.error('Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-8xl mb-6"
          >
            ✅
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-5xl font-bold text-white mb-4"
          >
            Password Changed Successfully!
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-2xl text-gray-300 mb-8"
          >
            You can now sign in with your new password
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-gray-400"
          >
            Redirecting to home page...
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-coral-50 via-white to-coral-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/95 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🔐</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-gray-600">Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {!tokenFromUrl && (
            <div>
              <label className="block text-gray-900 font-semibold mb-2">Reset Code *</label>
              <input
                {...register('token', { required: 'Reset code is required' })}
                type="text"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-coral-500 focus:outline-none bg-white text-gray-900 placeholder-gray-500 text-center text-2xl tracking-widest font-bold"
                placeholder="000000"
                maxLength={6}
              />
              {errors.token && (
                <p className="text-red-500 text-sm mt-1">{errors.token.message}</p>
              )}
              <p className="text-gray-500 text-sm mt-2">
                Enter the 6-digit code from your email
              </p>
            </div>
          )}

          <div>
            <label className="block text-gray-900 font-semibold mb-2">New Password *</label>
            <input
              {...register('newPassword', { 
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
              type="password"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-coral-500 focus:outline-none bg-white text-gray-900 placeholder-gray-500"
              placeholder="Enter new password"
            />
            {errors.newPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-900 font-semibold mb-2">Confirm Password *</label>
            <input
              {...register('confirmPassword', { required: 'Please confirm your password' })}
              type="password"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-coral-500 focus:outline-none bg-white text-gray-900 placeholder-gray-500"
              placeholder="Confirm new password"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            className="btn-coral w-full py-3 rounded-xl text-white font-semibold"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </motion.button>

          <button
            type="button"
            onClick={() => router.push('/')}
            className="w-full text-coral-600 hover:text-coral-700 font-semibold"
          >
            ← Back to Home
          </button>
        </form>

        <div className="mt-6 p-4 bg-coral-50 rounded-xl">
          <p className="text-sm text-gray-700">
            <strong>Need help?</strong> Contact our Program Director:
          </p>
          <p className="text-sm text-coral-600 font-semibold mt-1">
            Mary George - maryygeorge193@gmail.com
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-coral-50 via-white to-coral-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
