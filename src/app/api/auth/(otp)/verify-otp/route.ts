import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // Find OTP entry
    const emailOtp = await prisma.emailOtp.findFirst({
      where: { email, verified: false },
      orderBy: { createdAt: "desc" },
    });

    if (!emailOtp) {
      return NextResponse.json({ error: "OTP not found" }, { status: 404 });
    }

    // Check expiry
    if (emailOtp.expiresAt < new Date()) {
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    // Verify OTP hash
    const isValid = await bcrypt.compare(otp, emailOtp.tokenHash);
    if (!isValid) {
      // Increment attempt counter
      await prisma.emailOtp.update({
        where: { id: emailOtp.id },
        data: { attempts: { increment: 1 } },
      });

      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // Mark EmailOtp as verified
    await prisma.emailOtp.update({
      where: { id: emailOtp.id },
      data: { verified: true },
    });

    // Update User to mark email verified
    await prisma.user.update({
      where: { email },
      data: { emailVerified: true },
    });

    return NextResponse.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
