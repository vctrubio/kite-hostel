
'use client'

import { createPackages } from '@/actions/setters'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { toast } from 'sonner'

export function SeedPackageForm() {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    const result = await createPackages()
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
