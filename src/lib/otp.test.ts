import assert from "node:assert/strict";
import test from "node:test";
import { normalizeOtp, resolveOtpLength } from "./otp.ts";

test("normalizeOtp accepts the eight-digit Supabase token",()=>{
  assert.equal(normalizeOtp("12 34-56a78"),"12345678");
});

test("normalizeOtp preserves valid six-digit tokens",()=>{
  assert.equal(normalizeOtp("120045"),"120045");
});

test("resolveOtpLength supports six through eight digits",()=>{
  assert.equal(resolveOtpLength("123456"),6);
  assert.equal(resolveOtpLength("1234567"),7);
  assert.equal(resolveOtpLength("12345678"),8);
  assert.equal(resolveOtpLength("12345"),null);
  assert.equal(resolveOtpLength("123456789"),null);
});
