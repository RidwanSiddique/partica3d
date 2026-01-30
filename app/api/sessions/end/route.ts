import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/sessions/end - End a session
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { sessionId, gesturesUsed } = body;

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Session ID is required' },
                { status: 400 }
            );
        }

        const session = await prisma.session.findUnique({
            where: { id: sessionId },
        });

        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        const duration = Math.floor(
            (Date.now() - session.startTime.getTime()) / 1000
        );

        const updatedSession = await prisma.session.update({
            where: { id: sessionId },
            data: {
                endTime: new Date(),
                duration,
                gesturesUsed: gesturesUsed || session.gesturesUsed,
            },
        });

        return NextResponse.json(updatedSession);
    } catch (error) {
        console.error('Error ending session:', error);
        return NextResponse.json(
            { error: 'Failed to end session' },
            { status: 500 }
        );
    }
}
