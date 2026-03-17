'use client'

import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { useState } from 'react'

interface FileUploadProps {
  onFilesChange: (files: File[]) => void
}

export default function FileUpload({ onFilesChange }: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.pdf'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 3,
    onDrop: (acceptedFiles) => {
      const newFiles = [...uploadedFiles, ...acceptedFiles].slice(0, 3)
      setUploadedFiles(newFiles)
      onFilesChange(newFiles)
    }
  })

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index)
    setUploadedFiles(newFiles)
    onFilesChange(newFiles)
  }

  return (
    <div>
      <label className="block text-white font-semibold mb-4">
        Upload Identification Documents *
      </label>
      <p className="text-gray-400 text-sm mb-4">
        Upload your National ID, Driver's License, or Passport (Max 3 files)
      </p>

      <div
        {...getRootProps()}
        className={`form-input border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive ? 'border-coral-400 bg-coral-400/10' : 'border-gray-500 hover:border-coral-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-4xl mb-4">📄</div>
        {isDragActive ? (
          <p className="text-coral-400 font-semibold">Drop the files here...</p>
        ) : (
          <div>
            <p className="text-white font-semibold mb-2">
              Drag & drop files here, or click to select
            </p>
            <p className="text-gray-400 text-sm">
              Supports: JPG, PNG, PDF (Max 5MB each)
            </p>
          </div>
        )}
      </div>

      {/* File Preview */}
      {uploadedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 space-y-2"
        >
          {uploadedFiles.map((file, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-effect rounded-lg p-3 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">
                  {file.type.includes('pdf') ? '📄' : '🖼️'}
                </span>
                <div>
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-gray-400 text-sm">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <motion.button
                onClick={() => removeFile(index)}
                className="text-red-400 hover:text-red-300 font-bold text-xl"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ×
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}