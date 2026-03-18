'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function ChangePassword() {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<PasswordData>()

  const newPassword = watch('newPassword')

  const onSubmit = async (data: PasswordData) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (data.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Password changed successfully!')
        reset()
      } else {
        toast.error(result.message || 'Failed to change password')
      }
    } catch (error) {
      toast.error('Failed to change password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-2xl p-4 md:p-6"
    >
      <h3 className="text-xl font-bold text-white mb-4">🔐 Change Admin Password</h3>
      <p className="text-gray-300 mb-6 text-sm">
        Update your admin password for security. Make sure to use a strong password.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-white font-semibold mb-2">Current Password *</label>
          <input
            {...register('currentPassword', { required: 'Current password is required' })}
            type="password"
            className="form-input w-full px-4 py-3 rounded-xl text-white placeholder-gray-400"
            placeholder="Enter your current password"
            disabled={loading}
          />
          {errors.currentPassword && (
            <p className="text-red-400 text-sm mt-1">{errors.currentPassword.message}</p>
          )}
        </div>

        <div>
          <label className="block text-white font-semibold mb-2">New Password *</label>
          <input
            {...register('newPassword', { 
              required: 'New password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' }
            })}
            type="password"
            className="form-input w-full px-4 py-3 rounded-xl text-white placeholder-gray-400"
            placeholder="Enter your new password"
            disabled={loading}
          />
          {errors.newPassword && (
            <p className="text-red-400 text-sm mt-1">{errors.newPassword.message}</p>
          )}
          <p className="text-gray-400 text-xs mt-1">Minimum 6 characters</p>
        </div>

        <div>
          <label className="block text-white font-semibold mb-2">Confirm New Password *</label>
          <input
            {...register('confirmPassword', { 
              required: 'Please confirm your new password',
              validate: value => value === newPassword || 'Passwords do not match'
            })}
            type="password"
            className="form-input w-full px-4 py-3 rounded-xl text-white placeholder-gray-400"
            placeholder="Confirm your new password"
            disabled={loading}
          />
          {errors.confirmPassword && (
            <p className="text-red-400 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          className="btn-coral w-full py-3 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
        >
          {loading ? 'Changing Password...' : 'Change Password'}
        </motion.button>
      </form>

      <div className="mt-6 p-4 bg-blue-500/20 rounded-xl border border-blue-500/30">
        <h4 className="text-white font-semibold mb-2">💡 Password Tips:</h4>
        <ul className="text-gray-300 text-sm space-y-1">
          <li>• Use at least 6 characters</li>
          <li>• Mix uppercase and lowercase letters</li>
          <li>• Include numbers and special characters</li>
          <li>• Don't use common words or personal information</li>
        </ul>
      </div>
    </motion.div>
  )
}
