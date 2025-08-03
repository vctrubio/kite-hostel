
'use client'

import { seedCreatePackages } from '@/actions/seed-actions'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { toast } from 'sonner'

export function SeedPackageForm() {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    const result = await seedCreatePackages()
    if (result.success) {
      toast.success(`10 packages created successfully!`)
    } else {
      toast.error(result.error)
    }
    setLoading(false)
  }

  return (
    <Button onClick={handleClick} disabled={loading}>
      {loading ? 'Creating...' : 'Create 10 Fake Packages'}
    </Button>
  )
}
