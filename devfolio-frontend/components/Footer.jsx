import { Link } from "react-router-dom";

export default function Footer({
    name = "Saima Mostofa Moni",
    email = "your-email@example.com",
    behanceUrl = "https://www.behance.net/saimakhan28",
    linkedinUrl = "",
    githubUrl = "",
}) {
    const year = new Date().getFullYear();

    return (
        <footer className="site-footer" id="contact">
            <div className="footer-content">
                <div className="footer-about">
                    <Link to="/" className="brand">
                        DevFolio<span className="brand-dot">.</span>
                    </Link>
                    <p>
                        Designing useful digital experiences and building for the web.
                    </p>
                </div>

                <div className="footer-contact">
                    <h3>Let's connect</h3>
                    <a href={`mailto:${email}`}>{email}</a>

                    <div className="footer-socials">
                        {behanceUrl && (
                            <a href={behanceUrl} target="_blank" rel="noreferrer">
                                Behance
                            </a>
                        )}
                        {linkedinUrl && (
                            <a href={linkedinUrl} target="_blank" rel="noreferrer">
                                LinkedIn
                            </a>
                        )}
                        {githubUrl && (
                            <a href={githubUrl} target="_blank" rel="noreferrer">
                                GitHub
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© {year} {name}. All rights reserved.</p>
                <Link to="/login">Owner Login</Link>
            </div>
        </footer>
    );
}
