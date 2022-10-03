import sharp from "sharp";

export async function getProfilePictureFromBase64(data: string) {
  const imageData = data.split("base64,")[1];

  const buffer = Buffer.from(imageData, "base64");

  return sharp(buffer)
    .resize(128, 128, {
      fit: "cover",
    })
    .jpeg()
    .toBuffer();
}

export const getTopicThumbnailsFromBase64 = async (data: string) => {
  const imageData = data.split("base64,")[1];

  const buffer = Buffer.from(imageData, "base64");

  const chain = sharp(buffer).resize(320, 180, {
    fit: "cover",
  });

  const [jpeg, webp] = await Promise.all([chain.jpeg().toBuffer(), chain.webp().toBuffer()]);

  return {
    jpeg,
    webp,
  };
};
