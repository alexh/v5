import type { MDXComponents } from 'mdx/types'
import ScrambleIn from './components/ScrambleIn'
import ParticleText from './components/ParticleText'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="text-4xl font-bold mb-6 font-forma text-theme-text">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-3xl font-semibold mb-4 mt-8 font-forma text-theme-text">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-2xl font-medium mb-3 mt-6 font-forma text-theme-text">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="text-lg mb-4 text-theme-text font-receipt-narrow leading-relaxed">
        {children}
      </p>
    ),
    a: ({ href, children }) => (
      <a 
        href={href} 
        className="underline hover:text-theme-secondary transition-colors text-theme-text"
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside mb-4 text-theme-text font-receipt-narrow space-y-2">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside mb-4 text-theme-text font-receipt-narrow space-y-2">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="text-lg text-theme-text">
        {children}
      </li>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-theme-secondary pl-4 italic mb-4 text-theme-text font-receipt-narrow">
        {children}
      </blockquote>
    ),
    code: ({ children }) => (
      <code className="bg-theme-secondary/20 px-2 py-1 rounded text-sm font-mono text-theme-text">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="bg-theme-secondary/20 p-4 rounded-lg overflow-x-auto mb-4 text-theme-text font-mono text-sm">
        {children}
      </pre>
    ),
    ScrambleIn,
    ParticleText,
    ...components,
  }
}