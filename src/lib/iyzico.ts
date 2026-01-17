// src/lib/iyzico.ts
// @ts-ignore
import Iyzipay from "iyzipay";

const iyzico = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY || "sandbox-key",
  secretKey: process.env.IYZICO_SECRET_KEY || "sandbox-secret",
  uri: "https://sandbox-api.iyzipay.com",
});

export { iyzico };