import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function ResetPassword() {
  const [search] = useSearchParams();
  const token = search.get('token') || '';
  const email = search.get('email') || '';
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  async function handleReset() {
    if (!token) return toast({ title: 'Missing token', description: 'Please use the reset link sent to your email', variant: 'destructive' });
    if (!newPassword || newPassword.length < 6) return toast({ title: 'Invalid password', description: 'Password must be at least 6 chars', variant: 'destructive' });
    setIsLoading(true);
    try {
      await resetPassword(token, newPassword);
      toast({ title: 'Password reset', description: 'You can now login with your new password.' });
      navigate('/login');
    } catch (err: any) {
      toast({ title: 'Reset failed', description: err.message || 'Could not reset password', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Reset Password</h2>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} readOnly className="h-11" />
          </div>
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="h-11" />
          </div>
          <Button onClick={handleReset} disabled={isLoading} className="w-full">
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </div>
      </div>
    </div>
  );
}
