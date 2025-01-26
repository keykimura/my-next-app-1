import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const rooms = await prisma.room.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(rooms);
    } catch (error) {
        console.error('Error fetching rooms:', error);
        return NextResponse.json(
            { error: 'ルームの取得に失敗しました' },
            { status: 500 }
        );
    }
}
