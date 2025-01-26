ｚimport { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const room = await prisma.room.findUnique({
            where: {
                id: params.id
            },
            include: {
                youtubeLinks: true,
                messages: {
                    orderBy: {
                        timestamp: 'asc'
                    }
                }
            }
        });

        if (!room) {
            return NextResponse.json(
                { error: 'ルームが見つかりません' },
                { status: 404 }
            );
        }

        return NextResponse.json(room);
    } catch (error) {
        console.error('Error fetching room:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: `ルーム情報の取得に失敗しました: ${errorMessage}` },
            { status: 500 }
        );
    }
}
