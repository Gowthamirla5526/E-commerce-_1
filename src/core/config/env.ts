import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().default("file:./dev.db"),
  NEXT_PUBLIC_APP_NAME: z.string().default("Fresh Harvest"),
  NEXT_PUBLIC_APP_TAGLINE: z.string().default("Next-Generation Perishable Produce Commerce"),
  NEXT_PUBLIC_CURRENCY_CODE: z.string().default("INR"),
  NEXT_PUBLIC_LOCALE: z.string().default("en-IN"),
  NEXT_PUBLIC_DEFAULT_TIMEZONE: z.string().default("Asia/Kolkata"),
  RAZORPAY_KEY_ID: z.string().default("rzp_test_fresh_harvest_demo"),
  RAZORPAY_KEY_SECRET: z.string().default("fresh_harvest_mock_secret_key"),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().default("rzp_test_fresh_harvest_demo"),
  JWT_SECRET: z.string().default("fresh_harvest_super_secure_jwt_secret_token_asia_kolkata_2026"),
  ADMIN_BOOTSTRAP_KEY: z.string().default("admin_master_access_key_fresh_harvest_2026"),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_TAGLINE: process.env.NEXT_PUBLIC_APP_TAGLINE,
  NEXT_PUBLIC_CURRENCY_CODE: process.env.NEXT_PUBLIC_CURRENCY_CODE,
  NEXT_PUBLIC_LOCALE: process.env.NEXT_PUBLIC_LOCALE,
  NEXT_PUBLIC_DEFAULT_TIMEZONE: process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  JWT_SECRET: process.env.JWT_SECRET,
  ADMIN_BOOTSTRAP_KEY: process.env.ADMIN_BOOTSTRAP_KEY,
});

