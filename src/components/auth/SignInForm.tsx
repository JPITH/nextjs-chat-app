// src/components/auth/SignInForm.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (error: any) {
      if (error.message.includes('Email not confirmed')) {
        setError('Votre email n\'est pas encore confirmé. Vérifiez votre boîte mail.');
      } else if (error.message.includes('Invalid login credentials')) {
        setError('Email ou mot de passe incorrect.');
      } else {
        setError(error.message || 'Erreur de connexion');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Connexion</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre@email.com"
              />
              
              <Input
                label="Mot de passe"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />

              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>

              <div className="text-center space-y-2">
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm text-blue-600 hover:underline block"
                >
                  Mot de passe oublié ?
                </Link>
                <div className="text-sm text-gray-600">
                  Pas encore de compte ?{' '}
                  <Link href="/auth/signup" className="text-blue-600 hover:underline font-medium">
                    S'inscrire
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}