import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
const buttonVariants = cva('inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45', { variants: { variant: { default: 'bg-primary text-primary-foreground hover:brightness-105', secondary: 'bg-secondary text-secondary-foreground hover:bg-accent', ghost: 'hover:bg-accent hover:text-accent-foreground', outline: 'border border-border bg-transparent hover:bg-accent', destructive: 'bg-destructive text-white hover:brightness-105' }, size: { default: 'h-9 px-4', sm: 'h-8 px-3 text-xs', lg: 'h-10 px-5', icon: 'size-9' } }, defaultVariants: { variant: 'default', size: 'default' } })
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}
export function Button({ className, variant, size, ...props }: ButtonProps) { return <button className={cn(buttonVariants({ variant, size }), className)} {...props} /> }
