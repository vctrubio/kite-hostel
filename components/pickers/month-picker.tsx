'use client'

interface MonthPickerProps {
  selectedMonth: string; // Format: "2024-01"
  onMonthChange: (month: string) => void;
}

export function MonthPicker({ selectedMonth, onMonthChange }: MonthPickerProps) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Generate months for current year and previous year
  const months = [];
  for (let year = currentYear; year >= currentYear - 1; year--) {
    for (let month = (year === currentYear ? currentMonth : 11); month >= 0; month--) {
      const monthValue = `${year}-${String(month + 1).padStart(2, '0')}`;
      const monthLabel = new Date(year, month, 1).toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
      months.push({ value: monthValue, label: monthLabel });
    }
  }

  const getCurrentMonthLabel = () => {
    const [year, month] = selectedMonth.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const currentMonthDate = new Date(year, month - 1, 1);
    
    if (direction === 'prev') {
      currentMonthDate.setMonth(currentMonthDate.getMonth() - 1);
    } else {
      currentMonthDate.setMonth(currentMonthDate.getMonth() + 1);
    }
    
    const newMonth = `${currentMonthDate.getFullYear()}-${String(currentMonthDate.getMonth() + 1).padStart(2, '0')}`;
    
    // Check if the new month exists in our available months
    const monthExists = months.some(m => m.value === newMonth);
    if (monthExists) {
      onMonthChange(newMonth);
    }
  };

  const canNavigatePrev = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const currentMonthDate = new Date(year, month - 1, 1);
    currentMonthDate.setMonth(currentMonthDate.getMonth() - 1);
    const prevMonth = `${currentMonthDate.getFullYear()}-${String(currentMonthDate.getMonth() + 1).padStart(2, '0')}`;
    return months.some(m => m.value === prevMonth);
  };

  const canNavigateNext = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const currentMonthDate = new Date(year, month - 1, 1);
    currentMonthDate.setMonth(currentMonthDate.getMonth() + 1);
    const nextMonth = `${currentMonthDate.getFullYear()}-${String(currentMonthDate.getMonth() + 1).padStart(2, '0')}`;
    return months.some(m => m.value === nextMonth);
  };

  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={() => navigateMonth('prev')}
        disabled={!canNavigatePrev()}
        className="p-2 hover:bg-muted rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ←
      </button>
      
      <select 
        value={selectedMonth}
        onChange={(e) => onMonthChange(e.target.value)}
        className="px-3 py-1 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-green-600 min-w-[140px]"
      >
        {months.map((month) => (
          <option key={month.value} value={month.value}>
            {month.label}
          </option>
        ))}
      </select>

      <button
        onClick={() => navigateMonth('next')}
        disabled={!canNavigateNext()}
        className="p-2 hover:bg-muted rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        →
      </button>
    </div>
  );
}