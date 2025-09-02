// app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signupSchema } from "@/lib/validation";
import prisma from "@/lib/prisma";
import { sendOTPEMail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password, role } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        fullName: name,
        email,
        passwordHash: hashedPassword,
        role,
        emailVerified: false,
      },
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const tokenHash = await bcrypt.hash(otp, 10);

    await prisma.emailOtp.upsert({
      where: { email },
      update: {
        tokenHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // reset expiry
        attempts: 0,
        verified: false,
      },
      create: {
        email,
        tokenHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        attempts: 0,
        verified: false,
      },
    });

    await sendOTPEMail(email, otp);

    return NextResponse.json(
      { message: "Signup successful, OTP sent!" },
      { status: 201 }
    );
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
