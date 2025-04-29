
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const HomePage = () => {
  const { isAuth } = useAuth();
  
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      <div className="flex-grow flex flex-col items-center justify-center text-center px-4 py-16 bg-gradient-to-b from-background to-secondary/50">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
          Build habits that last with Habit Forge
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">
          Track your daily routines, build streaks, and earn badges as you forge lasting habits through consistency and dedication.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {isAuth ? (
            <Button asChild size="lg">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild size="lg">
                <Link to="/register">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/login">Login</Link>
              </Button>
            </>
          )}
        </div>
      </div>
      
      <div className="py-16 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-card rounded-lg shadow-sm border">
              <div className="text-3xl mb-4">🔥</div>
              <h3 className="text-xl font-semibold mb-2">Build Streaks</h3>
              <p className="text-muted-foreground">Track your progress with daily streaks and watch your consistency grow day by day.</p>
            </div>
            
            <div className="p-6 bg-card rounded-lg shadow-sm border">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Visual Progress</h3>
              <p className="text-muted-foreground">See your history with GitHub-style heatmaps to visualize your consistency patterns.</p>
            </div>
            
            <div className="p-6 bg-card rounded-lg shadow-sm border">
              <div className="text-3xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold mb-2">Earn Badges</h3>
              <p className="text-muted-foreground">Unlock achievements as you hit streak milestones and build lasting habits.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
