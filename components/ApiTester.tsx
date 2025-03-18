'use client'

import React, { useState } from 'react'

interface ApiTesterProps {
  endpoint: string
  _method: string
}

interface _ApiResponse {
  status: number;
  data: unknown;
}

export default function ApiTester({ endpoint, _method }: ApiTesterProps) {
  const [response, setResponse] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testEndpoint = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)
    
    try {
      console.log('Testing endpoint:', endpoint) // Debug log
      
      const response = await fetch(`/api/proxy?endpoint=${encodeURIComponent(endpoint)}`, {
        method: 'GET', // Always use GET for the proxy request
      })
      
      console.log('Response status:', response.status) // Debug log
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Request failed')
      }
      
      setResponse(data as Record<string, unknown>)
    } catch (err) {
      console.error('API Test Error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const _handleSubmit = async (_method: string, _data: unknown) => {
    // Implementation
  }

  return (
    <div className="mt-2 space-y-2">
      <button
        onClick={testEndpoint}
        disabled={loading}
        className={`px-3 py-1 text-sm rounded border border-theme-text/30 
          hover:bg-theme-text/10 transition-colors ${loading ? 'opacity-50' : ''}`}
      >
        {loading ? 'Testing...' : 'Test Endpoint'}
      </button>
      
      {error && (
        <div className="text-red-400 text-sm font-mono mt-2 p-2 bg-red-400/10 rounded">
          {error}
        </div>
      )}
      
      {response && (
        <div className="font-mono text-sm mt-2">
          <div className="bg-theme-text/5 p-3 rounded overflow-auto max-h-48">
            <pre className="whitespace-pre-wrap break-words">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
} 