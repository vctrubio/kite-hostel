"use client";

import { useState, useMemo, useEffect } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import {
  getEntityConfig,
  generateEntityActionButtons,
  getEntityFilterConfig,
} from "./DashboardGetEntitiesUtils";
import { DashboardActionButtons } from "./DashboardActionButtons";
import { getEntitySearchFunction } from "./DashboardGetSearchUtils";
import {
  getEntityColumnHeaders,
  type TableHeader,
} from "./DashboardColumnHeaders";
import { getEntitySorter, type SortConfig } from "./DashboardSorting";
import { getEntityModal } from "./DashboardGetEntityModal";
import { getEntityDropdownForm } from "./DashboardGetEntityDropdownForm";
import { DashboardHeader } from "./DashboardHeader";
import { calcBookingRevenue } from "@/backend/CalcBookingRevenue";
import { calcLessonStats } from "@/backend/CalcLessonStats";

// Helper function for common status filtering
const getStatusCounts = (data: any[], statuses: string[]) => {
  return statuses.map(status => data.filter(item => item.status === status).length);
};

// Helper function to build stats objects
const buildStat = (description: string, value: number | string, subStats: Array<{label: string, value: number | string}>) => ({
  description,
  value,
  subStats
});

// Helper function to create subStat objects
const createSubStats = (labels: string[], values: (number | string)[]) => {
  return labels.map((label, index) => ({ label, value: values[index] }));
};

// Specialized helpers for student filtering
const getStudentBookingCounts = (students: any[]) => {
  const withActiveBookings = students.filter((s) =>
    s.bookings?.some((b: any) => b.status === "active")
  ).length;
  const withCompletedBookings = students.filter((s) =>
    s.bookings?.some((b: any) => b.status === "completed")
  ).length;
  const withNoBookings = students.filter((s) =>
    !s.bookings || s.bookings.length === 0
  ).length;
  
  return { withActiveBookings, withCompletedBookings, withNoBookings };
};

const getLocalityBreakdown = (students: any[]) => {
  const local = students.filter((s) => s.country === "Spain").length;
  const foreign = students.length - local;
  return { local, foreign };
};

interface Stat {
  description: string;
  value: number | string;
  subStats?: Array<{
    label: string;
    value: number | string;
  }>;
}

interface DashboardProps {
  entityName: string;
  stats: Stat[];
  rowComponent: React.ComponentType<any>;
  data: any[];
  actionsPlaceholder?: React.ReactNode;
  isFilterRangeSelected?: boolean;
  isDropdown?: boolean;
  formProps?: any;
}

type CustomFilterValue = string;

