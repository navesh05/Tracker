import * as React from 'react'
import { cn } from '@/lib/utils'
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) { return <section className={cn('surface', className)} {...props} /> }
export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) { return <div className={cn('surface-header', className)} {...props} /> }
export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) { return <h3 className={cn('surface-title', className)} {...props} /> }
export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) { return <p className={cn('surface-description', className)} {...props} /> }
export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) { return <div className={cn('surface-content', className)} {...props} /> }
