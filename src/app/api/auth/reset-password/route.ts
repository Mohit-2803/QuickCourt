// app/api/reset-password/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

const SALT_ROUNDS = 10;

export async function POST(request: Request) {
  try {
    const { token, email, newPassword } = await request.json();

    if (
      !token ||
      typeof token !== "string" ||
      !email ||
      typeof email !== "string" ||
      !newPassword ||
      typeof newPassword !== "string"
    ) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    // Get user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // For security don't reveal user absence explicitly
      return NextResponse.json(
        { message: "Invalid token or email" },
        { status: 400 }
      );
    }

    // Find reset token record which is not used and not expired
    const resetTokenRecord = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!resetTokenRecord) {
      return NextResponse.json(
        { message: "Reset token expired or invalid" },
        { status: 400 }
      );
    }

    // Verify hash of token matches stored hash
    const isValid = await bcrypt.compare(token, resetTokenRecord.tokenHash);
    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid reset token" },
        { status: 400 }
      );
    }

    // Hash the new password securely
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update user password and mark token as used in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetTokenRecord.id },
        data: { used: true },
      }),
    ]);

    return NextResponse.json(
      { message: "Password has been reset successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
