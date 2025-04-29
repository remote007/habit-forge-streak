
import { Button } from "@/components/ui/button";
import Header from '@/components/layout/Header';
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-5xl font-bold mb-2">404</h1>
        <p className="text-xl mb-6">Oops! Page not found</p>
        <Button asChild>
          <Link to="/">Return Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
