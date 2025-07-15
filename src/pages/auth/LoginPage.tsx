// src/pages/auth/LoginPage.tsx
import LoginForm from '../../features/auth/components/LoginForm';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = (token: string) => {
    localStorage.setItem('token', token);
    navigate('/dashboard');
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <LoginForm onLogin={handleLogin} />
    </div>
  );
}
