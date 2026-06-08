import { BlogHub } from "@/components/dashboard/client/blog-hub";
import { BLOG_POSTS } from "@/lib/content/blog-posts";

export default function BlogPage() {
  return <BlogHub posts={BLOG_POSTS} />;
}
