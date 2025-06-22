// src/app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/auth';
import { signToken } from '@/lib/jwt';
import { SignUpRequest, AuthResponse } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const body: SignUpRequest = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Format d\'email invalide' },
        { status: 400 }
      );
    }

    const user = await createUser(email, password, name);

    const token = signToken({
      userId: user.id,
      email: user.email,
    });

    const response: AuthResponse = {
      success: true,
      token,
      user,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Sign up error:', error);
    
    if (error instanceof Error && error.message === 'User already exists') {
      return NextResponse.json(
        { success: false, message: 'Cet email est déjà utilisé' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}