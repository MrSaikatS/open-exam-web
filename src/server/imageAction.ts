"use server";

import { rm } from "node:fs/promises";
import sharp from "sharp";

export const createImage = async (imageFile: File) => {
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

export const deleteImage = async (imageUrl: string) => {
  await rm(`./public${imageUrl}`);
};
