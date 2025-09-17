'use client'

export const dynamic = 'force-dynamic'

export default function RootError({ error }: { error: Error & { digest?: string } }) {
  return (
    <div style={{ padding: 32 }}>
      <h1>Something went wrong</h1>
      <pre>{error?.message}</pre>
    </div>
  )
}


