import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Habit, HabitFormValues } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateToString } from '@/utils/habitUtils';

interface HabitFormProps {
  onSubmit: (values: HabitFormValues) => void;
  initialValues?: Partial<Habit>;
  submitLabel?: string;
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const PRESET_OPTIONS = [
  { label: 'Daily', value: ['Daily'] },
  { label: 'Weekdays', value: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
  { label: 'Weekends', value: ['Saturday', 'Sunday'] },
];

const HabitForm: React.FC<HabitFormProps> = ({ 
  onSubmit, 
  initialValues,
  submitLabel = 'Save Habit'
}) => {
  const [name, setName] = useState(initialValues?.name || '');
  const [targetDaysType, setTargetDaysType] = useState<'preset' | 'custom'>(
    initialValues?.targetDays?.includes('Daily') ? 'preset' : 'custom'
  );
  const [selectedPreset, setSelectedPreset] = useState<string>(
    initialValues?.targetDays?.includes('Daily') ? 'Daily' : 
    PRESET_OPTIONS.some(preset => 
      JSON.stringify(preset.value) === JSON.stringify(initialValues?.targetDays)) 
      ? PRESET_OPTIONS.find(preset => 
        JSON.stringify(preset.value) === JSON.stringify(initialValues?.targetDays))?.label || ''
      : ''
  );
  
  const [customDays, setCustomDays] = useState<string[]>(
    targetDaysType === 'custom' ? initialValues?.targetDays || [] : []
  );
  
  const [startDate, setStartDate] = useState(
    initialValues?.startDate || formatDateToString(new Date())
  );

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    setTargetDaysType('preset');
  };

  const handleCustomDayToggle = (day: string) => {
    setTargetDaysType('custom');
    setSelectedPreset('');
    
    setCustomDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day) 
        : [...prev, day]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with values:", { name, targetDaysType, selectedPreset, customDays, startDate });
    
    let targetDays: string[];
    
    if (targetDaysType === 'preset') {
      targetDays = PRESET_OPTIONS.find(option => option.label === selectedPreset)?.value || ['Daily'];
    } else {
      targetDays = customDays.length ? customDays : ['Daily']; // Default to daily if nothing selected
    }
    
    console.log("Submitting habit with targetDays:", targetDays);
    
    onSubmit({
      name,
      targetDays,
      startDate,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialValues ? 'Edit Habit' : 'Create New Habit'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="habit-name" className="text-sm font-medium">
              Habit Name
            </label>
            <Input
              id="habit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Drink Water, Read, Exercise..."
              required
            />
          </div>
          
          <div className="space-y-3">
            <label className="text-sm font-medium">Target Days</label>
            
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {PRESET_OPTIONS.map((preset) => (
                  <Button
                    key={preset.label}
                    type="button"
                    variant={selectedPreset === preset.label ? "default" : "outline"}
                    onClick={() => handlePresetChange(preset.label)}
                    className="text-sm"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              
              <div className="mt-4">
                <div className="text-sm font-medium mb-2">or select custom days:</div>
                <div className="flex flex-wrap gap-3">
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={`day-${day}`}
                        checked={
                          (targetDaysType === 'custom' && customDays.includes(day)) ||
                          (targetDaysType === 'preset' && selectedPreset === 'Weekdays' && 
                            ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day)) ||
                          (targetDaysType === 'preset' && selectedPreset === 'Weekends' && 
                            ['Saturday', 'Sunday'].includes(day)) ||
                          (targetDaysType === 'preset' && selectedPreset === 'Daily')
                        }
                        onCheckedChange={() => handleCustomDayToggle(day)}
                      />
                      <label htmlFor={`day-${day}`} className="text-sm cursor-pointer">
                        {day}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="start-date" className="text-sm font-medium">
              Start Date
            </label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={formatDateToString(new Date())}
              required
            />
          </div>
        </CardContent>
        
        <CardFooter>
          <Button type="submit">{submitLabel}</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default HabitForm;
