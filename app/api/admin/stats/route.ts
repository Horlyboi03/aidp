import { NextResponse } from 'next/server'
import { getAllApplications, getApplicationStats } from '../../../../lib/postgres-database'

export async function GET() {
  try {
    const realStats = await getApplicationStats()
    
    // Calculate additional metrics
    const applications = await getAllApplications() as any[]
    const today = new Date().toDateString()
    const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    
    const todayApplications = applications.filter(app => 
      new Date(app.submittedAt).toDateString() === today
    ).length
    
    const thisWeekApplications = applications.filter(app => 
      new Date(app.submittedAt) >= thisWeek
    ).length
    
    // Calculate total grants awarded
    const approvedApplications = applications.filter(app => app.status === 'approved')
    const totalGrantsAwarded = approvedApplications.reduce((total, app) => {
      const amount = parseInt(app.grantAmount.replace(/[$,]/g, ''))
      return total + amount
    }, 0)
    
    const averageGrantAmount = approvedApplications.length > 0 
      ? Math.round(totalGrantsAwarded / approvedApplications.length)
      : 0
    
    const stats = {
      ...realStats,
      todayApplications,
      thisWeekApplications,
      totalGrantsAwarded: `${totalGrantsAwarded.toLocaleString()}`,
      averageGrantAmount: `${averageGrantAmount.toLocaleString()}`
    }
    
    return NextResponse.json({ stats })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
