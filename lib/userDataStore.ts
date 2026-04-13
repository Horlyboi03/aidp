// Persistent user data store for authentication
import fs from 'fs'
import path from 'path'

export interface User {
  id: string
  fullName: string
  email: string
  phone: string
  country: string
  password: string
  applications: string
  createdAt: string
}

class UserDataStore {
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
        console.log('✅ Loaded', this.users.length, 'users from file')
      } else {
        console.log('📝 No existing users file, starting with empty store')
      }
    } catch (error) {
      console.error('❌ Error loading users:', error)
      this.users = []
    }
  }

  private saveData() {
    try {
      fs.writeFileSync(this.dataFile, JSON.stringify(this.users, null, 2))
      console.log('✅ Saved', this.users.length, 'users to file')
    } catch (error) {
      console.error('❌ Error saving users:', error)
    }
  }

  addUser(user: User): void {
    console.log('➕ Adding user to store:', user.email)
    this.users.push(user)
    this.saveData()
    console.log('📊 Total users in store:', this.users.length)
  }

  getUserByEmail(email: string): User | undefined {
    const user = this.users.find(u => u.email === email)
    console.log('🔍 Looking for user:', email, 'found:', !!user)
    return user
  }

  getUserById(id: string): User | undefined {
    const user = this.users.find(u => u.id === id)
    console.log('🔍 Looking for user by ID:', id, 'found:', !!user)
    return user
  }

  getAllUsers(): User[] {
    return [...this.users]
  }

  debug() {
    console.log('📋 UserDataStore debug - users:', this.users.map(u => ({ id: u.id, email: u.email, name: u.fullName })))
    return {
      count: this.users.length,
      users: this.users.map(u => ({ id: u.id, email: u.email, name: u.fullName }))
    }
  }
}

// Create a singleton instance
export const userDataStore = new UserDataStore()
