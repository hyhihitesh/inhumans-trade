import { describe, expect, it } from "vitest";
import { verifyZerodhaPostbackChecksum } from "@/lib/brokers/zerodha-oauth";

describe("verifyZerodhaPostbackChecksum", () => {
  const apiSecret = "test_secret";
  const orderId = "12345";
  const orderTimestamp = "2026-03-30 10:00:00";
  
  // SHA-256("12345" + "2026-03-30 10:00:00" + "test_secret")
  // Using a tool to pre-calculate or just testing the logic:
  // echo -n "123452026-03-30 10:00:00test_secret" | shasum -a 256
  const validChecksum = "733989c0b05391054f3c7e3f2c2539655a1608677c7c37651a08677c7c37651a"; // This is a placeholder, I'll calculate it properly in code if needed or just test the equality logic.

  it("returns true for a valid checksum", () => {
    // We'll calculate it in the test to ensure the utility matches the formula
    const crypto = require("node:crypto");
    const expected = crypto
      .createHash("sha256")
      .update(`${orderId}${orderTimestamp}${apiSecret}`)
      .digest("hex");

    const result = verifyZerodhaPostbackChecksum({
      apiSecret,
      orderId,
      orderTimestamp,
      checksum: expected,
    });
    expect(result).toBe(true);
  });

  it("returns false for an invalid checksum", () => {
    const result = verifyZerodhaPostbackChecksum({
      apiSecret,
      orderId,
      orderTimestamp,
      checksum: "wrong_checksum",
    });
    expect(result).toBe(false);
  });
});
