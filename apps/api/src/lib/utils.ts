import crypto from "node:crypto";
import { z } from "zod";

export function cleanUndefined<T extends object>(obj: T) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined),
  ) as { [K in keyof T]-?: NonNullable<T[K]> };
}

export function generateConfirmationNumber(): string {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

export function moneyAmountString() {
  return z
    .string()
    .regex(/^(0|[1-9]\d*)\.\d{2}$/, { message: "Must be a number with exactly 2 decimal places" })
    .refine(val => parseFloat(val) > 0, { message: "Money amount must be greater than 0" });
}
