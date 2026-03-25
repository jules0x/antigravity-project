'use client'

import Link, { LinkProps } from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'

interface TransitionLinkProps extends LinkProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  'aria-label'?: string
  title?: string
}

export const TransitionLink = ({ children, href, className, style, ...props }: TransitionLinkProps) => {
  const router = useRouter()

  const handleTransition = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()

    // @ts-ignore - document.startViewTransition is not in all TS versions yet
    if (!document.startViewTransition) {
      router.push(href.toString())
      return
    }

    // @ts-ignore
    const transition = document.startViewTransition(() => {
      return new Promise((resolve) => {
        router.push(href.toString())
        // Next.js doesn't provide a way to wait for the page to render.
        // We use a small timeout to allow the initial render to start.
        setTimeout(resolve, 0)
      })
    })
  }

  return (
    <Link 
      {...props} 
      href={href} 
      className={className} 
      style={style}
      onClick={handleTransition}
    >
      {children}
    </Link>
  )
}
