import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, genre, maxMembers } = body;

        if (!name || !genre || !maxMembers) {
            return new NextResponse(
                JSON.stringify({ error: '必須項目が入力されていません' }),
                { 
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        // 既存のルーム名をチェック
        const existingRoom = await prisma.room.findUnique({
            where: { name }
        });

        if (existingRoom) {
            return new NextResponse(
                JSON.stringify({ error: '同じ名前のルームが既に存在します' }),
                { 
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        const room = await prisma.room.create({
            data: {
                name,
                genre,
                maxMembers: parseInt(maxMembers),
            },
        });

        return new NextResponse(
            JSON.stringify({ room }),
            { 
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error) {
        console.error('Room creation error:', error);
        return new NextResponse(
            JSON.stringify({ error: 'ルームの作成に失敗しました' }),
            { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}
