'use client'

import { seedCreateStudent } from '@/actions/seed-actions'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { toast } from 'sonner'

export function SeedStudentForm() {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    const result = await seedCreateStudent()
    if (result.success) {
      toast.success(`Student ${result.student?.name} created successfully!`)
    } else {
      toast.error(result.error)
    }
    setLoading(false)
  }

  return (
    <Button onClick={handleClick} disabled={loading}>
      {loading ? 'Creating...' : 'Create Fake Student'}
    </Button>
  )
}
