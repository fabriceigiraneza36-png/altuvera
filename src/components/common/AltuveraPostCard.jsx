import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Bookmark,
  CalendarDays,
  Clock3,
  Eye,
  FileText,
  Heart,
} from "lucide-react";
import "./AltuveraPostCard.css";

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatReadTime = (value) => {
  if (value == null || value === "") return "";
  if (typeof value === "number") return value > 0 ? `${value} min read` : "";
  return String(value).trim();
};

export default function AltuveraPostCard({
  post = {},
  index = 0,
  to,
  fill = false,
  featured = false,
  showActions = false,
  isBookmarked = false,
  onBookmark,
  className = "",
}) {
  const [liked, setLiked] = useState(false);
  const slug = post.slug || post.id || post._id || "";
  const href = to || `/post/${encodeURIComponent(slug)}`;
  const image = post.image_url || post.image || post.cover_image_url || post.coverImageUrl || "";
  const date = formatDate(post.published_at || post.publishedAt || post.created_at || post.createdAt || post.date);
  const readTime = formatReadTime(post.read_time ?? post.readTime);
  const views = Number(post.view_count ?? post.viewCount ?? post.views ?? 0);
  const excerpt = String(post.excerpt || post.summary || "").trim();
  const category = post.category || "Travel story";
  const title = post.title || "Untitled story";
  const isFeatured = featured || Boolean(post.is_featured || post.featured);

  return (
    <div
      className={`av-post-card-wrap ${fill ? "av-post-card-wrap--fill" : ""} ${className}`}
      style={{ animationDelay: `${Math.max(0, Number(index) || 0) * 70}ms` }}
    >
      <Link to={href} className="hpost-card av-post-card">
        <div className="hpost-img-wrap av-post-card__media">
          {image ? (
            <img
              src={image}
              alt={title}
              className="hpost-img av-post-card__image"
              loading="lazy"
            />
          ) : (
            <div className="av-post-card__placeholder" aria-hidden="true">
              <FileText size={30} strokeWidth={1.6} />
            </div>
          )}
          <span className="av-post-card__image-shade" aria-hidden="true" />
          <span className="hpost-category av-post-card__category">{category}</span>
          {isFeatured && <span className="av-post-card__featured">Featured</span>}
        </div>

        <div className="hpost-body av-post-card__body">
          <div className="hpost-meta av-post-card__meta">
            {date && <span><CalendarDays size={12} aria-hidden="true" />{date}</span>}
            {readTime && <span><Clock3 size={12} aria-hidden="true" />{readTime}</span>}
            {views > 0 && <span><Eye size={12} aria-hidden="true" />{views.toLocaleString("en-US")}</span>}
          </div>

          <h3 className="hpost-title av-post-card__title">{title}</h3>
          {excerpt && <p className="hpost-excerpt av-post-card__excerpt">{excerpt}</p>}

          <span className="hpost-readmore av-post-card__readmore">
            Read article <ArrowUpRight size={15} aria-hidden="true" />
          </span>
        </div>
      </Link>

      {showActions && (
        <div className="av-post-card__actions" aria-label="Post actions">
          <button
            type="button"
            aria-label={liked ? "Unlike story" : "Like story"}
            aria-pressed={liked}
            title={liked ? "Unlike story" : "Like story"}
            onClick={() => setLiked((value) => !value)}
            className={liked ? "is-liked" : ""}
          >
            <Heart size={15} fill={liked ? "currentColor" : "none"} />
          </button>
          <button
            type="button"
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark story"}
            aria-pressed={isBookmarked}
            title={isBookmarked ? "Remove bookmark" : "Bookmark story"}
            onClick={() => onBookmark?.(post.id || post._id)}
            className={isBookmarked ? "is-bookmarked" : ""}
          >
            <Bookmark size={15} fill={isBookmarked ? "currentColor" : "none"} />
          </button>
        </div>
      )}
    </div>
  );
}
