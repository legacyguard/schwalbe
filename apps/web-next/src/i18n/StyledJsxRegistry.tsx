'use client'

import React from 'react'
import { StyleRegistry, createStyleRegistry } from 'styled-jsx'
import { useServerInsertedHTML } from 'next/navigation'

export function StyledJsxRegistry({ children }: { children: React.ReactNode }) {
  const [registry] = React.useState(() => createStyleRegistry())

  useServerInsertedHTML(() => {
    const styles = registry.styles()
    registry.flush()
    return <>{styles}</>
  })

  return <StyleRegistry registry={registry}>{children}</StyleRegistry>
}

