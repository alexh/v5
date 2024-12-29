type LogLevel = 'info' | 'error' | 'warn'

export function logRequest(
  method: string, 
  endpoint: string, 
  status: number, 
  duration: number,
  level: LogLevel = 'info'
) {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    method,
    endpoint,
    status,
    duration: `${duration}ms`,
  }

  // In production, you might want to use a proper logging service
  if (process.env.NODE_ENV === 'production') {
    // Send to logging service
    console[level](JSON.stringify(logEntry))
  } else {
    console[level](logEntry)
  }
} 