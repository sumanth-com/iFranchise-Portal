"use client";

import Image from "next/image";

import { avatarGradient } from "@/lib/team/directory-data";
import { cn } from "@/lib/utils";

type TeamMemberAvatarProps = {
  name: string;
  image: string | null;
  size?: "sm" | "md" | "card" | "lg" | "xl" | "profile";
  className?: string;
  /** CSS object-position for photo crops, e.g. "center top". */
  imagePosition?: string;
};

const sizeConfig = {
  sm: { box: "h-10 w-10 text-xs", round: "rounded-full" },
  md: { box: "h-14 w-14 text-sm", round: "rounded-full" },
  card: { box: "h-[4.5rem] w-[4.5rem] text-sm", round: "rounded-2xl" },
  lg: { box: "h-20 w-20 text-lg", round: "rounded-full" },
  xl: { box: "h-24 w-24 text-xl", round: "rounded-full" },
  profile: { box: "h-40 w-40 text-2xl", round: "rounded-2xl" },
} as const;

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
  imagePosition = "center top",
}: TeamMemberAvatarProps) {
  const { box, round } = sizeConfig[size];

  if (
    image?.startsWith("data:") ||
    image?.startsWith("http") ||
    image?.startsWith("/")
  ) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden bg-slate-100 ring-2 ring-violet-100/80 shadow-sm",
          box,
          round,
          className,
        )}
      >
        <Image
          src={image}
          alt={name}
          fill
          sizes={
            size === "profile"
              ? "160px"
              : size === "card"
                ? "72px"
                : "96px"
          }
          className="object-cover [transform:translateZ(0)]"
          style={{ objectPosition: imagePosition }}
          unoptimized={image.startsWith("data:")}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center font-bold text-white ring-2 ring-violet-100/80 shadow-sm",
        box,
        round,
        className,
      )}
      style={{ background: avatarGradient(name) }}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}
