'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeSwitcher } from '@/components/supabase-init/theme-switcher'

const links = [
  { href: '/', label: 'Home' },
  { href: '/students', label: 'Students' },
  
  { href: '/teachers', label: 'Teachers' },
  
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="font-bold text-xl">
            Kite Hostel
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`${pathname === href ? 'font-bold' : ''}`}>
              {label}
            </Link>
          ))}
          <ThemeSwitcher />
        </div>
      </div>
    </nav>
  )
}
