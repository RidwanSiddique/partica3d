import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/presets - Get all public presets or user's presets
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const publicOnly = searchParams.get('public') === 'true';

        let presets;

        if (publicOnly) {
            presets = await prisma.preset.findMany({
                where: { isPublic: true },
                orderBy: { createdAt: 'desc' },
            });
        } else if (userId) {
            presets = await prisma.preset.findMany({
                where: {
                    OR: [{ isPublic: true }, { createdBy: userId }],
                },
                orderBy: { createdAt: 'desc' },
            });
        } else {
            presets = await prisma.preset.findMany({
                where: { isPublic: true },
                orderBy: { createdAt: 'desc' },
            });
        }

        return NextResponse.json(presets);
    } catch (error) {
        console.error('Error fetching presets:', error);
        return NextResponse.json(
            { error: 'Failed to fetch presets' },
            { status: 500 }
        );
    }
}

// POST /api/presets - Create a new preset
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, description, isPublic, gestureMaps, particleConfig, createdBy } =
            body;

        if (!name || !gestureMaps || !particleConfig) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const preset = await prisma.preset.create({
            data: {
                name,
                description,
                isPublic: isPublic || false,
                gestureMaps,
                particleConfig,
                createdBy,
            },
        });

        return NextResponse.json(preset, { status: 201 });
    } catch (error) {
        console.error('Error creating preset:', error);
        return NextResponse.json(
            { error: 'Failed to create preset' },
            { status: 500 }
        );
    }
}
