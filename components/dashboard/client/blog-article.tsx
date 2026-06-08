"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, Lightbulb } from "lucide-react";

import { GlassCard } from "@/components/dashboard/client/glass-card";
import type { BlogPost } from "@/lib/content/blog-posts";
import { formatDate } from "@/lib/format-date";

type BlogArticleProps = {
  post: BlogPost;
};

export function BlogArticle({ post }: BlogArticleProps) {
  return (
    <div className="portal-page mx-auto max-w-3xl space-y-6">
      <Link
        href="/dashboard/blog"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#6D28D9] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Blog
      </Link>

      <article>
        <div className="relative aspect-[21/9] overflow-hidden rounded-2xl bg-slate-100 sm:aspect-[2.4/1]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.image}
            alt={post.imageAlt}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1e1b4b]/80 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#6D28D9]">
                {post.category}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-black/35 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                <Clock className="h-3 w-3" />
                {post.readMinutes} min read
              </span>
            </div>
            <h1 className="mt-3 text-xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
              {post.title}
            </h1>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
          <span>{formatDate(post.publishedAt) ?? post.publishedAt}</span>
          <span aria-hidden>·</span>
          <span>{post.author}</span>
        </div>

        <p className="mt-4 text-base leading-relaxed text-slate-700 sm:text-lg">
          {post.excerpt}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
            >
              #{tag}
            </span>
          ))}
        </div>

        <GlassCard padding="lg" className="mt-6 space-y-8">
          {post.sections.map((section, i) => (
            <div key={i}>
              {section.heading ? (
                <h2 className="text-lg font-semibold text-slate-900">
                  {section.heading}
                </h2>
              ) : null}
              <p
                className={
                  section.heading
                    ? "mt-2 text-sm leading-relaxed text-slate-600 sm:text-[15px]"
                    : "text-sm leading-relaxed text-slate-600 sm:text-[15px]"
                }
              >
                {section.body}
              </p>
              {section.bullets?.length ? (
                <ul className="mt-3 space-y-2">
                  {section.bullets.map((item) => (
                    <li
                      key={item}
                      className="flex gap-2.5 text-sm leading-relaxed text-slate-600 sm:text-[15px]"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#6D28D9]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </GlassCard>

        <div className="mt-6 rounded-2xl border border-[#6D28D9]/20 bg-gradient-to-br from-[#F5F3FF] to-white p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#6D28D9] text-white">
              <Lightbulb className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Key takeaways for brand owners
              </h3>
              <ul className="mt-3 space-y-2">
                {post.keyTakeaways.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-sm leading-relaxed text-slate-700"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6D28D9]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-center sm:p-6">
          <p className="text-sm font-medium text-slate-900">
            Ready to apply this on your listing?
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Update your brand profile and use Marketplace Preview before you submit.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard/brands"
              className="rounded-xl bg-[#6D28D9] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-95"
            >
              View My Brands
            </Link>
            <Link
              href="/dashboard/marketplace-preview"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Marketplace Preview
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
