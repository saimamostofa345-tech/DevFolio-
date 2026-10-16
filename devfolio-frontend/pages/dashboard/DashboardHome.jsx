import { useEffect, useState } from "react";
import api, { errorMessage } from "../../api/axios";

export default function DashboardHome() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await api.get("/dashboard/stats/");
        setStats(response.data);
      } catch (err) {
        setError(errorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-muted)" }}>
        Loading dashboard statistics...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "24px", backgroundColor: "var(--status-danger-bg)", color: "var(--status-danger)", borderRadius: "var(--radius-sm)" }}>
        {error}
      </div>
    );
  }

  const statCards = [
    { label: "Published Posts", value: stats?.published_posts ?? 0, icon: "📝", color: "var(--accent-primary)" },
    { label: "Draft Posts", value: stats?.draft_posts ?? 0, icon: "📝", color: "var(--text-muted)" },
    { label: "Total Projects", value: stats?.total_projects ?? 0, icon: "📁", color: "#10B981" },
    { label: "Skills Registered", value: stats?.total_skills ?? 0, icon: "⚡", color: "#F59E0B" },
    { label: "Total Views", value: stats?.total_views ?? 0, icon: "👁️", color: "#3B82F6" },
    { label: "Total Likes", value: stats?.total_likes ?? 0, icon: "❤️", color: "#EC4899" },
    { label: "Pending Comments", value: stats?.pending_comments ?? 0, icon: "💬", color: "#EF4444" },
    { label: "Unread Messages", value: stats?.unread_messages ?? 0, icon: "📬", color: "#8B5CF6" },
  ];

  return (
    <div style={{ maxWidth: "1140px" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "var(--text-2xl)", marginBottom: "8px" }}>Owner Overview</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
          Aggregated portfolio and blog performance metrics computed directly via server ORM.
        </p>
      </div>

      {/* Grid of Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginBottom: "36px",
        }}
      >
        {statCards.map((card) => (
          <div
            key={card.label}
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "20px",
              boxShadow: "var(--shadow-sm)",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--bg-secondary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
              }}
            >
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: "var(--text-2xl)", fontWeight: 700, color: card.color }}>
                {card.value}
              </div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontWeight: 500 }}>
                {card.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two-Column Analytics: Top Posts & Recent Comments */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "24px",
        }}
      >
        {/* Top 5 Posts by Views */}
        <div
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "24px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "16px" }}>Top Posts by Views</h3>
          {stats?.top_posts?.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No published posts yet.</p>
          ) : (
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
              {stats?.top_posts?.map((post) => (
                <li
                  key={post.slug}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    backgroundColor: "var(--bg-secondary)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{post.title}</span>
                  <div style={{ display: "flex", gap: "12px", color: "var(--text-muted)", fontSize: "12px" }}>
                    <span>👁️ {post.views}</span>
                    <span>❤️ {post.likes}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Comments / Inquiries */}
        <div
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "24px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "16px" }}>Recent Comments</h3>
          {stats?.recent_comments?.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No comments received yet.</p>
          ) : (
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
              {stats?.recent_comments?.map((c) => (
                <li
                  key={c.id}
                  style={{
                    padding: "10px 12px",
                    backgroundColor: "var(--bg-secondary)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <strong style={{ color: "var(--text-primary)" }}>{c.name}</strong>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: c.is_approved ? "var(--status-success)" : "var(--status-danger)",
                      }}
                    >
                      {c.is_approved ? "Approved" : "Pending"}
                    </span>
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: "12px" }}>{c.content}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
