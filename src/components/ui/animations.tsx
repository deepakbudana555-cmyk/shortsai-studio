'use client'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Props { children: ReactNode; className?: string; delay?: number; direction?: 'up'|'down'|'left'|'right' }

export function FadeIn({ children, className, delay = 0, direction = 'up' }: Props) {
  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 24 : direction === 'down' ? -24 : 0,
      x: direction === 'left' ? 24 : direction === 'right' ? -24 : 0,
    },
    visible: { opacity: 1, y: 0, x: 0, transition: { duration: 0.6, delay, ease: [0.21,0.47,0.32,0.98] } },
  }
  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={variants} className={className}>
      {children}
    </motion.div>
  )
}

export function ScaleIn({ children, className, delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: [0.21,0.47,0.32,0.98] }}
      className={className}
    >{children}</motion.div>
  )
}

export function StaggerChildren({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className={className}
    >{children}</motion.div>
  )
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
      className={className}
    >{children}</motion.div>
  )
}

export function FloatAnimation({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className={className}>
      {children}
    </motion.div>
  )
}

export function GlowPulse({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      animate={{ boxShadow: ['0 0 20px rgba(229,25,42,0.2)', '0 0 40px rgba(229,25,42,0.5)', '0 0 20px rgba(229,25,42,0.2)'] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      className={cn(className)}
    >{children}</motion.div>
  )
}
