"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signIn } from "@/lib/auth";
import { registerSchema } from "@/lib/validators/auth";
import { AuthError } from "next-auth";

export type AuthActionResult = {
  success: boolean;
  error?: string;
};

export async function registerAction(
  formData: FormData
): Promise<AuthActionResult> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { name, email, password, role } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { success: false, error: "An account with this email already exists" };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
    },
  });

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: "Account created but auto-login failed. Please log in manually." };
    }
    throw error;
  }
}

export async function loginAction(
  formData: FormData
): Promise<AuthActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email and password are required" };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: "Invalid email or password" };
    }
    throw error;
  }
}
