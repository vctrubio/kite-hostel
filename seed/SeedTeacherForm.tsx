'use client'

import { seedCreateTeacher } from '@/actions/seed-actions'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { toast } from 'sonner'

export function SeedTeacherForm() {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    const result = await seedCreateTeacher()
    if (result.success) {
      toast.success(`Teacher ${result.teacher?.name} created successfully!`)
    } else {
      toast.error(result.error)
    }
    setLoading(false)
  }

  return (
    <Button onClick={handleClick} disabled={loading}>
      {loading ? 'Creating...' : 'Create Fake Teacher'}
    </Button>
  )
}