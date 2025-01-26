import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    // 入力値の検証
    if (!username || !email || !password) {
      return NextResponse.json(
        { message: "必須項目が入力されていません" },
        { status: 400 }
      );
    }

    // メールアドレスの形式を検証
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "メールアドレスの形式が正しくありません" },
        { status: 400 }
      );
    }

    // パスワードの長さを検証
    if (password.length < 8) {
      return NextResponse.json(
        { message: "パスワードは8文字以上である必要があります" },
        { status: 400 }
      );
    }

    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "このメールアドレスは既に登録されています" },
        { status: 400 }
      );
    }

    // パスワードのハッシュ化
    const hashedPassword = await hash(password, 10);

    // ユーザーの作成
    const user = await prisma.user.create({
      data: {
        name: username,
        email,
        password: hashedPassword,
      },
    });

    // パスワードを除外してユーザー情報を返す
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: "ユーザー登録が完了しました",
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "ユーザー登録中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
