"use client";

import Image from "next/image";

import { avatarGradient } from "@/lib/team/directory-data";
import { cn } from "@/lib/utils";

type TeamMemberAvatarProps = {
  name: string;
  image: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizes = {
  sm: "h-10 w-10 text-xs",
  md: "h-14 w-14 text-sm",
  lg: "h-20 w-20 text-lg",
  xl: "h-24 w-24 text-xl",
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function TeamMemberAvatar({
  name,
  image,
  size = "md",
  className,
}: TeamMemberAvatarProps) {
  if (image?.startsWith("data:") || image?.startsWith("http")) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow-sm",
          sizes[size],
          className,
        )}
      >
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          unoptimized={image.startsWith("data:")}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold text-white ring-2 ring-white shadow-sm",
        sizes[size],
        className,
      )}
      style={{ background: avatarGradient(name) }}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}
