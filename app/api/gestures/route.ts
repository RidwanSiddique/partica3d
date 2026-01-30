import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/gestures - Get all gesture mappings for a user
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const gestureMappings = await prisma.gestureMapping.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(gestureMappings);
    } catch (error) {
        console.error('Error fetching gesture mappings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch gesture mappings' },
            { status: 500 }
        );
    }
}

// POST /api/gestures - Create a new gesture mapping
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, gestureName, action, objectType, parameters } = body;

        if (!userId || !gestureName || !action) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const gestureMapping = await prisma.gestureMapping.create({
            data: {
                userId,
                gestureName,
                action,
                objectType,
                parameters,
            },
        });

        return NextResponse.json(gestureMapping, { status: 201 });
    } catch (error) {
        console.error('Error creating gesture mapping:', error);
        return NextResponse.json(
            { error: 'Failed to create gesture mapping' },
            { status: 500 }
        );
    }
}

// DELETE /api/gestures - Delete a gesture mapping
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Gesture mapping ID is required' },
                { status: 400 }
            );
        }

        await prisma.gestureMapping.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting gesture mapping:', error);
        return NextResponse.json(
            { error: 'Failed to delete gesture mapping' },
            { status: 500 }
        );
    }
}
