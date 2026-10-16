import { Link } from "react-router-dom";

export default function BlogCard({ post }) {
    if (!post) return null;

    const {
        id,
        slug,
        title = "Untitled Post",
        excerpt = "",
        content = "",
        cover_image,
        published_at,
        category,
    } = post;

    const summary = excerpt || content.slice(0, 150);
    const postPath = slug ? `/blog/${slug}` : `/blog/posts/${id}`;

    const categoryName =
        typeof category === "object" ? category?.name : category;

    return (
        <article className="blog-card">
            {cover_image && (
                <img
                    className="blog-card__image"
                    src={cover_image}
                    alt={`${title} cover`}
                    loading="lazy"
                />
            )}

            <div className="blog-card__body">
                {categoryName && (
                    <span className="blog-card__category">{categoryName}</span>
                )}

                <h3>
                    <Link to={postPath}>{title}</Link>
                </h3>

                {published_at && (
                    <time dateTime={published_at}>
                        {new Date(published_at).toLocaleDateString("en", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        })}
                    </time>
                )}

                <p>{summary}{content && !excerpt && content.length > 150 ? "…" : ""}</p>

                <Link className="blog-card__read-more" to={postPath}>
                    Read article →
                </Link>
            </div>
        </article>
    );
}
