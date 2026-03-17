// Simple persistent data store for demo purposes
// In a real application, this would be a database

import fs from 'fs'
import path from 'path'

export interface Application {
  id: string
  fullName: string
  email: string
  phone: string
  country: string
  address: string
  dateOfBirth: string
  occupation: string
  monthlyIncome: string
  maritalStatus: string
  grantAmount: string
  grantPurpose: string
  paymentMethod: string
  description?: string
  files?: string[]
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  updatedAt?: string
  privacyAgreed: boolean
}

class DataStore {
  private applications: Application[] = []
  private dataFile = path.join(process.cwd(), 'data', 'applications.json')

  constructor() {
    this.loadData()
  }

  private loadData() {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(this.dataFile)
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
      }

      // Load existing data
      if (fs.existsSync(this.dataFile)) {
        const data = fs.readFileSync(this.dataFile, 'utf8')
        this.applications = JSON.parse(data)
        console.log('Loaded', this.applications.length, 'applications from file')
      } else {
        console.log('No existing data file, starting with empty store')
      }
    } catch (error) {
      console.error('Error loading data:', error)
      this.applications = []
    }
  }

  private saveData() {
    try {
      fs.writeFileSync(this.dataFile, JSON.stringify(this.applications, null, 2))
      console.log('Saved', this.applications.length, 'applications to file')
    } catch (error) {
      console.error('Error saving data:', error)
    }
  }

  addApplication(application: Application): void {
    console.log('Adding application to dataStore:', application.id)
    this.applications.push(application)
    this.saveData()
    console.log('Total applications in store:', this.applications.length)
  }

  getApplications(): Application[] {
    console.log('Getting applications from store, count:', this.applications.length)
    return [...this.applications] // Return a copy to prevent external mutations
  }

  getApplicationById(id: string): Application | undefined {
    const app = this.applications.find(app => app.id === id)
    console.log('Getting application by ID:', id, 'found:', !!app)
    return app
  }

  updateApplicationStatus(id: string, status: 'pending' | 'approved' | 'rejected'): boolean {
    const appIndex = this.applications.findIndex(app => app.id === id)
    if (appIndex !== -1) {
      this.applications[appIndex].status = status
      this.applications[appIndex].updatedAt = new Date().toISOString()
      this.saveData()
      console.log('Updated application status:', id, 'to', status)
      return true
    }
    console.log('Application not found for status update:', id)
    return false
  }

  getStats() {
    const total = this.applications.length
    const pending = this.applications.filter(app => app.status === 'pending').length
    const approved = this.applications.filter(app => app.status === 'approved').length
    const rejected = this.applications.filter(app => app.status === 'rejected').length

    console.log('Stats:', { total, pending, approved, rejected })
    return {
      total,
      pending,
      approved,
      rejected
    }
  }

  // Debug method to check store state
  debug() {
    console.log('DataStore debug - applications:', this.applications.map(app => ({ id: app.id, name: app.fullName, status: app.status })))
    return {
      count: this.applications.length,
      applications: this.applications.map(app => ({ id: app.id, name: app.fullName, status: app.status }))
    }
  }
}

// Create a singleton instance
export const dataStore = new DataStore()