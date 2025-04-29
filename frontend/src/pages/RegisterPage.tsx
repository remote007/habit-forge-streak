
import Header from '@/components/layout/Header';
import RegisterForm from '@/components/auth/RegisterForm';

const RegisterPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow flex items-center justify-center p-4">
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;
