import sharp from "sharp";
export async function sanitizeProof(bytes: Buffer, type: string) {
  if (bytes.length === 0 || bytes.length > 5 * 1024 * 1024)
    throw Error("Choose an image up to 5 MB.");
  const png = bytes
    .subarray(0, 8)
    .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if (!((png && type === "image/png") || (jpeg && type === "image/jpeg")))
    throw Error("Choose a valid PNG or JPEG image.");
  const image = sharp(bytes, { limitInputPixels: 20000000, failOn: "warning" });
  const metadata = await image.metadata();
  if (!metadata.width || !metadata.height || (metadata.pages || 1) > 1)
    throw Error("Use a single, valid image.");
  // Re-encode, strip EXIF/location data and constrain image dimensions before private storage.
  return image
    .rotate()
    .resize({
      width: 1600,
      height: 1600,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 85 })
    .toBuffer();
}
