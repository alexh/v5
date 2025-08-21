import { Metadata } from "next";
import { getBlogPost } from "../../../lib/blog";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = getBlogPost(params.slug);

  if (!post) {
    return {
      title: "Post Not Found - Alex Haynes Blog",
      description: "The requested blog post could not be found.",
    };
  }

  const siteName = "Alex Haynes";
  const siteUrl = "https://alexhaynes.org";
  const postUrl = `${siteUrl}/blog/${post.slug}`;

  return {
    title: `${post.title} - ${siteName}`,
    description: post.excerpt,
    authors: [{ name: post.author || "Alex Haynes" }],
    keywords: post.tags?.join(", "),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: postUrl,
      siteName,
      authors: [post.author || "Alex Haynes"],
      publishedTime: post.date,
      tags: post.tags,
      images: [
        {
          url: `${siteUrl}/icons/icon-512x512.png`,
          width: 512,
          height: 512,
          alt: siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      creator: "@your_twitter_handle", // Replace with your Twitter handle
      images: [`${siteUrl}/icons/icon-512x512.png`],
    },
    alternates: {
      canonical: postUrl,
    },
  };
}
