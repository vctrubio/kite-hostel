import React from "react";
import { EventHeading } from "@/getters/event-getters";
import { Clock } from "lucide-react";

export interface TableHeader {
  title: string | React.ReactElement;
  key: string;
  sortable?: boolean;
}

export function getEntityColumnHeaders(entityName: string): TableHeader[] {
  switch (entityName.toLowerCase()) {
    case "student":
      return [
        { title: "Select", key: "select", sortable: false },
        { title: "Date", key: "created_at", sortable: true },
        { title: "First Name", key: "name", sortable: true },
        { title: "Last Name", key: "last_name", sortable: true },
        { title: "Description", key: "desc", sortable: false },
        { title: "Bookings", key: "bookings", sortable: true },
        {
          title: React.createElement(EventHeading, { className: "w-5 h-5" }),
          key: "eventsAndHours",
          sortable: true,
        },
        { title: "Actions", key: "actions", sortable: false },
      ];
    case "teacher":
      return [
        { title: "Av.", key: "available", sortable: true },
        { title: "Date", key: "created_at", sortable: true },
        { title: "Name", key: "name", sortable: true },
        { title: "Lessons", key: "lessons", sortable: true },
        { title: "Balance", key: "balance", sortable: true },
        { title: "Status", key: "status", sortable: true },
        { title: "Actions", key: "actions", sortable: false },
      ];
    case "package":
      return [
        { title: "Description", key: "description", sortable: true },
        { title: "Kites", key: "capacity_kites", sortable: true },
        { title: "Students", key: "capacity_students", sortable: true },
        { title: "Duration", key: "duration", sortable: true },
        { title: "Price/Student", key: "price_per_student", sortable: true },
        { title: "Price/ph", key: "hourly_rate", sortable: true },
        { title: "Booking Revenue", key: "booking_revenue", sortable: true },
        { title: "Actions", key: "actions", sortable: false },
      ];
    case "payment":
      return [
        { title: "Date", key: "created_at", sortable: true },
        { title: "Teacher", key: "teacher", sortable: true },
        { title: "Amount", key: "amount", sortable: true },
        { title: "Actions", key: "actions", sortable: false },
      ];
    case "kite":
      return [
        { title: "Date", key: "created_at", sortable: true },
        { title: "Model", key: "model", sortable: true },
        { title: "Size", key: "size", sortable: true },
        { title: "Serial ID", key: "serial_id", sortable: true },
        { title: "Teachers", key: "assignedTeachers", sortable: true },
        { title: "Events", key: "events", sortable: true },
        { title: "Actions", key: "actions", sortable: false },
      ];
    case "event":
      return [
        { title: "Date", key: "date", sortable: true },
        { title: "Teacher", key: "teacher", sortable: true },
        { title: "Student", key: "students", sortable: false },
        { title: "Location", key: "location", sortable: true },
        { 
          title: React.createElement(Clock, { className: "w-5 h-5" }), 
          key: "duration", 
          sortable: true 
        },
        { title: "Total", key: "total", sortable: true },
        { title: "Status", key: "status", sortable: true },
        { title: "Actions", key: "actions", sortable: false },
      ];
    case "lesson":
      return [
        { title: "Teacher", key: "teacher", sortable: true },
        { title: "Commission", key: "commission", sortable: true },
        { title: "Students", key: "students", sortable: false },
        {
          title: React.createElement(EventHeading, { className: "w-5 h-5" }),
          key: "events",
          sortable: true,
        },
        { title: "Status", key: "status", sortable: true },
        { title: "Actions", key: "actions", sortable: false },
      ];
    case "booking":
      return [
        { title: "Start Date", key: "date_start", sortable: true },
        { title: "Status", key: "status", sortable: true },
        { title: "Students", key: "students", sortable: true },
        { title: "Progress", key: "progress", sortable: true },
        { title: "Lessons", key: "lessons", sortable: false },
        { title: "Actions", key: "actions", sortable: false },
      ];
    case "reference":
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
