import React from 'react';
import { FlagIcon } from '@/svgs/FlagIcon';
import { KiteIcon } from '@/svgs/KiteIcon';

export interface TableHeader {
  title: string | React.ReactElement;
  key: string;
  sortable?: boolean;
}

export function getEntityColumnHeaders(entityName: string): TableHeader[] {
  switch (entityName.toLowerCase()) {
    case 'student':
      return [
        { title: "Select", key: "select", sortable: false },
        { title: "Date", key: "created_at", sortable: true },
        { title: "Name", key: "name", sortable: true },
        { title: "Description", key: "desc", sortable: false },
        { title: "Bookings", key: "bookings", sortable: true },
        { title: "Active Booking", key: "active_booking", sortable: false },
        { title: "Actions", key: "actions", sortable: false },
      ];
    case 'teacher':
      return [
        { title: "Date", key: "created_at", sortable: true },
        { title: "Name", key: "name", sortable: true },
        { 
          title: React.createElement('div', 
            { className: 'flex items-center gap-2' },
            React.createElement(FlagIcon, { className: 'w-5 h-5' }),
            'Lessons'
          ), 
          key: "lessonCount", 
          sortable: true 
        },
        { 
          title: React.createElement('div', 
            { className: 'flex items-center gap-2' },
            React.createElement(KiteIcon, { className: 'w-5 h-5' }),
            'Events'
          ), 
          key: "eventsAndHours", 
          sortable: true 
        },
        { title: "Status", key: "status", sortable: true },
        { title: "Actions", key: "actions", sortable: false },
      ];
    case 'package':
      return [
        { title: "Description", key: "description", sortable: true },
        { title: "Kites", key: "capacity_kites", sortable: true },
        { title: "Students", key: "capacity_students", sortable: true },
        { title: "Duration", key: "duration", sortable: true },
        { title: "Price", key: "price_per_student", sortable: true },
        { title: "Rate/h", key: "hourly_rate", sortable: true },
        { title: "Bookings", key: "bookingCount", sortable: true },
        { title: "Actions", key: "actions", sortable: false },
      ];
    case 'payment':
      return [
        { title: "Date", key: "created_at", sortable: true },
        { title: "Teacher", key: "teacher", sortable: true },
        { title: "Amount", key: "amount", sortable: true },
        { title: "Actions", key: "actions", sortable: false },
      ];
    case 'kite':
      return [
        { title: "Date", key: "created_at", sortable: true },
        { title: "Model", key: "model", sortable: true },
        { title: "Size", key: "size", sortable: true },
        { title: "Serial ID", key: "serial_id", sortable: true },
        { title: "Teachers", key: "assignedTeachers", sortable: true },
        { title: "Events", key: "events", sortable: true },
        { title: "Actions", key: "actions", sortable: false },
      ];
    case 'event':
      return [
        { title: "Date", key: "date", sortable: true },
        { title: "Teacher", key: "teacher", sortable: true },
        { title: "Student", key: "students", sortable: false },
        { title: "Location", key: "location", sortable: true },
        { title: "Duration", key: "duration", sortable: true },
        { title: "Kite", key: "kite", sortable: false },
        { title: "Total", key: "total", sortable: true },
        { title: "Actions", key: "actions", sortable: false },
      ];
    case 'lesson':
      return [
        { title: "Teacher", key: "teacher", sortable: true },
        { title: "Students", key: "students", sortable: false },
        { title: "Events", key: "events", sortable: true },
        { title: "Status", key: "status", sortable: true },
        { title: "Actions", key: "actions", sortable: false },
      ];
    case 'booking':
      return [
        { title: "Start Date", key: "date_start", sortable: true },
        { title: "Status", key: "status", sortable: true },
        { title: "Reference", key: "reference", sortable: true },
        { title: "Students", key: "students", sortable: true },
        { title: "Lessons", key: "lessons", sortable: true },
        { title: "Actions", key: "actions", sortable: false },
      ];
    case 'reference':
      return [
        { title: "Name", key: "name", sortable: true },
        { title: "When", key: "created_at", sortable: true },
        { title: "Capacity", key: "capacity", sortable: true },
        { title: "Price €", key: "price", sortable: true },
        { title: "Actions", key: "actions", sortable: false },
      ];
    default:
      return [];
  }
}
