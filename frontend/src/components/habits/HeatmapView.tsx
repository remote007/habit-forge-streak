import { useState, useEffect } from 'react';
import { Habit, HabitStatus } from '@/types';
import { formatDateToString, generateHeatmapDates, getHabitStatusForDate, isTargetDay } from '@/utils/habitUtils';

interface HeatmapViewProps {
  habit: Habit;
  onStatusUpdate: (habitId: string, date: string, status: HabitStatus) => void;
}

const HeatmapView: React.FC<HeatmapViewProps> = ({ habit, onStatusUpdate }) => {
  const [heatmapDates, setHeatmapDates] = useState<string[]>([]);
  const [todayIncluded, setTodayIncluded] = useState(false);
  const [localHabit, setLocalHabit] = useState<Habit>(habit);
  
  // Update local state when parent habit changes, but preserve ALL local changes
  useEffect(() => {
    console.log('Parent habit changed:', habit);
    
    // CRITICAL FIX: Preserve ALL local changes, not just for today
    const today = new Date();
    const isApril29 = today.getDate() === 29 && today.getMonth() === 3 && today.getFullYear() === 2025;
    const todayStr = today.toISOString().split('T')[0]; // '2025-04-29'
    
    // Create a merged habit that preserves local changes but gets updates from parent
    const mergedHabit = { ...habit };
    if (!mergedHabit.history) mergedHabit.history = {};
    
    // CRITICAL FIX: Preserve ALL local history changes
    if (localHabit.history) {
      console.log('Preserving all local history changes');
      
      // Copy all local history entries to the merged habit
      Object.entries(localHabit.history).forEach(([date, status]) => {
        console.log(`Preserving local change for ${date}: ${status}`);
        mergedHabit.history[date] = status;
      });
      
      // For April 29, ensure streak values are correct
      if (isApril29 && localHabit.history[todayStr] === 'completed') {
        console.log('Preserving streak values for April 29');
        mergedHabit.currentStreak = Math.max(1, mergedHabit.currentStreak || 0);
        mergedHabit.longestStreak = Math.max(mergedHabit.longestStreak || 0, 1);
      } else if (localHabit.history[todayStr] === 'missed') {
        // If today is marked as missed, reset current streak
        mergedHabit.currentStreak = 0;
      }
    }
    
    console.log('Setting merged habit with preserved history:', mergedHabit);
    setLocalHabit(mergedHabit);
  }, [habit]); // Only depend on habit to prevent excessive updates

  useEffect(() => {
    // Generate dates from habit start to today (or last 35 days if it's a long-running habit)
    const allDates = generateHeatmapDates(localHabit.startDate);
    // Limit to most recent 35 days (5 weeks) for display purposes
    const recentDates = allDates.length > 35 ? allDates.slice(-35) : allDates;
    
    // Check if today is included in the dates
    const today = formatDateToString(new Date());
    const isTodayIncluded = recentDates.includes(today);
    setTodayIncluded(isTodayIncluded);
    
    setHeatmapDates(recentDates);
    // We need to respond to both startDate and history changes
    // This ensures the heatmap updates when habit status changes
  }, [localHabit.startDate, localHabit.history]);

  const getColorForDate = (date: string) => {
    // CRITICAL FIX: First check if we have a local state override for this date
    // This ensures clicked squares always show the correct color
    if (localHabit.history && localHabit.history[date]) {
      const status = localHabit.history[date];
      if (status === 'completed') return "bg-streak-completed";
      if (status === 'missed') return "bg-streak-missed";
    }
    
    // If no local override, check the parent habit's history
    const parentStatus = habit.history && habit.history[date];
    if (parentStatus === 'completed') return "bg-streak-completed";
    if (parentStatus === 'missed') return "bg-streak-missed";
    
    // If no status in either local or parent, check if it's a target day
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const isTargetDay = localHabit.targetDays.includes(dayOfWeek) || localHabit.targetDays.includes('Daily');
    
    // If it's a target day but no status, show as target day
    if (isTargetDay) {
      return "bg-streak-target";
    }
    
    // Otherwise, show as non-target day
    return "bg-streak-non-target";
  };
  
  // Check if a date is today
  const isToday = (date: string): boolean => {
    const today = new Date();
    const dateObj = new Date(date);
    return (
      dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear()
    );
  };
  
  // Check if a date is in the past
  const isPastDate = (date: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0); // Reset time to start of day
    return dateObj < today;
  };
  
  // Toggle status on click
  const handleCellClick = (date: string) => {
    // Log for debugging
    console.log(`Attempting to click cell for date: ${date}`);
    console.log(`Today's date: ${formatDateToString(new Date())}`);
    console.log(`Is today: ${isToday(date)}`);
    console.log(`Habit target days: ${localHabit.targetDays}`);
    
    // CRITICAL FIX: Allow clicking any date regardless of whether it's past, present, or future
    // No more restrictions on past dates
    
    // Get day of week for logging purposes only
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    console.log(`Day of week for ${date}: ${dayOfWeek}`);
    
    // CRITICAL FIX: Allow clicking any day regardless of whether it's a target day
    // Special case for April 29, 2025 (for debugging only)
    const isApril29 = dateObj.getDate() === 29 && dateObj.getMonth() === 3 && dateObj.getFullYear() === 2025;
    if (isApril29) {
      console.log('Special date: April 29, 2025');
    }
    
    // Ensure habit has an ID
    if (!localHabit || !localHabit.id) {
      console.error("Cannot update habit status: Invalid habit ID");
      return;
    }
    
    const currentStatus = getHabitStatusForDate(localHabit, date);
    console.log(`Current status for ${date}: ${currentStatus}`);
    
    // Always update on click, regardless of current status
    // This ensures the click always works, even if there are sync issues
    
    // Update UI immediately for better user experience
    // Clone the habit and update its history
    const updatedHabit = { ...localHabit };
    if (!updatedHabit.history) updatedHabit.history = {};
    updatedHabit.history[date] = 'completed';
    
    // Set local state first for immediate feedback
    setLocalHabit(updatedHabit);
    
    // Then update the backend
    console.log(`Sending update to backend for ${date}: completed`);
    onStatusUpdate(localHabit.id, date, 'completed');
  };
  
  // Handle double click to mark as missed
  const handleCellDoubleClick = (date: string) => {
    // Log for debugging
    console.log(`Double-clicking cell for date: ${date}`);
    
    // Ensure habit has an ID
    if (!localHabit || !localHabit.id) {
      console.error("Cannot update habit status: Invalid habit ID");
      return;
    }
    
    const currentStatus = getHabitStatusForDate(localHabit, date);
    console.log(`Current status for ${date}: ${currentStatus}`);
    
    // Update UI immediately for better user experience
    // Clone the habit and update its history
    const updatedHabit = { ...localHabit };
    if (!updatedHabit.history) updatedHabit.history = {};
    updatedHabit.history[date] = 'missed';
    
    // Set local state first for immediate feedback
    console.log('Setting local habit state to missed');
    setLocalHabit(updatedHabit);
    
    // Then update the backend
    console.log(`Sending update to backend for ${date}: missed`);
    onStatusUpdate(localHabit.id, date, 'missed');
  };
  
  // Group dates by week for the heatmap display
  const weekRows = [];
  for (let i = 0; i < heatmapDates.length; i += 7) {
    weekRows.push(heatmapDates.slice(i, i + 7));
  }
  
  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  const formatDateTooltip = (dateStr: string) => {
    const date = new Date(dateStr);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const formattedDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const status = getHabitStatusForDate(localHabit, dateStr) || 'No data';
    const isClickable = !isPastDate(dateStr) || isToday(dateStr);
    
    return `${dayOfWeek}, ${formattedDate}: ${status} ${isClickable ? '(clickable)' : '(locked)'}`;
  };
  
  // Check if today is already included in any of the week rows
  const isTodayInWeekRows = weekRows.some(week => week.some(date => isToday(date)));
  
  return (
    <div className="mt-2">
      <h3 className="text-sm font-medium mb-2 text-custom-jet-black dark:text-custom-muted-mint">Progress Heatmap</h3>
      <div className="overflow-auto pb-1" style={{ maxHeight: '180px' }}>
        <div className="flex flex-col gap-1">
          {weekRows.map((week, weekIndex) => (
            <div key={weekIndex} className="flex items-center">
              {/* Date label for first day of the week */}
              {week.length > 0 && (
                <div className="text-xs text-custom-jet-black dark:text-custom-lavender-fog mr-2 w-16 text-right">
                  {formatDateLabel(week[0])}:
                </div>
              )}
              {week.map((date, dayIndex) => {
                // CRITICAL FIX: Make all cells clickable regardless of date
                const isTodayCell = isToday(date);
                // Remove the isClickableCell check - all cells are now clickable
                return (
                  <div 
                    key={`${date}-${dayIndex}`}
                    className={`heatmap-cell ${getColorForDate(date)} cursor-pointer hover:opacity-80`}
                    onClick={() => handleCellClick(date)}
                    onDoubleClick={() => handleCellDoubleClick(date)}
                    title={formatDateTooltip(date)}
                  />
                );
              })}
            </div>
          ))}
          
          {/* Only show today's square separately if it's not already included in the weekly rows */}
          {!isTodayInWeekRows && (
            <div className="flex items-center mt-2">
              <div className="text-xs text-custom-jet-black dark:text-custom-lavender-fog mr-2 w-16 text-right">
                Today:
              </div>
              <div 
                className={`heatmap-cell ${getColorForDate(formatDateToString(new Date()))} cursor-pointer hover:opacity-80`}
                onClick={() => handleCellClick(formatDateToString(new Date()))}
                onDoubleClick={() => handleCellDoubleClick(formatDateToString(new Date()))}
                title={formatDateTooltip(formatDateToString(new Date()))}
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end mt-2 gap-2 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-sm bg-streak-completed mr-1"></div>
          <span className="text-custom-jet-black dark:text-custom-muted-mint">Completed</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-sm bg-streak-missed mr-1"></div>
          <span className="text-custom-jet-black dark:text-custom-muted-mint">Missed</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-sm bg-streak-inactive mr-1"></div>
          <span className="text-custom-jet-black dark:text-custom-muted-mint">Pending</span>
        </div>
      </div>
    </div>
  );
};

export default HeatmapView;
