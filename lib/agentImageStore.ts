// Persistent storage for agent images
// Uses file-based storage similar to dataStore

import fs from 'fs'
import path from 'path'

class AgentImageStore {
  private agentImage: string | null = null
  private dataFile = path.join(process.cwd(), 'data', 'agent-image.json')

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
        const parsed = JSON.parse(data)
        this.agentImage = parsed.agentImage || null
        console.log('Loaded agent image from file:', this.agentImage ? 'Yes' : 'No')
      } else {
        console.log('No existing agent image file, starting with empty store')
      }
    } catch (error) {
      console.error('Error loading agent image data:', error)
      this.agentImage = null
    }
  }

  private saveData() {
    try {
      const data = {
        agentImage: this.agentImage,
        updatedAt: new Date().toISOString()
      }
      fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2))
      console.log('Saved agent image to file')
    } catch (error) {
      console.error('Error saving agent image data:', error)
    }
  }

  setAgentImage(imageUrl: string | null): void {
    console.log('Setting agent image in store:', imageUrl ? 'Yes' : 'No')
    this.agentImage = imageUrl
    this.saveData()
  }

  getAgentImage(): string | null {
    console.log('Getting agent image from store:', this.agentImage ? 'Yes' : 'No')
    return this.agentImage
  }

  // Debug method
  debug() {
    return {
      hasImage: !!this.agentImage,
      imageType: this.agentImage ? (this.agentImage.startsWith('data:image/') ? 'base64' : 'url') : 'none'
    }
  }
}

// Create a singleton instance
export const agentImageStore = new AgentImageStore()