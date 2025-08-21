"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PackageSelectionModal } from '@/components/modals/PackageSelectionModal';
import { getPackages } from '@/actions/package-actions';

interface EntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: string[];
}

const StudentBookingModal: React.FC<EntityModalProps> = ({ isOpen, onClose, selectedIds }) => {
  const [packages, setPackages] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      const fetchPackages = async () => {
        const { data } = await getPackages();
        if (data) {
          setPackages(data);
        }
      };
      fetchPackages();
    }
  }, [isOpen]);

  const handlePackageSelected = (packageId: string) => {
    router.push(
      `/bookings/form?studentIds=${selectedIds.join(",")}&packageId=${packageId}`,
    );
  };

  if (!isOpen) return null;

  return (
    <PackageSelectionModal
      packages={packages}
      selectedStudentIds={selectedIds}
      onSelectPackage={handlePackageSelected}
      onClose={onClose}
    />
  );
};

export function getEntityModal(entityName: string): React.FC<EntityModalProps> | null {
  switch (entityName.toLowerCase()) {
    case 'student':
      return StudentBookingModal;
    default:
      return null;
  }
}
