import axios from "axios";
import { RECAPTCHA_SECRET } from "$env/static/private";

export async function verifyCaptchaToken(token: string) {
  const res = await axios.post(
    "https://www.google.com/recaptcha/api/siteverify",
    new URLSearchParams({
      secret: RECAPTCHA_SECRET,
      response: token,
    })
  );

  if (!res.data.success) throw new Error("Invalid captcha token");
}
