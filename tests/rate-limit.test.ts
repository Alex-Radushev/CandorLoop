import { beforeEach, describe, expect, it } from "vitest";

import { checkRateLimit, clearRateLimitsForTests } from "@/lib/rate-limit";

describe("in-memory request guard", () => {
  beforeEach(() => clearRateLimitsForTests());

  it("allows the first twenty requests in the window", () => {
    for (let index = 0; index < 20; index += 1) {
      expect(checkRateLimit("cl_test", 1000).allowed).toBe(true);
    }
    expect(checkRateLimit("cl_test", 1000).allowed).toBe(false);
  });

  it("resets after the ten-minute window", () => {
    for (let index = 0; index < 20; index += 1) checkRateLimit("cl_test", 1000);
    expect(checkRateLimit("cl_test", 601001).allowed).toBe(true);
  });
});
