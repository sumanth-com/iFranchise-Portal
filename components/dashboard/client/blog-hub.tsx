"use client";

import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

import { BlogCardCover } from "@/components/dashboard/client/blog-card-cover";
import { PortalPageHeader } from "@/components/dashboard/client/portal-page-header";
import type { BlogPost } from "@/lib/content/blog-posts";

type BlogHubProps = {
  posts: BlogPost[];
};

export function BlogHub({ posts }: BlogHubProps) {
  return (
    <div className="portal-page space-y-6">
      <PortalPageHeader
        eyebrow="Resources"
        title="Blog"
        description="Franchise growth, SEO, and digital marketing insights — written for brand owners who want more qualified investor enquiries."
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/dashboard/blog/${post.slug}`}
            className="group flex flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#6D28D9]/20 hover:shadow-md"
          >
            <div className="relative h-36 overflow-hidden bg-slate-100">
              <BlogCardCover
                src={post.image}
                alt={post.imageAlt}
                className="transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1e1b4b]/50 via-transparent to-transparent" />
              <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                <Clock className="h-3 w-3" />
                {post.readMinutes} min
              </span>
            </div>

            <div className="flex flex-1 flex-col p-3.5">
              <h2 className="line-clamp-2 text-[15px] font-bold leading-snug text-slate-900 transition-colors group-hover:text-[#6D28D9]">
                {post.title}
              </h2>
              <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#6D28D9]">
                Read article
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
