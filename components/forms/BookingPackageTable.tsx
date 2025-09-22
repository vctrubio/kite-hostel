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
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th 
              scope="col" 
              className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('capacity')}
            >
              Capacity {getSortIcon('capacity')}
            </th>
            <th 
              scope="col" 
              className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('kites')}
            >
              Kites {getSortIcon('kites')}
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('duration')}
            >
              Duration (hours) {getSortIcon('duration')}
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('price')}
            >
              Price (€) {getSortIcon('price')}
            </th>
            <th 
              scope="col" 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Price/hour (€)
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedPackages.map((pkg) => (
            <tr
              key={pkg.id}
              className={`cursor-pointer hover:bg-gray-100 ${selectedPackageId === pkg.id ? 'bg-blue-100' : ''}`}
              onClick={() => onSelectPackage(selectedPackageId === pkg.id ? "" : pkg.id)}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {pkg.description}
              </td>
              <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                {pkg.capacity_students}
              </td>
              <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                {pkg.capacity_kites}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <Duration minutes={pkg.duration} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                €{pkg.price_per_student}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                €{(pkg.price_per_student / (pkg.duration / 60)).toFixed(2)}/h
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
