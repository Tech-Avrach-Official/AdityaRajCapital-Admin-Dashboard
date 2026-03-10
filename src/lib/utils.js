import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** Resolve profile image URL: use as-is if absolute, else prepend storage base URL if set */
export function getProfileImageUrl(profileImage) {
  if (!profileImage || typeof profileImage !== "string") return null
  const trimmed = profileImage.trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  const base = import.meta.env.VITE_STORAGE_BASE_URL || ""
  if (!base) return trimmed
  return `${base.replace(/\/$/, "")}/${trimmed.replace(/^\//, "")}`
}
