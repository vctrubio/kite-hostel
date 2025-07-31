'use client';

import { createTeacher } from '@/actions/setters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { toast } from 'sonner';

export function SeedTeacherForm() {
  const [teacherName, setTeacherName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName) {
      toast.error('Please enter a teacher name.');
      return;
    }
    setLoading(true);
    const result = await createTeacher(teacherName);
    if (result.success) {
      toast.success(`Teacher ${result.teacher?.name} created successfully!`);
      setTeacherName('');
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-4">
      <Input
        type="text"
        placeholder="Enter teacher name"
        value={teacherName}
        onChange={(e) => setTeacherName(e.target.value)}
        disabled={loading}
      />
      <Button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Teacher'}
      </Button>
    </form>
  );
}
