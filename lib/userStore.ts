// User authentication and data store
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'

export interface User {
  id: string
  email: string
  password: string // hashed
  fullName: string
  phone: string
  country: string
  createdAt: string
  applications: string[] // application IDs
}

class UserStore {
  private users: User[] = []
  private dataFile = path.join(process.cwd(), 'data', 'users.json')

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
        this.users = JSON.parse(data)
        console.log('Loaded', this.users.length, 'users from file')
      } else {
        console.log('No existing users file, starting with empty store')
      }
    } catch (error) {
      console.error('Error loading users:', error)
      this.users = []
    }
  }

  private saveData() {
    try {
      fs.writeFileSync(this.dataFile, JSON.stringify(this.users, null, 2))
      console.log('Saved', this.users.length, 'users to file')
    } catch (error) {
      console.error('Error saving users:', error)
    }
  }

  async createUser(userData: Omit<User, 'id' | 'password' | 'createdAt' | 'applications'> & { password: string }): Promise<User | null> {
    try {
      // Check if user already exists
      if (this.users.find(u => u.email === userData.email)) {
        return null // User already exists
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10)

      const user: User = {
        id: `USER-${Date.now()}`,
        ...userData,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
        applications: []
      }

      this.users.push(user)
      this.saveData()
      console.log('Created user:', user.id)
      return user
    } catch (error) {
      console.error('Error creating user:', error)
      return null
    }
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = this.users.find(u => u.email === email)
      if (!user) {
        return null
      }

      const isValid = await bcrypt.compare(password, user.password)
      if (!isValid) {
        return null
      }

      console.log('User authenticated:', user.id)
      return user
    } catch (error) {
      console.error('Error authenticating user:', error)
      return null
    }
  }

  getUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id)
  }

  getUserByEmail(email: string): User | undefined {
    return this.users.find(u => u.email === email)
  }

  addApplicationToUser(userId: string, applicationId: string): boolean {
    const user = this.users.find(u => u.id === userId)
    if (user) {
      user.applications.push(applicationId)
      this.saveData()
      return true
    }
    return false
  }

  getUserApplications(userId: string): string[] {
    const user = this.users.find(u => u.id === userId)
    return user ? user.applications : []
  }
}

// Create a singleton instance
export const userStore = new UserStore()