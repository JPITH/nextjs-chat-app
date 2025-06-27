// src/components/auth/AuthProvider.tsx - Version corrigée avec gestion d'erreur
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import type { User } from '@/types/database';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  retry: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const clearAuthState = () => {
    setUser(null);
    setError(null);
    
    // Nettoyer les cookies et le localStorage
    if (typeof window !== 'undefined') {
      // Supprimer les cookies Supabase
      document.cookie = 'supabase-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'supabase.auth.token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      // Nettoyer le localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('supabase.auth.token') || key.startsWith('sb-')) {
          localStorage.removeItem(key);
        }
      });
    }
  };

  const getUser = async (retryCount = 0) => {
    const maxRetries = 3;
    
    try {
      setError(null);
      const supabase = createClient();
      
      console.log(`🔄 Tentative de récupération utilisateur (${retryCount + 1}/${maxRetries + 1})`);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('❌ Erreur auth.getUser():', userError);
        
        // Si l'erreur indique que l'utilisateur n'existe pas dans le JWT
        if (userError.message.includes('User from sub claim in JWT does not exist')) {
          console.log('🧹 Nettoyage de la session corrompue...');
          
          // Forcer la déconnexion pour nettoyer la session
          try {
            await supabase.auth.signOut();
          } catch (signOutError) {
            console.error('Erreur lors de la déconnexion:', signOutError);
          }
          
          clearAuthState();
          setLoading(false);
          return;
        }
        
        // Pour d'autres erreurs, réessayer si on n'a pas atteint le max
        if (retryCount < maxRetries) {
          console.log(`🔄 Nouvelle tentative dans 1s...`);
          setTimeout(() => getUser(retryCount + 1), 1000);
          return;
        }
        
        // Après max tentatives, considérer comme non connecté
        setError(`Erreur d'authentification: ${userError.message}`);
        setUser(null);
        setLoading(false);
        return;
      }

      if (user) {
        console.log('✅ Utilisateur authentifié:', user.email);
        
        // Vérifier que le profil existe, sinon le créer
        try {
          let { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') {
            // Profil n'existe pas, le créer
            console.log('📝 Création du profil utilisateur...');
            
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email || '',
                name: user.user_metadata?.name || '',
              })
              .select()
              .single();

            if (insertError) {
              console.error('❌ Erreur création profil:', insertError);
              setError('Impossible de créer le profil utilisateur');
              setLoading(false);
              return;
            }
            
            profile = newProfile;
            console.log('✅ Profil créé avec succès');
          } else if (profileError) {
            console.error('❌ Erreur récupération profil:', profileError);
            setError('Erreur lors de la récupération du profil');
            setLoading(false);
            return;
          }

          // Utiliser les données du profil en priorité
          const userData: User = {
            id: user.id,
            email: profile?.email || user.email || '',
            user_metadata: {
              name: profile?.name || user.user_metadata?.name || '',
            },
          };

          setUser(userData);
        } catch (profileError) {
          console.error('❌ Erreur gestion profil:', profileError);
          // En cas d'erreur profil, utiliser quand même les données auth
          setUser(user as User);
        }
      } else {
        console.log('❌ Aucun utilisateur connecté');
        setUser(null);
      }
    } catch (error: any) {
      console.error('❌ Erreur complète getUser:', error);
      
      if (retryCount < maxRetries) {
        console.log(`🔄 Nouvelle tentative dans 2s...`);
        setTimeout(() => getUser(retryCount + 1), 2000);
        return;
      }
      
      setError(`Erreur de connexion: ${error.message}`);
      clearAuthState();
    } finally {
      if (retryCount >= maxRetries) {
        setLoading(false);
      }
    }
  };

  const retry = () => {
    setLoading(true);
    setError(null);
    getUser(0);
  };

  useEffect(() => {
    getUser();

    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`🔄 Auth state change: ${event}`, session?.user?.email || 'no user');
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ Utilisateur connecté via state change');
          setUser(session.user as User);
          setError(null);
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 Utilisateur déconnecté');
          clearAuthState();
          router.push('/auth/signin');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token rafraîchi');
          // Optionnel: re-vérifier l'utilisateur
          getUser();
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Affichage d'erreur avec possibilité de retry
  if (error && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Erreur d'authentification
          </h2>
          <p className="text-gray-600 mb-4 text-sm">
            {error}
          </p>
          <div className="space-y-2">
            <button
              onClick={retry}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Réessayer
            </button>
            <button
              onClick={() => {
                clearAuthState();
                router.push('/auth/signin');
              }}
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Se reconnecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, retry }}>
      {children}
    </AuthContext.Provider>
  );
}