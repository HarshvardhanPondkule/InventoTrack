// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// 1. Setup Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. POST route for image upload
export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    const res = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ resource_type: "image" }, function (error, result) {
        if (error) return reject(error);
        resolve(result);
      }).end(buffer);
    });

    return NextResponse.json({ success: true, data: res });
  } catch (err) {
    console.error("Cloudinary error:", err);
    return NextResponse.json({ success: false, error: "Cloudinary upload failed" }, { status: 500 });
  }
}
