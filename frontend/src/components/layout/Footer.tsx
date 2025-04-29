
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-auto py-6 border-t border-custom-muted-plum/30 bg-custom-powder-blue/10">
      <div className="container mx-auto px-4 text-center">
        <p className="flex items-center justify-center gap-1 text-sm text-custom-vintage-teal dark:text-custom-soft-peach">
          Made with <Heart className="h-4 w-4 text-custom-dusty-rose" /> by Habit Forge
        </p>
        <p className="text-xs mt-2 text-custom-muted-plum dark:text-custom-lavender-fog">
          Building better habits, one day at a time
        </p>
      </div>
    </footer>
  );
};

export default Footer;