// Sub-component: Stats Grid
function StatsGrid({ stats }: { stats: Stat[] }) {
  const gridClass = `grid grid-cols-1 gap-4 ${stats.length === 2
    ? "md:grid-cols-2"
    : stats.length === 3
      ? "md:grid-cols-3"
      : stats.length >= 4
        ? "md:grid-cols-2 lg:grid-cols-4"
        : "md:grid-cols-1"
    }`;

  return (
    <div className={gridClass}>
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">
              {stat.value}
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-3">
              {stat.description}
            </p>

            {stat.subStats && stat.subStats.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border/50">
                {stat.subStats.map((subStat, subIndex) => (
                  <div
                    key={subIndex}
                    className="flex justify-between items-center"
                  >
                    <span className="text-xs text-muted-foreground/80">
                      {subStat.label}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {subStat.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Sub-component: Data Table
function DataTable({
  tableHeaders,
  filteredData,
  RowComponent,
  expandedRow,
  setExpandedRow,
  filterEnabled,
  onSort,
  sortConfig,
  onSelect,
  selectedIds,
  formProps,
}: {
  tableHeaders: TableHeader[];
  filteredData: any[];
  RowComponent: React.ComponentType<any>;
  expandedRow: string | null;
  setExpandedRow: (id: string | null) => void;
  filterEnabled: boolean;
  onSort: (key: string) => void;
  sortConfig: SortConfig | null;
  onSelect?: (id: string) => void;
  selectedIds?: string[];
  formProps?: any;
}) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-border bg-muted/50">
                {tableHeaders.map((header) => (
                  <th
                    key={header.key}
                    className={`text-left p-4 font-semibold text-foreground ${header.sortable ? "cursor-pointer" : ""}`}
                    onClick={() => header.sortable && onSort(header.key)}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{header.title}</span>
                      {header.sortable &&
                        (sortConfig && sortConfig.key === header.key ? (
                          sortConfig.direction === "asc" ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          )
                        ) : (
                          <div className="h-4 w-4 opacity-30">
                            <ArrowUp className="h-3 w-3" />
                          </div>
                        ))}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={tableHeaders.length}
                    className="p-6 text-center text-muted-foreground"
                  >
                    {filterEnabled
                      ? "No items found for this month."
                      : "No items found."}
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <RowComponent
                    key={item.id || item.bookingId || `item-${index}`}
                    data={item}
                    expandedRow={expandedRow}
                    setExpandedRow={setExpandedRow}
                    isSelected={selectedIds?.includes(
                      item.id || item.bookingId,
                    )}
                    onSelect={onSelect}
                    {...(formProps || {})}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function Dashboard({
  entityName,
  stats,
  rowComponent: RowComponent,
  data,
  actionsPlaceholder,
  isFilterRangeSelected = true,
  isDropdown = false,
  formProps,
}: DashboardProps) {
  // Memoized entity configs and utilities
  const entityConfig = useMemo(() => ({
    entity: getEntityConfig(entityName),
    tableHeaders: getEntityColumnHeaders(entityName),
    customFilters: getEntityFilterConfig(entityName),
    searchFunction: getEntitySearchFunction(entityName),
    sorter: getEntitySorter(entityName),
    EntityModal: getEntityModal(entityName),
    EntityDropdownForm: getEntityDropdownForm(entityName),
  }), [entityName]);

  // Date utilities
  const currentDate = new Date();
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
  const router = useRouter();

  // All state at the top
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState({
    month: currentMonth,
    filterEnabled: isFilterRangeSelected
  });

  const handleMonthChange = (newMonth: string) => {
    const newState = { ...selectedMonth, month: newMonth };
    setSelectedMonth(newState);
    localStorage.setItem("selectedMonth", JSON.stringify(newState));
  };

  useEffect(() => {
    const savedMonth = localStorage.getItem("selectedMonth");
    if (savedMonth) {
      try {
        const parsed = JSON.parse(savedMonth);
        if (parsed && typeof parsed === 'object' && parsed.month) {
          setSelectedMonth(parsed);
          setFilterEnabled(parsed.filterEnabled ?? isFilterRangeSelected);
        } else {
          // Handle old string format
          setSelectedMonth({ month: savedMonth, filterEnabled: isFilterRangeSelected });
        }
      } catch {
        // Handle old string format
        setSelectedMonth({ month: savedMonth, filterEnabled: isFilterRangeSelected });
      }
    }
  }, [entityName, isFilterRangeSelected]);
  const [filterEnabled, setFilterEnabled] = useState(isFilterRangeSelected);
  const [customFilter, setCustomFilter] = useState<CustomFilterValue>(
    customFilters.defaultFilter,
  );
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownFormOpen, setIsDropdownFormOpen] = useState(false);

  // All handlers at the top
  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "desc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "desc"
    ) {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  const handleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // All computed values at the top
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Sorting
    if (sortConfig !== null) {
      filtered.sort((a, b) => entityConfig.sorter(a, b, sortConfig));
    }

    // Month filter - only apply if date filtering is enabled
    if (filterEnabled && isFilterRangeSelected) {
      filtered = filtered.filter((item) => {
        // Use different date fields based on entity type
        let dateField = item.created_at;
        if (entityName.toLowerCase() === "event" && item.date) {
          dateField = item.date;
        } else if (
          entityName.toLowerCase() === "reference" &&
          item.bookingCreatedAt
        ) {
          dateField = item.bookingCreatedAt;
        }

        if (!dateField) return false;
        const itemDate = new Date(dateField);
        const itemMonth = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, "0")}`;
        return itemMonth === selectedMonth.month;
      });
    }

    // Custom filter
    if (customFilter !== "all") {
      filtered = filtered.filter((item) =>
        entityConfig.customFilters.filterFunction(item, customFilter),
      );
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((item) => entityConfig.searchFunction(item, searchTerm));
    }

    return filtered;
  }, [
    data,
    selectedMonth,
    filterEnabled,
    searchTerm,
    customFilter,
    sortConfig,
    isFilterRangeSelected,
    entityName,
    entityConfig,
  ]);

  const exportFileName = useMemo(() => {
    const datePart =
      filterEnabled && isFilterRangeSelected ? selectedMonth.month : "ALL";
    return `tkh-${entityName.toLowerCase()}s-${datePart}.csv`;
  }, [entityName, filterEnabled, isFilterRangeSelected, selectedMonth]);

  const actionButtons = generateEntityActionButtons(
    entityName,
    router,
    selectedIds,
    () => setIsModalOpen(true),
    isDropdown ? () => setIsDropdownFormOpen(!isDropdownFormOpen) : undefined,
    isDropdownFormOpen,
  );

  const calculateEntityStats = (entityType: string, data: any[]) => {
    switch (entityType.toLowerCase()) {
      case "student":
        const totalStudents = data.length;
        const { local, foreign } = getLocalityBreakdown(data);
        const { withActiveBookings, withCompletedBookings, withNoBookings } = getStudentBookingCounts(data);

        return [
          buildStat("Total Students", totalStudents, 
            createSubStats(["Local (Spain)", "Foreign"], [local, foreign])
          ),
          buildStat("Active Bookings", withActiveBookings,
            createSubStats(["Completed Bookings", "Students with No Bookings"], [withCompletedBookings, withNoBookings])
          ),
        ];

      case "booking":
        const totalBookings = data.length;
        const [activeBookings, completedBookings, uncompletedBookings] = getStatusCounts(data, ["active", "completed", "uncomplete"]);
        const revenueBreakdown = calcBookingRevenue(data);

        return [
          buildStat("Total Bookings", totalBookings,
            createSubStats(["Active", "Completed", "Uncompleted"], [activeBookings, completedBookings, uncompletedBookings])
          ),
          buildStat("Money Made", `€${revenueBreakdown.moneyMade}`,
            createSubStats(
              ["Expected School Revenue", "Teacher Earnings", "School Earnings"], 
              [`€${revenueBreakdown.revenue}`, `€${revenueBreakdown.teacher}`, `€${revenueBreakdown.school}`]
            )
          ),
        ];

      case "lesson":
        const totalLessons = data.length;
        const [plannedLessons, completedLessons, restLessons, delegatedLessons] = getStatusCounts(data, ["planned", "completed", "rest", "delegated"]);
        const lessonStats = calcLessonStats(data);

        return [
          buildStat("Total Lessons", totalLessons,
            createSubStats(["Planned", "Completed", "Rest", "Delegated"], [plannedLessons, completedLessons, restLessons, delegatedLessons])
          ),
          buildStat("Hours", `${lessonStats.totalHours}h`,
            createSubStats(
              ["Private", "Semi-private", "Group"], 
              [`${lessonStats.privateHours}h`, `${lessonStats.semiPrivate}h`, `${lessonStats.group}h`]
            )
          ),
        ];
      
      default:
        // For other entities, use the original stats template but update values based on filtered data
        const newStats = stats.map((stat) => {
          const newStat = { ...stat };
          if (stat.subStats) {
            newStat.subStats = stat.subStats.map((sub) => ({ ...sub }));
          }
          return newStat;
        });

        if (newStats.length > 0) {
          newStats[0].value = data.length;
        }

        return newStats;
    }
  };

  const dynamicStats = useMemo(() => {
    if (!stats) return [];
    return calculateEntityStats(entityName, filteredData);
  }, [stats, filteredData, entityName]);

  const handleToggleFilter = () => {
    const newFilterEnabled = !filterEnabled;
    setFilterEnabled(newFilterEnabled);
    const newState = { ...selectedMonth, filterEnabled: newFilterEnabled };
    setSelectedMonth(newState);
    localStorage.setItem("selectedMonth", JSON.stringify(newState));
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape" && isDropdownFormOpen) {
      event.preventDefault();
      setIsDropdownFormOpen(false);
    }
  };

  return (
    <>
      <div className="mx-auto space-y-6 py-4" onKeyDown={handleKeyDown}>
        <DashboardHeader
          entity={entityConfig.entity}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterEnabled={filterEnabled}
          handleToggleFilter={handleToggleFilter}
          selectedMonth={selectedMonth.month}
          setSelectedMonth={handleMonthChange}
          showDateFilter={isFilterRangeSelected}
          data={filteredData}
          exportFileName={exportFileName}
        />

        <StatsGrid stats={dynamicStats} />

        <DashboardActionButtons
          actionButtons={actionButtons}
          customFilters={entityConfig.customFilters}
          customFilter={customFilter}
          setCustomFilter={setCustomFilter}
        />

        {actionsPlaceholder && (
          <div className="space-y-4">{actionsPlaceholder}</div>
        )}

        {isDropdown && isDropdownFormOpen && entityConfig.EntityDropdownForm && (
          <div className="mb-6 p-4 rounded-lg bg-muted/50 border border-muted">
            <entityConfig.EntityDropdownForm
              onSubmit={() => setIsDropdownFormOpen(false)}
              {...formProps}
            />
          </div>
        )}

        <DataTable
          tableHeaders={entityConfig.tableHeaders}
          filteredData={filteredData}
          RowComponent={RowComponent}
          expandedRow={expandedRow}
          setExpandedRow={setExpandedRow}
          filterEnabled={filterEnabled}
          onSort={handleSort}
          sortConfig={sortConfig}
          onSelect={
            entityName.toLowerCase() === "student" ? handleSelect : undefined
          }
          selectedIds={
            entityName.toLowerCase() === "student" ? selectedIds : undefined
          }
          formProps={formProps}
        />
      </div>
      {entityConfig.EntityModal && (
        <entityConfig.EntityModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedIds={selectedIds}
        />
      )}
    </>
  );
}
