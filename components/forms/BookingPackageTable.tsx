"use client";

import React, { useState } from "react";
import { Duration } from "@/components/formatters/Duration";

interface Package {
  id: string;
  description: string;
  duration: number;
  price_per_student: number;
  capacity_students: number;
  capacity_kites: number;
}

interface PackageBookingTableProps {
  packages: Package[];
  onSelectPackage: (packageId: string) => void;
  selectedPackageId: string;
  viaStudentParams?: boolean;
  selectedStudentIds?: string[];
}

export function BookingPackageTable({ packages, onSelectPackage, selectedPackageId, viaStudentParams, selectedStudentIds }: PackageBookingTableProps) {
  const [sortBy, setSortBy] = useState<'duration' | 'price' | 'capacity' | 'kites' | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: 'duration' | 'price' | 'capacity' | 'kites') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const filteredPackages = viaStudentParams && selectedStudentIds && selectedStudentIds.length > 0
    ? packages.filter(pkg => pkg.capacity_students === selectedStudentIds.length)
    : packages;

  const sortedPackages = [...filteredPackages].sort((a, b) => {
    if (!sortBy) return 0;
    
    let valueA: number, valueB: number;
    
    switch (sortBy) {
      case 'duration':
        valueA = a.duration;
        valueB = b.duration;
        break;
      case 'price':
        valueA = a.price_per_student;
        valueB = b.price_per_student;
        break;
      case 'capacity':
        valueA = a.capacity_students;
        valueB = b.capacity_students;
        break;
      case 'kites':
        valueA = a.capacity_kites;
        valueB = b.capacity_kites;
        break;
      default:
        return 0;
    }
    
    const comparison = valueA - valueB;
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getSortIcon = (column: 'duration' | 'price' | 'capacity' | 'kites') => {
    if (sortBy !== column) return '↕';
    return sortOrder === 'asc' ? '↑' : '↓';
  };
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted/50">
          <tr>
            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-foreground uppercase tracking-wide">
              Description
            </th>
            <th 
              scope="col" 
              className="px-4 py-4 text-left text-sm font-semibold text-foreground uppercase tracking-wide cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => handleSort('capacity')}
            >
              Capacity {getSortIcon('capacity')}
            </th>
            <th 
              scope="col" 
              className="px-4 py-4 text-left text-sm font-semibold text-foreground uppercase tracking-wide cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => handleSort('kites')}
            >
              Kites {getSortIcon('kites')}
            </th>
            <th 
              scope="col" 
              className="px-6 py-4 text-left text-sm font-semibold text-foreground uppercase tracking-wide cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => handleSort('duration')}
            >
              Duration {getSortIcon('duration')}
            </th>
            <th 
              scope="col" 
              className="px-6 py-4 text-left text-sm font-semibold text-foreground uppercase tracking-wide cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => handleSort('price')}
            >
              Price {getSortIcon('price')}
            </th>
            <th 
              scope="col" 
              className="px-6 py-4 text-left text-sm font-semibold text-foreground uppercase tracking-wide"
            >
              Per Hour
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {sortedPackages.map((pkg) => (
            <tr
              key={pkg.id}
              className={`cursor-pointer transition-all duration-200 ${
                selectedPackageId === pkg.id 
                  ? 'bg-primary/10 hover:bg-primary/15 border-l-4 border-l-primary' 
                  : 'hover:bg-muted/30'
              }`}
              onClick={() => onSelectPackage(selectedPackageId === pkg.id ? "" : pkg.id)}
            >
              <td className="px-6 py-4 text-sm font-semibold text-foreground">
                {pkg.description}
              </td>
              <td className="px-4 py-4 text-sm font-medium text-foreground">
                {pkg.capacity_students}
              </td>
              <td className="px-4 py-4 text-sm font-medium text-foreground">
                {pkg.capacity_kites}
              </td>
              <td className="px-6 py-4 text-sm text-muted-foreground">
                <Duration minutes={pkg.duration} />
              </td>
              <td className="px-6 py-4 text-sm font-semibold text-primary">
                €{pkg.price_per_student}
              </td>
              <td className="px-6 py-4 text-sm text-muted-foreground">
                €{(pkg.price_per_student / (pkg.duration / 60)).toFixed(2)}/h
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
