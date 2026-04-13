'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import FileUpload from './FileUpload'
import ApplicationStatus from './ApplicationStatus'
import toast from 'react-hot-toast'

interface FormData {
  fullName: string
  email: string
  phone: string
  country: string
  address: string
  homeAddress: string
  dateOfBirth: string
  gender: string
  occupation: string
  monthlyIncome: string
  maritalStatus: string
  grantAmount: string
  grantPurpose: string
  paymentMethod: string
  description?: string
  privacyAgreed: boolean
}

interface ApplicationFormProps {
  onBack: () => void
  user?: any
  token?: string | null
  onGuestSubmit?: (guestInfo: { fullName: string; email: string; applicationId: string }) => void
}

export default function ApplicationForm({ onBack, user, token, onGuestSubmit }: ApplicationFormProps) {
  const [submitted, setSubmitted] = useState(false)
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [applicationData, setApplicationData] = useState<any>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

  const grantAmounts = [
    '$100,000', '$150,000', '$200,000', '$250,000', 
    '$300,000', '$350,000', '$400,000', '$450,000'
  ]

  const onSubmit = async (data: FormData) => {
    console.log('Submitting application:', data)
    try {
      const loadingToast = toast.loading('Submitting your application...')
      
      const applicationPayload = {
        ...data,
        files: uploadedFiles.map(f => f.name),
        userId: user?.id
      }
      
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(applicationPayload)
      })
      
      console.log('Response status:', response.status)
      const result = await response.json()
      console.log('Response data:', result)
      
      toast.dismiss(loadingToast)
      
      if (response.ok && result.success) {
        if (user && token && result.id) {
          try {
            await fetch('/api/user/link-application', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ applicationId: result.id })
            })
          } catch (error) {
            console.error('Failed to link application to user:', error)
          }
        }
        
        setApplicationData(data)
        setApplicationId(result.id)
        setSubmitted(true)
        
        if (!user && onGuestSubmit) {
          onGuestSubmit({
            fullName: data.fullName,
            email: data.email,
            applicationId: result.id
          })
        }
        
        toast.success('Application submitted successfully!')
        console.log('Application submitted with ID:', result.id)
      } else {
        throw new Error(result.message || 'Failed to submit application')
      }
    } catch (error) {
      console.error('Submission error:', error)
      toast.error('Failed to submit application. Please try again.')
    }
  }

  if (submitted && applicationId) {
    return (
      <ApplicationStatus 
        applicationId={applicationId}
        applicantInfo={applicationData ? {
          fullName: applicationData.fullName,
          email: applicationData.email
        } : undefined}
        onBack={() => {
          setSubmitted(false)
          setApplicationId(null)
          setApplicationData(null)
        }} 
      />
    )
  }

  return (
    <section className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-effect rounded-3xl p-8 md:p-12"
        >
          <div className="flex items-center justify-between mb-8">
            <motion.button
              onClick={onBack}
              className="flex items-center text-coral-400 hover:text-coral-300 transition-colors"
              whileHover={{ x: -5 }}
            >
              ← Back to Program Info
            </motion.button>
            <h1 className="text-3xl md:text-4xl font-bold gradient-text">Grant Application</h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white font-semibold mb-2">Full Name *</label>
                <input
                  {...register('fullName', { required: 'Full name is required' })}
                  className="form-input w-full px-4 py-3 rounded-xl text-white placeholder-gray-400"
                  placeholder="Enter your full name"
                />
                {errors.fullName && <p className="text-red-400 text-sm mt-1">{errors.fullName.message}</p>}
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Email *</label>
                <input
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                  })}
                  type="email"
                  className="form-input w-full px-4 py-3 rounded-xl text-white placeholder-gray-400"
                  placeholder="Enter your email"
                />
                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white font-semibold mb-2">Phone Number *</label>
                <input
                  {...register('phone', { required: 'Phone number is required' })}
                  className="form-input w-full px-4 py-3 rounded-xl text-white placeholder-gray-400"
                  placeholder="Enter your phone number"
                />
                {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Country *</label>
                <input
                  {...register('country', { required: 'Country is required' })}
                  className="form-input w-full px-4 py-3 rounded-xl text-white placeholder-gray-400"
                  placeholder="Enter your country"
                />
                {errors.country && <p className="text-red-400 text-sm mt-1">{errors.country.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Mailing Address *</label>
              <textarea
                {...register('address', { required: 'Mailing address is required' })}
                className="form-input w-full px-4 py-3 rounded-xl text-white placeholder-gray-400 h-20 resize-none"
                placeholder="Enter your mailing address"
              />
              {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address.message}</p>}
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Home Address *</label>
              <textarea
                {...register('homeAddress', { required: 'Home address is required' })}
                className="form-input w-full px-4 py-3 rounded-xl text-white placeholder-gray-400 h-20 resize-none"
                placeholder="Enter your home address (street, city, state, zip code)"
              />
              {errors.homeAddress && <p className="text-red-400 text-sm mt-1">{errors.homeAddress.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white font-semibold mb-2">Date of Birth *</label>
                <input
                  {...register('dateOfBirth', { required: 'Date of birth is required' })}
                  type="date"
                  className="form-input w-full px-4 py-3 rounded-xl text-white"
                />
                {errors.dateOfBirth && <p className="text-red-400 text-sm mt-1">{errors.dateOfBirth.message}</p>}
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Gender *</label>
                <select
                  {...register('gender', { required: 'Gender is required' })}
                  className="form-input w-full px-4 py-3 rounded-xl text-white"
                >
                  <option value="">Select gender</option>
                  <option value="male" className="bg-gray-800">Male</option>
                  <option value="female" className="bg-gray-800">Female</option>
                  <option value="other" className="bg-gray-800">Other</option>
                  <option value="prefer-not-to-say" className="bg-gray-800">Prefer not to say</option>
                </select>
                {errors.gender && <p className="text-red-400 text-sm mt-1">{errors.gender.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white font-semibold mb-2">Marital Status *</label>
                <select
                  {...register('maritalStatus', { required: 'Marital status is required' })}
                  className="form-input w-full px-4 py-3 rounded-xl text-white"
                >
                  <option value="">Select marital status</option>
                  <option value="single" className="bg-gray-800">Single</option>
                  <option value="married" className="bg-gray-800">Married</option>
                  <option value="divorced" className="bg-gray-800">Divorced</option>
                  <option value="widowed" className="bg-gray-800">Widowed</option>
                  <option value="separated" className="bg-gray-800">Separated</option>
                </select>
                {errors.maritalStatus && <p className="text-red-400 text-sm mt-1">{errors.maritalStatus.message}</p>}
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Occupation *</label>
                <input
                  {...register('occupation', { required: 'Occupation is required' })}
                  className="form-input w-full px-4 py-3 rounded-xl text-white placeholder-gray-400"
                  placeholder="Enter your occupation"
                />
                {errors.occupation && <p className="text-red-400 text-sm mt-1">{errors.occupation.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Monthly Income *</label>
              <select
                {...register('monthlyIncome', { required: 'Monthly income is required' })}
                className="form-input w-full px-4 py-3 rounded-xl text-white"
              >
                <option value="">Select your monthly income range</option>
                <option value="under-1000" className="bg-gray-800">Under $1,000</option>
                <option value="1000-2500" className="bg-gray-800">$1,000 - $2,500</option>
                <option value="2500-5000" className="bg-gray-800">$2,500 - $5,000</option>
                <option value="5000-7500" className="bg-gray-800">$5,000 - $7,500</option>
                <option value="7500-10000" className="bg-gray-800">$7,500 - $10,000</option>
                <option value="over-10000" className="bg-gray-800">Over $10,000</option>
              </select>
              {errors.monthlyIncome && <p className="text-red-400 text-sm mt-1">{errors.monthlyIncome.message}</p>}
            </div>

            {/* Grant Request */}
            <div>
              <label className="block text-white font-semibold mb-2">Grant Amount *</label>
              <select
                {...register('grantAmount', { required: 'Please select a grant amount' })}
                className="form-input w-full px-4 py-3 rounded-xl text-white"
              >
                <option value="">Select grant amount</option>
                {grantAmounts.map((amount) => (
                  <option key={amount} value={amount} className="bg-gray-800">
                    {amount}
                  </option>
                ))}
              </select>
              {errors.grantAmount && <p className="text-red-400 text-sm mt-1">{errors.grantAmount.message}</p>}
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Payment Method *</label>
              <select
                {...register('paymentMethod', { required: 'Please select payment method' })}
                className="form-input w-full px-4 py-3 rounded-xl text-white"
              >
                <option value="">How would you like to receive your grant?</option>
                <option value="cash" className="bg-gray-800">Cash</option>
                <option value="cheque" className="bg-gray-800">Cheque</option>
              </select>
              {errors.paymentMethod && <p className="text-red-400 text-sm mt-1">{errors.paymentMethod.message}</p>}
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Grant Purpose *</label>
              <select
                {...register('grantPurpose', { required: 'Please select grant purpose' })}
                className="form-input w-full px-4 py-3 rounded-xl text-white"
              >
                <option value="">Select how you'll use the grant</option>
                <option value="medical" className="bg-gray-800">Medical Bills</option>
                <option value="housing" className="bg-gray-800">Buy a Home</option>
                <option value="business" className="bg-gray-800">Start a Business</option>
                <option value="education" className="bg-gray-800">Education/School</option>
                <option value="retirement" className="bg-gray-800">Retirement</option>
                <option value="debt" className="bg-gray-800">Pay Off Debt</option>
                <option value="other" className="bg-gray-800">Other</option>
              </select>
              {errors.grantPurpose && <p className="text-red-400 text-sm mt-1">{errors.grantPurpose.message}</p>}
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Additional Details</label>
              <textarea
                {...register('description')}
                className="form-input w-full px-4 py-3 rounded-xl text-white placeholder-gray-400 h-24 resize-none"
                placeholder="Provide any additional details about your grant request (optional)..."
              />
            </div>

            {/* File Upload */}
            <FileUpload onFilesChange={setUploadedFiles} />

            {/* Privacy Agreement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-effect rounded-xl p-6 border-l-4 border-blue-400"
            >
              <h3 className="text-xl font-bold text-blue-400 mb-4">📋 Privacy Policy & Terms</h3>
              <div className="space-y-3 text-gray-200 text-sm max-h-40 overflow-y-auto">
                <p><strong>Data Collection:</strong> We collect personal information to process your grant application and communicate with you about your application status.</p>
                <p><strong>Data Usage:</strong> Your information will be used solely for grant processing, verification, and communication purposes. We do not sell or share your data with third parties.</p>
                <p><strong>Data Security:</strong> We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
                <p><strong>Communication:</strong> By applying, you consent to receive communications from AIDP regarding your application status and grant-related information.</p>
                <p><strong>Processing Fee:</strong> You acknowledge that a processing fee is required before grant disbursement and that grant funds are not loans and do not require repayment.</p>
                <p><strong>Verification:</strong> You confirm that all information provided is accurate and complete. False information may result in application rejection.</p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/20">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    {...register('privacyAgreed', { required: 'You must agree to the privacy policy and terms to proceed' })}
                    type="checkbox"
                    className="mt-1 w-5 h-5 text-coral-500 bg-transparent border-2 border-gray-400 rounded focus:ring-coral-500 focus:ring-2"
                  />
                  <span className="text-white">
                    I have read, understood, and agree to the Privacy Policy and Terms of Service. I consent to the collection and processing of my personal data as described above. *
                  </span>
                </label>
                {errors.privacyAgreed && <p className="text-red-400 text-sm mt-2">{errors.privacyAgreed.message}</p>}
              </div>
            </motion.div>

            {/* Important Notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-effect rounded-xl p-6 border-l-4 border-coral-400"
            >
              <h3 className="text-xl font-bold text-coral-400 mb-3">📋 Important Notice</h3>
              <div className="space-y-3 text-gray-200">
                <p className="flex items-start space-x-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>Grant money is yours and <strong>never needs to be repaid</strong></span>
                </p>
                <p className="flex items-start space-x-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>Grant money is <strong>not taxable</strong> and bears no interest</span>
                </p>
                <p className="flex items-start space-x-2">
                  <span className="text-coral-400 font-bold">⚠</span>
                  <span><strong>Processing Fee Required:</strong> There is a one-time upfront processing fee that must be paid before your grant is released. This fee covers administrative costs and verification processes.</span>
                </p>
                <p className="flex items-start space-x-2">
                  <span className="text-blue-400 font-bold">ℹ</span>
                  <span>You will be contacted with payment details after your application is approved</span>
                </p>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              className="btn-coral w-full py-4 rounded-xl text-white font-semibold text-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Submit Application
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  )
}
