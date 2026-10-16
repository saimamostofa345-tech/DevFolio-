import { Link } from "react-router-dom";

export default function ProjectCard({ project }) {
    if (!project) return null;

    const {
        id,
        slug,
        title = "Untitled Project",
        description = "",
        image,
        live_url,
        figma_url,
        github_url,
        technologies = [],
        featured = false,
    } = project;

    const techList = Array.isArray(technologies)
        ? technologies
        : typeof technologies === "string"
            ? technologies.split(",").map((item) => item.trim()).filter(Boolean)
            : [];

    return (
        <article className="project-card">
            {image ? (
                <img
                    className="project-card__image"
                    src={image}
                    alt={`${title} preview`}
                    loading="lazy"
                />
            ) : (
                <div className="project-card__placeholder" aria-hidden="true">
                    Project Preview
                </div>
            )}

            <div className="project-card__body">
                {featured && <span className="project-card__badge">Featured</span>}

                <h3>{title}</h3>
                <p>{description}</p>

                {techList.length > 0 && (
                    <ul className="project-card__technologies" aria-label="Technologies">
                        {techList.map((tech, index) => (
                            <li key={`${tech}-${index}`}>{tech}</li>
                        ))}
                    </ul>
                )}

                <div className="project-card__links">
                    {slug && (
                        <Link to={`/projects/${slug}`}>View details</Link>
                    )}
                    {!slug && id != null && (
                        <Link to={`/projects/${id}`}>View details</Link>
                    )}
                    {figma_url && (
                        <a href={figma_url} target="_blank" rel="noreferrer">
                            Figma
                        </a>
                    )}
                    {live_url && (
                        <a href={live_url} target="_blank" rel="noreferrer">
                            Live Project
                        </a>
                    )}
                    {github_url && (
                        <a href={github_url} target="_blank" rel="noreferrer">
                            GitHub
                        </a>
                    )}
                </div>
            </div>
        </article>
    );
}
