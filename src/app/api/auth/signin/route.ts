// src/app/api/auth/signin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';
import { signToken } from '@/lib/jwt';
import { SignInRequest, AuthResponse } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const body: SignInRequest = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    const user = await authenticateUser(email, password);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
    });

    const response: AuthResponse = {
      success: true,
      token,
      user,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Sign in error:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}