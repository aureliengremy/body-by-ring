'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestDB() {
  const [connected, setConnected] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function testConnection() {
      try {
        const { data, error } = await supabase.from('_test').select('*').limit(1)
        // PGRST116 = table not found, which is expected and means connection works
        if (error && (error.code === 'PGRST116' || error.message.includes('Could not find the table'))) {
          setConnected(true) // Connection successful!
          return
        }
        if (error) {
          throw error
        }
        setConnected(true)
      } catch (err: any) {
        setError(err.message)
        setConnected(false)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
      
      {connected === null && (
        <p className="text-yellow-600">Testing connection...</p>
      )}
      
      {connected === true && (
        <div className="text-green-600">
          <p className="text-lg">✅ Successfully connected to Supabase!</p>
          <p className="text-sm mt-2">Project: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
        </div>
      )}
      
      {connected === false && (
        <div className="text-red-600">
          <p className="text-lg">❌ Connection failed</p>
          <p className="text-sm mt-2">Error: {error}</p>
        </div>
      )}
    </div>
  )
}