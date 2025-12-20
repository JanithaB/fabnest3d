'use client'

import Snowfall from 'react-snowfall'
import { useEffect, useState } from 'react'

export function SnowfallEffect() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      <Snowfall
        snowflakeCount={60}
        speed={[0.5, 2]}
        wind={[-0.5, 0.5]}
        radius={[0.5, 2.5]}
        color="rgba(100, 150, 255, 0.4)"
        style={{
          position: 'fixed',
          width: '100vw',
          height: '100vh',
        }}
      />
    </div>
  )
}

