"use client";

import { Eye, EyeOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MonthPicker } from "@/components/pickers/month-picker";

interface DashboardHeaderProps {
  entity: any;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterEnabled: boolean;
  handleToggleFilter: () => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  showDateFilter: boolean;
}

export function DashboardHeader({ 
  entity, 
  searchTerm, 
  setSearchTerm, 
  filterEnabled, 
  handleToggleFilter, 
  selectedMonth, 
  setSelectedMonth,
  showDateFilter 
}: DashboardHeaderProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 lg:gap-0">
          {/* First row: Icon + Title + Search */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4">
              <entity.icon className={`h-8 w-8 ${entity.color || 'text-blue-500'}`} />
              
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                  {entity.name}
                </h1>
              </div>
            </div>
            
            <div className="lg:flex lg:items-center lg:gap-4">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full lg:w-64 px-4 py-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
              
              {/* Date filter on large screens */}
              {showDateFilter && (
                <div className="hidden lg:flex items-center space-x-4">
                  <button
                    onClick={handleToggleFilter}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      filterEnabled 
                        ? 'bg-primary/15 text-primary border border-primary/30 shadow-lg' 
                        : 'bg-muted/80 text-muted-foreground border border-muted-foreground/20 hover:bg-muted'
                    }`}
                    title={filterEnabled ? 'Month Filter On' : 'Month Filter Off'}
                  >
                    {filterEnabled ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                  
                  {filterEnabled && (
                    <MonthPicker
                      selectedMonth={selectedMonth}
                      onMonthChange={setSelectedMonth}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Second row: Date filter on small screens */}
          {showDateFilter && (
            <div className="flex lg:hidden items-center justify-center space-x-4">
              <button
                onClick={handleToggleFilter}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  filterEnabled 
                    ? 'bg-primary/15 text-primary border border-primary/30 shadow-lg' 
                    : 'bg-muted/80 text-muted-foreground border border-muted-foreground/20 hover:bg-muted'
                }`}
                title={filterEnabled ? 'Month Filter On' : 'Month Filter Off'}
              >
                {filterEnabled ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </button>
              
              {filterEnabled && (
                <MonthPicker
                  selectedMonth={selectedMonth}
                  onMonthChange={setSelectedMonth}
                />
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}