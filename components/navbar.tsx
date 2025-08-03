'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeSwitcher } from '@/components/supabase-init/theme-switcher'

const links = [
  // Schema-related links
  { href: '/students', label: 'Students' },
  { href: '/teachers', label: 'Teachers' },
  { href: '/packages', label: 'Packages' },
  { href: '/booking', label: 'Booking' },
  { href: '/users', label: 'Users' },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="p-4">
      <div className="container mx-auto">
        {/* Top row: Home and Theme Switcher */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <Link href="/" className="font-bold text-xl">
              Kite Hostel
            </Link>
          </div>
          <ThemeSwitcher />
        </div>

        {/* Bottom row: Schema-related links */}
        <div className="flex items-center space-x-4">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`${pathname === href ? 'font-bold' : ''}`}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
