import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const postgresUrl = process.env.POSTGRES_URL
    const postgresUrlNonPooling = process.env.POSTGRES_URL_NON_POOLING
    const postgresUser = process.env.POSTGRES_USER
    const postgresPassword = process.env.POSTGRES_PASSWORD
    const postgresHost = process.env.POSTGRES_HOST
    const postgresPort = process.env.POSTGRES_PORT
    const postgresDatabase = process.env.POSTGRES_DATABASE

    return NextResponse.json({
      success: true,
      message: 'Environment check',
      env: {
        POSTGRES_URL: postgresUrl ? '✅ SET' : '❌ NOT SET',
        POSTGRES_URL_NON_POOLING: postgresUrlNonPooling ? '✅ SET' : '❌ NOT SET',
        POSTGRES_USER: postgresUser ? '✅ SET' : '❌ NOT SET',
        POSTGRES_PASSWORD: postgresPassword ? '✅ SET' : '❌ NOT SET',
        POSTGRES_HOST: postgresHost ? '✅ SET' : '❌ NOT SET',
        POSTGRES_PORT: postgresPort ? '✅ SET' : '❌ NOT SET',
        POSTGRES_DATABASE: postgresDatabase ? '✅ SET' : '❌ NOT SET',
      },
      details: {
        postgresUrl: postgresUrl ? postgresUrl.substring(0, 50) + '...' : 'NOT SET',
        postgresHost,
        postgresPort,
        postgresDatabase,
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
