'use client'

import React, { useState } from 'react'
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

export default function ApiDisplay() {
  const [productsResponse, setProductsResponse] = useState<ApiResponse | null>(null)
  const [welcomeResponse, setWelcomeResponse] = useState<WelcomeResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showResponse, setShowResponse] = useState(false)
  const [pendingResponse, setPendingResponse] = useState<'welcome' | 'products' | null>(null)

  const testProducts = async () => {
    try {
      setShowResponse(false)
      setLoading(true)
      setPendingResponse('products')
      setError(null)
      
      const res = await fetch('/api/proxy?endpoint=/api/store/products')
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Request failed')
      }
      
      setProductsResponse(data)
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
      
      const res = await fetch('/api/proxy?endpoint=/api')
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Request failed')
      }
      
      setWelcomeResponse(data)
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

  return (
    <div className="space-y-8 font-receipt-narrow max-w-[800px] mx-auto px-4 lg:px-8">
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

      {/* RequestVisualizer - hidden on md and smaller screens */}
      <div className="hidden lg:block">
        <RequestVisualizer isLoading={loading} onComplete={handleAnimationComplete} />
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
              <table className="w-full text-left border-collapse">
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
              <div className="border-t border-theme-text/10 p-3 text-xs text-theme-text/50">
                Source: {productsResponse.source} | Total Products: {productsResponse.products.length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 