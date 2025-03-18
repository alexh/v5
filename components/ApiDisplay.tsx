'use client'

import React, { useState } from 'react'
import RequestParticles3D from './RequestParticles3D'
import RequestVisualizer from './RequestVisualizer'

interface Product {
  id: number
  title: string
  price?: string
  description: string
  vendor: string
  product_type: string
  has_stock: boolean
  url: string
  variants: Array<{
    title: string
    price: string
    in_stock: boolean
    inventory_quantity: number
  }>
}

interface ApiResponse {
  products: Product[]
  source: string
}

interface WelcomeResponse {
  message: string
  version: string
  documentation: string
}

interface RequestStats {
  duration: number
  size: number
  status: number
  method: string
}

interface RequestHistory {
  endpoint: string
  timestamp: Date
  stats: RequestStats
}

export default function ApiDisplay() {
  const [productsResponse, setProductsResponse] = useState<ApiResponse | null>(null)
  const [welcomeResponse, setWelcomeResponse] = useState<WelcomeResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showResponse, setShowResponse] = useState(false)
  const [pendingResponse, setPendingResponse] = useState<'welcome' | 'products' | null>(null)
  const [welcomeStats, setWelcomeStats] = useState<RequestStats | null>(null)
  const [productsStats, setProductsStats] = useState<RequestStats | null>(null)
  const [requestHistory, setRequestHistory] = useState<RequestHistory[]>([])

  const testProducts = async () => {
    try {
      setShowResponse(false)
      setLoading(true)
      setPendingResponse('products')
      setError(null)
      
      const startTime = performance.now()
      const res = await fetch('/api/proxy?endpoint=/api/store/products')
      const data = await res.json()
      const endTime = performance.now()
      
      if (!res.ok) {
        throw new Error(data.error || 'Request failed')
      }
      
      const stats = { 
        duration: Math.round(endTime - startTime),
        size: new Blob([JSON.stringify(data)]).size / 1024,
        status: res.status,
        method: 'GET'
      }
      setProductsStats(stats)
      setProductsResponse(data)
      addToHistory('/api/store/products', stats)
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch')
      setLoading(false)
      setPendingResponse(null)
      setShowResponse(true)
    }
  }

  const testWelcome = async () => {
    try {
      setShowResponse(false)
      setLoading(true)
      setPendingResponse('welcome')
      setError(null)
      
      const startTime = performance.now()
      const res = await fetch('/api/proxy?endpoint=/api')
      const data = await res.json()
      const endTime = performance.now()
      
      if (!res.ok) {
        throw new Error(data.error || 'Request failed')
      }
      
      const stats = { 
        duration: Math.round(endTime - startTime),
        size: new Blob([JSON.stringify(data)]).size / 1024,
        status: res.status,
        method: 'GET'
      }
      setWelcomeStats(stats)
      setWelcomeResponse(data)
      addToHistory('/api', stats)
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch')
      setLoading(false)
      setPendingResponse(null)
      setShowResponse(true)
    }
  }

  const StockIndicator = ({ inStock }: { inStock: boolean }) => (
    <div className="flex items-center gap-2">
      <div className={`w-4 h-4 ${inStock ? 'bg-green-600' : 'bg-red-600'}`}></div>
      <span className="text-white">{inStock ? 'Yes' : 'No'}</span>
    </div>
  )

  const handleAnimationComplete = () => {
    console.log('Animation complete')
    setShowResponse(true)
    setLoading(false)
    setPendingResponse(null)
  }

  const StatusBadge = ({ status }: { status: number }) => {
    const getStatusColor = (status: number) => {
      if (status >= 200 && status < 300) return 'bg-green-500/20 text-green-400'
      if (status >= 300 && status < 400) return 'bg-blue-500/20 text-blue-400'
      if (status >= 400 && status < 500) return 'bg-yellow-500/20 text-yellow-400'
      return 'bg-red-500/20 text-red-400'
    }

    return (
      <span className={`px-2 py-1 rounded ${getStatusColor(status)} font-mono text-xs`}>
        {status}
      </span>
    )
  }

  const RequestStats = ({ stats }: { stats: RequestStats }) => (
    <div className="flex items-center gap-4 text-xs text-theme-text/50 border-t border-theme-text/10 p-3">
      <StatusBadge status={stats.status} />
      <span className="font-mono">{stats.method}</span>
      <span>Duration: {stats.duration}ms</span>
      <span>Size: {stats.size.toFixed(1)}KB</span>
    </div>
  )

  const addToHistory = (endpoint: string, stats: RequestStats) => {
    console.log('Adding to history:', { endpoint, stats })
    setRequestHistory(prev => {
      const newHistory = [
        { endpoint, timestamp: new Date(), stats },
        ...prev.slice(0, 4)
      ]
      console.log('New history:', newHistory)
      return newHistory
    })
  }

  const RequestHistoryPanel = ({ history }: { history: RequestHistory[] }) => {
    if (history.length === 0) return null
    
    return (
      <div className="border border-theme-text/30 p-4 rounded">
        <h2 className="text-2xl mb-4">Recent Requests</h2>
        <div className="space-y-2">
          {history.map((req, i) => (
            <div key={i} className="bg-theme-text/5 p-3 rounded flex items-center justify-between">
              <div>
                <span className="font-mono text-sm">{req.endpoint}</span>
                <div className="text-xs text-theme-text/50">
                  {new Date(req.timestamp).toLocaleTimeString()}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={req.stats.status} />
                <span className="text-sm">{req.stats.duration}ms</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const ResponseTimeGraph = ({ history }: { history: RequestHistory[] }) => {
    if (history.length === 0) return null

    // Group requests by endpoint
    const endpointStats = Object.entries(
      history.reduce((acc, req) => {
        if (!acc[req.endpoint]) {
          acc[req.endpoint] = { requests: [], total: 0 }
        }
        acc[req.endpoint].requests.push(req)
        acc[req.endpoint].total += req.stats.duration
        return acc
      }, {} as Record<string, { requests: RequestHistory[], total: number }>)
    ).map(([endpoint, stats]) => ({
      endpoint,
      requests: stats.requests,
      average: Math.round(stats.total / stats.requests.length)
    }))

    const maxDuration = Math.max(...history.map(h => h.stats.duration))
    
    return (
      <div className="border border-theme-text/30 p-4 rounded">
        <h2 className="text-2xl mb-8">Response Times</h2>
        <div className="space-y-12">
          {endpointStats.map(({ endpoint, requests, average }) => (
            <div key={endpoint} className="space-y-2">
              <div className="font-mono text-sm opacity-70">{endpoint}</div>
              {/* Individual request bars */}
              <div className="space-y-1">
                {requests.map((req, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-24 font-mono text-xs opacity-50 text-right">
                      {new Date(req.timestamp).toLocaleTimeString()}
                    </div>
                    <div className="flex-1 h-6 bg-theme-text/5">
                      <div
                        className="h-full bg-[#1a8870]"
                        style={{
                          width: `${(req.stats.duration / maxDuration) * 100}%`,
                          minWidth: '40px'
                        }}
                      />
                    </div>
                    <div className="w-20 font-mono text-sm text-right">
                      {req.stats.duration}ms
                    </div>
                  </div>
                ))}
              </div>
              {/* Average line */}
              <div className="pl-28 text-xs opacity-50 font-mono border-t border-theme-text/10 pt-2">
                average: {average}ms ({requests.length} {requests.length === 1 ? 'request' : 'requests'})
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 font-receipt-narrow max-w-[1200px] ml-32 lg:ml-48">
      {/* Globe and visualizer container */}
      <div className="relative w-full h-[400px] mb-12">
        <RequestParticles3D isLoading={loading} onComplete={handleAnimationComplete} />
        <div className="absolute inset-0 pointer-events-none">
          <RequestVisualizer isLoading={loading} onComplete={handleAnimationComplete} />
        </div>
      </div>

      {/* Rest of the content */}
      <div className="flex-1 space-y-8">
        {/* API Info Section */}
        <div className="border border-theme-text/30 p-4 rounded">
          <h2 className="text-2xl mb-4">Materials API</h2>
          <p className="text-sm mb-4 opacity-70">
            The Materials API provides access to product data and inventory information.
            All endpoints require an API key for authentication.
          </p>
          
          <div className="font-mono text-sm bg-theme-text/5 p-3 rounded">
            <p>Base URL: <code>https://api.materials.nyc</code></p>
          </div>
        </div>

        {/* Welcome Endpoint Section */}
        <div className="border border-theme-text/30 p-4 rounded">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl">GET /api</h2>
              <p className="text-sm opacity-70 mt-1">Returns API welcome message and version information</p>
            </div>
            <button 
              type="button"
              onClick={testWelcome}
              disabled={loading}
              className={`px-4 py-2 border rounded transition-colors ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-theme-text/10'
              }`}
            >
              {loading && pendingResponse === 'welcome' ? 'Loading...' : 'Test Endpoint'}
            </button>
          </div>

          {showResponse && pendingResponse === null && welcomeResponse && (
            <div className="font-mono mt-4">
              <div className="bg-black rounded p-4">
                <pre className="text-theme-text whitespace-pre-wrap">
                  {JSON.stringify(welcomeResponse, null, 2)}
                </pre>
                {welcomeStats && <RequestStats stats={welcomeStats} />}
              </div>
            </div>
          )}
        </div>

        {/* Products Endpoint Section */}
        <div className="border border-theme-text/30 p-4 rounded">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl">GET /api/store/products</h2>
              <p className="text-sm opacity-70 mt-1">Retrieves all products from the Utility Materials catalog</p>
            </div>
            <button 
              type="button"
              onClick={testProducts}
              disabled={loading}
              className={`px-4 py-2 border rounded transition-colors ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-theme-text/10'
              }`}
            >
              {loading && pendingResponse === 'products' ? 'Loading...' : 'Test Endpoint'}
            </button>
          </div>

          {showResponse && pendingResponse === null && error && (
            <div className="p-4 bg-red-500/10 text-red-400 rounded font-mono">
              <strong>Error:</strong> {error}
            </div>
          )}

          {showResponse && pendingResponse === null && productsResponse && (
            <div className="font-mono">
              <div className="bg-black rounded overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-theme-text/20">
                      <th className="p-3 text-theme-text/70">Title</th>
                      <th className="p-3 text-theme-text/70">Type</th>
                      <th className="p-3 text-theme-text/70">Price</th>
                      <th className="p-3 text-theme-text/70">Stock</th>
                      <th className="p-3 text-theme-text/70">Variants</th>
                    </tr>
                  </thead>
                  <tbody className="text-theme-text">
                    {productsResponse.products.map(product => (
                      <tr key={product.id} className="border-b border-theme-text/10 last:border-0">
                        <td className="p-3 whitespace-nowrap">{product.title}</td>
                        <td className="p-3 whitespace-nowrap opacity-70">{product.product_type}</td>
                        <td className="p-3 whitespace-nowrap">${product.variants[0].price}</td>
                        <td className="p-3 whitespace-nowrap">
                          <StockIndicator inStock={product.has_stock} />
                        </td>
                        <td className="p-3">
                          <div className="text-xs space-y-1">
                            {product.variants.map(v => (
                              <div key={v.title} className="flex items-center gap-2">
                                <div className={`w-2 h-2 ${v.in_stock ? 'bg-green-600' : 'bg-red-600'}`}></div>
                                <span>{v.title}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-between border-t border-theme-text/10 p-3 text-xs text-theme-text/50">
                  <div>
                    Source: {productsResponse.source} | Total Products: {productsResponse.products.length}
                  </div>
                  {productsStats && (
                    <div className="flex gap-4">
                      <span>Duration: {productsStats.duration}ms</span>
                      <span>Size: {productsStats.size.toFixed(1)}KB</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* History panels remain the same */}
        <RequestHistoryPanel history={requestHistory} />
        <ResponseTimeGraph history={requestHistory} />
      </div>
    </div>
  )
} 