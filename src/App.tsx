import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();

  return isAuthenticated ? (
    <Dashboard />
  ) : (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <AuthForm />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--toaster-bg)',
                color: 'var(--toaster-color)',
                border: 'var(--toaster-border)',
              },
            }}
          />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}
