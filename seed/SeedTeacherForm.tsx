'use client'

import { createTeacher } from '@/actions/setters'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { toast } from 'sonner'

export function SeedTeacherForm() {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    const result = await createTeacher()
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