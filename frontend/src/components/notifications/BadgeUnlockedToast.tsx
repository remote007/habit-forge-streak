import React, { useState, useEffect } from 'react';
import { Award } from 'lucide-react';
import { getBadgeById } from '@/utils/habitUtils';

interface BadgeUnlockedToastProps {
  badgeName: string;
}

const BadgeUnlockedToast: React.FC<BadgeUnlockedToastProps> = ({ badgeName }) => {
  const [badge, setBadge] = useState<any>(null);
  
  useEffect(() => {
    const fetchBadge = async () => {
      try {
        const badgeData = await getBadgeById(badgeName);
        setBadge(badgeData);
      } catch (error) {
        console.error('Error fetching badge:', error);
      }
    };
    
    fetchBadge();
  }, [badgeName]);
  
  return (
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0 bg-custom-muted-mint/20 p-2 rounded-full">
        <Award className="h-6 w-6 text-custom-jet-black dark:text-custom-muted-mint" />
      </div>
      <div>
        <h4 className="font-medium text-custom-jet-black dark:text-custom-muted-mint">
          {badge?.name || 'New Badge'}
        </h4>
        <p className="text-sm text-custom-jet-black/80 dark:text-custom-muted-mint/80">
          {badge?.description || 'You earned a new badge!'}
        </p>
      </div>
    </div>
  );
};

export default BadgeUnlockedToast;
