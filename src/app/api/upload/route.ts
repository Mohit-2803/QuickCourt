import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";

interface UploadResult {
  secure_url: string;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadRes = await new Promise<UploadResult>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "sportsbook/avatars" }, (err, result) => {
          if (err) reject(err);
          else if (result) resolve(result);
          else reject(new Error("Upload result is undefined"));
        })
        .end(buffer);
    });

    return NextResponse.json({ url: uploadRes.secure_url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
