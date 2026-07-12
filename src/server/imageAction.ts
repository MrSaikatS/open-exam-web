"use server";

import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import sharp from "sharp";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

export const createImage = async (imageFile: File) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  if (imageFile.size > MAX_AVATAR_SIZE)
    throw new Error("Image must be under 2MB");

  const imageName = `${crypto.randomUUID()}.jpg`;

  const imgArrayBuffer = await imageFile.arrayBuffer();

  await sharp(imgArrayBuffer)
    .resize({
      width: 640,
      height: 360,
    })
    .jpeg({
      quality: 87,
      mozjpeg: true,
    })
    .toFile(`./public/uploads/${imageName}`);

  const imageUrl = `/uploads/${imageName}`;

  return imageUrl;
};

const UUID_JPG_RE =
  /^\/uploads\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.jpg$/i;

export const deleteImage = async (imageUrl: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  if (!UUID_JPG_RE.test(imageUrl)) throw new Error("Invalid image URL");

  const resolved = resolve(`./public${imageUrl}`);
  const uploadsDir = resolve("./public/uploads");
  if (!resolved.startsWith(uploadsDir)) throw new Error("Invalid image URL");

  await rm(resolved);
};
