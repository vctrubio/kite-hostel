"use client";

import Link from "next/link";
import { ENTITY_DATA } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { useState } from "react";
import { getStudents } from "@/actions/student-actions";
import { getTeachers } from "@/actions/teacher-actions";

interface EntityCounts {
  [key: string]: number;
}

export default function FormsPage() {
  const [counts, setCounts] = useState<EntityCounts>({});
  const [loading, setLoading] = useState<string | null>(null);

  const fetchCount = async (entityName: string) => {
    setLoading(entityName);
    try {
      let count = 0;
      
      switch (entityName.toLowerCase()) {
        case 'student':
          const { data: students } = await getStudents();
          count = students?.length || 0;
          break;
        case 'teacher':
          const { data: teachers } = await getTeachers();
          count = teachers?.length || 0;
          break;
        default:
          count = Math.floor(Math.random() * 50); // Mock count for other entities
      }
      
      setCounts(prev => ({ ...prev, [entityName]: count }));
    } catch (error) {
      console.error(`Error fetching ${entityName} count:`, error);
      setCounts(prev => ({ ...prev, [entityName]: 0 }));
    } finally {
      setLoading(null);
    }
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Forms & Data Management</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage all your kite school data
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {ENTITY_DATA.map((entity) => {
          const Icon = entity.icon;
          
          return (
            <div
              key={entity.name}
              className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow duration-200"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className={`p-2 rounded-lg ${entity.bgColor}/10`}>
                  <Icon className={`h-6 w-6 ${entity.color}`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold">{entity.name}</h3>
                    <div className="flex items-center space-x-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${entity.bgColor}/20 ${entity.color}`}>
                        {counts[entity.name] !== undefined ? `${counts[entity.name]} records` : 'Click to load'}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fetchCount(entity.name)}
                        disabled={loading === entity.name}
                        className="h-6 w-6 p-0"
                      >
                        <RefreshCw className={`h-3 w-3 ${loading === entity.name ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {entity.description.join(" ")}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Link href={entity.link}>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
                <Link href={`${entity.link}/form`}>
                  <Button size="sm" className={`${entity.bgColor} hover:${entity.bgColor}/90`}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add New
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}