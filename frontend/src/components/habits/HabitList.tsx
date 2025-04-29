
import { Habit } from '@/types';
import HabitCard from './HabitCard';

interface HabitListProps {
  habits: Habit[];
  onStatusUpdate: (habitId: string, date: string, status: 'completed' | 'missed' | null) => void;
  onEditHabit: (habitId: string) => void;
  onDeleteHabit: (habitId: string) => void;
}

const HabitList: React.FC<HabitListProps> = ({
  habits,
  onStatusUpdate,
  onEditHabit,
  onDeleteHabit,
}) => {
  if (habits.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground text-lg">No habits found.</p>
        <p className="text-muted-foreground">Create your first habit to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {habits.map((habit) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          onStatusUpdate={onStatusUpdate}
          onEdit={() => onEditHabit(habit.id)}
          onDelete={() => onDeleteHabit(habit.id)}
        />
      ))}
    </div>
  );
};

export default HabitList;
