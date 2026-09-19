export const MIN_OTP_LENGTH=6;
export const MAX_OTP_LENGTH=8;
export function normalizeOtp(value:string){return value.replace(/\D/g,"").slice(0,MAX_OTP_LENGTH)}
export function resolveOtpLength(value:string){const length=value.replace(/\D/g,"").length;return length>=MIN_OTP_LENGTH&&length<=MAX_OTP_LENGTH?length:null}
