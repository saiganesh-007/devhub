import { z } from "zod";
export const searchSchema = z.string().trim().min(1).max(100);
export const usernameSchema = z.string().regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/);
export const repoPartSchema = z.string().regex(/^[\w.-]{1,100}$/);
export const authSchema = z.object({ email:z.email(), password:z.string().min(8).max(128) });

