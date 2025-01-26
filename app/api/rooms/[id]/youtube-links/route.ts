import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const youtubeLinks = await prisma.youtubeLink.findMany({
            where: {
                roomId: params.id
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return new NextResponse(
            JSON.stringify(youtubeLinks),
            { 
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error) {
        console.error('Error fetching youtube links:', error);
        return new NextResponse(
            JSON.stringify({ error: '動画リストの取得に失敗しました' }),
            { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { videoId } = body;

        if (!videoId) {
            return new NextResponse(
                JSON.stringify({ error: '動画IDが必要です' }),
                { 
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        const youtubeLink = await prisma.youtubeLink.create({
            data: {
                videoId,
                roomId: params.id
            }
        });

        return new NextResponse(
            JSON.stringify(youtubeLink),
            { 
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error) {
        console.error('Error adding youtube link:', error);
        return new NextResponse(
            JSON.stringify({ error: '動画の追加に失敗しました' }),
            { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { searchParams } = new URL(request.url);
        const linkId = searchParams.get('linkId');

        if (!linkId) {
            return new NextResponse(
                JSON.stringify({ error: '動画IDが必要です' }),
                { 
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        await prisma.youtubeLink.delete({
            where: {
                id: linkId,
                roomId: params.id
            }
        });

        return new NextResponse(
            JSON.stringify({ success: true }),
            { 
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error) {
        console.error('Error deleting youtube link:', error);
        return new NextResponse(
            JSON.stringify({ error: '動画の削除に失敗しました' }),
            { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}
