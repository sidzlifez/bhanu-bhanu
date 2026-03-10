import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

// School Configuration - Change these values
const SCHOOL_CONFIG = {
  name: 'EduCore',
  logo: BookOpen,
};

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = login(email, password);
    if (!success) {
      setError('Invalid email or password');
    }
  };

  const LogoIcon = SCHOOL_CONFIG.logo;

  return (
    <div className="min-h-screen bg-[#F4F6FA] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-xl bg-[#2E5BFF] flex items-center justify-center mx-auto mb-4">
            <LogoIcon className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">{SCHOOL_CONFIG.name}</CardTitle>
          <CardDescription>Sign in to access your school management system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@school.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full bg-[#2E5BFF] hover:bg-[#1E4BEF]">
              Sign In
            </Button>
          </form>

          <div className="mt-6 p-4 bg-[#F4F6FA] rounded-lg text-sm">
            <p className="font-medium text-[#111827] mb-2">Default Login Credentials:</p>
            <div className="space-y-1 text-[#6B7280]">
              <p><strong>Admin:</strong> admin@school.com / admin123</p>
              <p><strong>Principal:</strong> principal@school.com / principal123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
