import { Chapa } from "chapa-nodejs";

if (!process.env.CHAPA_SECRET_KEY) {
  throw new Error('CHAPA_SECRET_KEY is not defined in .env');
}

export const chapa = new Chapa({
  secretKey: process.env.CHAPA_SECRET_KEY,
});
