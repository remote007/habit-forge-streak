import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserHabits } from '@/utils/habitUtils';
import { Habit } from '@/types';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const AnalyticsPage = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [filteredHabits, setFilteredHabits] = useState<Habit[]>([]);
  const [habitFilter, setHabitFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch habits when user changes
  useEffect(() => {
    const fetchHabits = async () => {
      if (!user || !user.id) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const userHabits = await getUserHabits(user.id);
        setHabits(userHabits);
        setFilteredHabits(userHabits);
      } catch (error) {
        console.error("Error fetching habits:", error);
        toast.error("Failed to load habits for analytics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHabits();
  }, [user]);

  // Filter habits based on search input
  useEffect(() => {
    if (habitFilter.trim() === '') {
      setFilteredHabits(habits);
    } else {
      const filtered = habits.filter(habit => 
        habit.name.toLowerCase().includes(habitFilter.toLowerCase())
      );
      setFilteredHabits(filtered);
    }
  }, [habitFilter, habits]);

  // Handle auth loading state
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading authentication...</p>
      </div>
    );
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading analytics data...</p>
      </div>
    );
  }

  // Calculate streak data for filtered habits
  const streakData = filteredHabits.map(habit => ({
    name: habit.name,
    currentStreak: habit.currentStreak,
    longestStreak: habit.longestStreak,
  })).sort((a, b) => b.longestStreak - a.longestStreak);

  // Calculate completion rates for filtered habits
  const completionData = filteredHabits.map(habit => {
    const totalDays = habit.history ? Object.keys(habit.history).length : 0;
    const completedDays = habit.history ? Object.values(habit.history).filter(status => status === 'completed').length : 0;
    const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;
    
    return {
      name: habit.name,
      completionRate: Math.round(completionRate),
      value: Math.round(completionRate), // For pie chart
    };
  }).sort((a, b) => b.completionRate - a.completionRate);

  // Calculate habit activity by day of week
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const activityByDay = daysOfWeek.map(day => {
    const dayCount = filteredHabits.reduce((count, habit) => {
      return habit.targetDays.includes(day) || habit.targetDays.includes('Daily') ? count + 1 : count;
    }, 0);
    
    return {
      day,
      count: dayCount,
    };
  });

  // Generate colors for pie chart
  const COLORS = ['#6EE7B7', '#93C5FD', '#FCD34D', '#F472B6', '#A78BFA', '#FB923C', '#4ADE80', '#60A5FA'];

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF6EC] dark:bg-gray-900">
      <Header />
      <main className="flex-grow container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-custom-jet-black dark:text-custom-muted-mint">Habit Analytics</h1>
        
        <div className="mb-6">
          <Label htmlFor="habit-filter" className="text-custom-jet-black dark:text-custom-muted-mint">Filter Habits</Label>
          <Input
            id="habit-filter"
            placeholder="Search by habit name..."
            value={habitFilter}
            onChange={(e) => setHabitFilter(e.target.value)}
            className="max-w-md border-custom-jet-black"
          />
        </div>
        
        {filteredHabits.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md text-center border border-custom-jet-black">
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {habits.length === 0 
                ? "No habits found. Create habits to see analytics." 
                : "No habits match your filter. Try a different search term."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Streak Comparison Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-custom-jet-black">
              <h2 className="text-xl font-semibold mb-4 text-custom-jet-black dark:text-custom-muted-mint">Streak Comparison</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={streakData.slice(0, 5)} // Show top 5 habits
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="currentStreak" name="Current Streak" fill="#93C5FD" />
                    <Bar dataKey="longestStreak" name="Longest Streak" fill="#6EE7B7" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Completion Rate Pie Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-custom-jet-black">
              <h2 className="text-xl font-semibold mb-4 text-custom-jet-black dark:text-custom-muted-mint">Completion Rates</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={completionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {completionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Activity by Day of Week */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-custom-jet-black">
              <h2 className="text-xl font-semibold mb-4 text-custom-jet-black dark:text-custom-muted-mint">Activity by Day of Week</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={activityByDay}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" name="Number of Habits" fill="#F472B6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Habit Progress Over Time */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-custom-jet-black">
              <h2 className="text-xl font-semibold mb-4 text-custom-jet-black dark:text-custom-muted-mint">Overall Progress</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { name: 'Week 1', progress: 30 },
                      { name: 'Week 2', progress: 45 },
                      { name: 'Week 3', progress: 60 },
                      { name: 'Week 4', progress: 75 },
                      { name: 'Week 5', progress: 85 },
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="progress" name="Completion %" stroke="#A78BFA" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AnalyticsPage;
