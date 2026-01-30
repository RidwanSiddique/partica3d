import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/sessions/start - Start a new session
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const session = await prisma.session.create({
            data: {
                userId,
                gesturesUsed: {},
            },
        });

        return NextResponse.json(session, { status: 201 });
    } catch (error) {
        console.error('Error starting session:', error);
        return NextResponse.json(
            { error: 'Failed to start session' },
            { status: 500 }
        );
    }
}
