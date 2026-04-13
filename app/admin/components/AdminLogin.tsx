'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import React from 'react'
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
  const [showPassword, setShowPassword] = useState(false)
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [biometricEnrolled, setBiometricEnrolled] = useState(false)
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>()
  const { register: registerForgot, handleSubmit: handleSubmitForgot, formState: { errors: errorsForgot } } = useForm<ForgotPasswordData>()
  const { register: registerReset, handleSubmit: handleSubmitReset, formState: { errors: errorsReset }, watch } = useForm<ResetPasswordData>()

  const newPassword = watch('newPassword')

  // Check for biometric availability and enrollment on mount
  React.useEffect(() => {
    const checkBiometric = async () => {
      try {
        if (window.PublicKeyCredential) {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
          setBiometricAvailable(available)
          
          // Check if biometric is enrolled
          const enrolled = localStorage.getItem('adminBiometricEnrolled') === 'true'
          setBiometricEnrolled(enrolled)
          
          // If biometric is enrolled, try auto-login after a short delay
          if (enrolled && available) {
            const timer = setTimeout(() => {
              handleBiometricLogin()
            }, 1000)
            return () => clearTimeout(timer)
          }
        }
      } catch (error) {
        console.log('Biometric not available:', error)
      }
    }
    
    checkBiometric()
  }, [])

  const handleBiometricLogin = async () => {
    setLoading(true)
    try {
      // Generate a random challenge
      const challenge = new Uint8Array(32)
      crypto.getRandomValues(challenge)

      // Convert credential ID from base64
      const credentialIdStr = localStorage.getItem('adminCredentialId')
      if (!credentialIdStr) {
        toast.error('No biometric credential found. Please login with password first.')
        setLoading(false)
        return
      }

      // Convert credential ID from base64
      const binaryString = atob(credentialIdStr)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      try {
        // Request biometric authentication
        const assertion = await navigator.credentials.get({
          publicKey: {
            challenge: challenge,
            allowCredentials: [
              {
                id: bytes as unknown as BufferSource,
                type: 'public-key' as const,
                transports: ['internal'] as AuthenticatorTransport[]
              }
            ],
            userVerification: 'preferred',
            timeout: 60000
          }
        } as any)

        if (assertion) {
          // Biometric successful - use stored token
          const storedToken = localStorage.getItem('adminBiometricToken')
          if (storedToken) {
            localStorage.setItem('adminToken', storedToken)
            toast.success('✅ Biometric login successful!')
            onLogin()
          } else {
            toast.error('No stored credentials. Please login with password first.')
          }
        }
      } catch (error: any) {
        if (error.name === 'NotAllowedError') {
          console.log('Biometric authentication cancelled by user')
        } else {
          console.log('Biometric authentication failed:', error)
        }
      }
    } catch (error) {
      console.log('Biometric login error:', error)
    }
    setLoading(false)
  }

  const registerBiometric = async (username: string) => {
    try {
      const challenge = new Uint8Array(32)
      crypto.getRandomValues(challenge)

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: challenge,
          rp: {
            name: 'AIDP Admin',
            id: window.location.hostname
          },
          user: {
            id: new Uint8Array(16),
            name: username,
            displayName: 'AIDP Admin'
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },
            { alg: -257, type: 'public-key' }
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'preferred',
            residentKey: 'preferred'
          },
          timeout: 60000,
          attestation: 'direct'
        }
      } as any)

      if (credential) {
        // Store credential ID for future authentication
        const credentialId = credential.id as unknown as ArrayBuffer
        const credentialIdArray = new Uint8Array(credentialId)
        const binaryString = String.fromCharCode.apply(null, Array.from(credentialIdArray) as number[])
        localStorage.setItem('adminCredentialId', btoa(binaryString))
        localStorage.setItem('adminBiometricEnrolled', 'true')
        return true
      }
    } catch (error: any) {
      if (error.name !== 'NotAllowedError') {
        console.log('Biometric registration error:', error)
      }
    }
    return false
  }

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
        
        // Store token for biometric login
        localStorage.setItem('adminBiometricToken', result.token)
        
        // Try to register biometric if not already enrolled
        if (biometricAvailable && !biometricEnrolled) {
          const registered = await registerBiometric(data.username)
          if (registered) {
            toast.success('✅ Login successful! Biometric enabled for next login.')
          } else {
            toast.success('✅ Login successful!')
          }
        } else {
          toast.success('✅ Login successful!')
        }
        
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
      {/* Logo Header */}
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
                <div className="relative">
                  <input
                    {...register('password', { required: 'Password is required' })}
                    type={showPassword ? 'text' : 'password'}
                    className="form-input w-full px-4 py-3 pr-12 rounded-xl text-white placeholder-gray-400"
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
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
