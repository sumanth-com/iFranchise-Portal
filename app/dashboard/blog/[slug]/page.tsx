import { notFound } from "next/navigation";

import { BlogArticle } from "@/components/dashboard/client/blog-article";
import { BLOG_POSTS, getBlogPost } from "@/lib/content/blog-posts";

type BlogArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) notFound();

  return <BlogArticle post={post} />;
}
