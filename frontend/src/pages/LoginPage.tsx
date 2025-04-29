
import Header from '@/components/layout/Header';
import LoginForm from '@/components/auth/LoginForm';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow flex items-center justify-center p-4">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
