import sharp from "sharp";

export const getScaledThumbnail = async (thumbData: string) => {
  try {
    const data = thumbData.split("base64,")[1];

    const buffer = Buffer.from(data, "base64");

    const chain = sharp(buffer).resize(320, 180, {
      fit: "cover",
    });

    const [jpeg, webp] = await Promise.all([
      chain.jpeg().toBuffer(),
      chain.webp().toBuffer(),
    ]);

    return {
      thumbs: {
        jpeg,
        webp,
      },
    };
  } catch (err) {
    return {
      error: new Error("Couldn't process thumbnail:" + (err as Error).message),
    };
  }
};
