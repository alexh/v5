import { NextResponse } from "next/server";
import { Feed } from "feed";
import { getBlogPosts } from "../../../lib/blog";

export async function GET() {
  try {
    const posts = getBlogPosts();

    const feed = new Feed({
      title: "Alex Haynes - Blog",
      description:
        "Technical insights on AI development, and creative engineering",
      id: "https://alexhaynes.org/blog",
      link: "https://alexhaynes.org/blog",
      language: "en",
      image: "https://alexhaynes.org/icons/icon-512x512.png",
      favicon: "https://alexhaynes.org/icons/icon-48x48.png",
      copyright: `© ${new Date().getFullYear()} Alex Haynes`,
      updated: posts.length > 0 ? new Date(posts[0].date) : new Date(),
      generator: "Next.js",
      feedLinks: {
        rss2: "https://alexhaynes.org/blog/rss.xml",
      },
      author: {
        name: "Alex Haynes",
        email: "alex@alexhaynes.org",
        link: "https://alexhaynes.org",
      },
    });

    posts.forEach((post) => {
      feed.addItem({
        title: post.title,
        id: `https://alexhaynes.org/blog/${post.slug}`,
        link: `https://alexhaynes.org/blog/${post.slug}`,
        description: post.excerpt,
        content: post.content,
        author: [
          {
            name: post.author || "Alex Haynes",
            email: "alex@alexhaynes.org",
            link: "https://alexhaynes.org",
          },
        ],
        date: new Date(post.date),
        category: post.tags?.map((tag) => ({ name: tag })) || [],
      });
    });

    return new NextResponse(feed.rss2(), {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Error generating RSS feed:", error);
    return NextResponse.json(
      { error: "Failed to generate RSS feed" },
      { status: 500 }
    );
  }
}
