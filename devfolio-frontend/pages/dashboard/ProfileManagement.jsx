import { useEffect, useState } from "react";
import api, { errorMessage } from "../../api/axios";

const initialProfile = {
  full_name: "",
  headline: "",
  bio: "",
  email: "",
  phone: "",
  location: "",
  github_url: "",
  linkedin_url: "",
  x_url: "",
  website_url: "",
  years_of_experience: 2,
  is_available_for_hire: true,
};

export default function ProfileManagement() {
  const [profile, setProfile] = useState(initialProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    api
      .get("/profile/")
      .then((response) => {
        if (response.data) {
          setProfile(response.data);
        }
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setProfile((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      Object.entries(profile).forEach(([key, val]) => {
        if (key !== "avatar" && key !== "resume" && val !== null && val !== undefined) {
          formData.append(key, val);
        }
      });

      if (avatarFile) formData.append("avatar", avatarFile);
      if (resumeFile) formData.append("resume", resumeFile);

      const response = await api.patch("/profile/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProfile(response.data);
      setMessage("Profile updated successfully!");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div style={{ padding: "48px 0", color: "var(--text-muted)" }}>Loading profile...</div>;
  }

  return (
    <div style={{ maxWidth: "800px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "var(--text-2xl)", marginBottom: "8px" }}>Profile Management</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
          Update your public portfolio biography, headline, contact details, and resume.
        </p>
      </div>

      {error && (
        <div style={{ color: "var(--status-danger)", backgroundColor: "var(--status-danger-bg)", padding: "12px", borderRadius: "var(--radius-sm)", marginBottom: "16px" }}>
          {error}
        </div>
      )}
      {message && (
        <div style={{ color: "var(--status-success)", backgroundColor: "var(--status-success-bg)", padding: "12px", borderRadius: "var(--radius-sm)", marginBottom: "16px" }}>
          {message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "6px" }}>
              Full Name
            </label>
            <input
              name="full_name"
              value={profile.full_name || ""}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "6px" }}>
              Headline / Role
            </label>
            <input
              name="headline"
              value={profile.headline || ""}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "6px" }}>
            Biography
          </label>
          <textarea
            name="bio"
            rows={5}
            value={profile.bio || ""}
            onChange={handleChange}
            style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "6px" }}>
              Contact Email
            </label>
            <input
              name="email"
              type="email"
              value={profile.email || ""}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "6px" }}>
              Location
            </label>
            <input
              name="location"
              value={profile.location || ""}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "6px" }}>
              Behance Portfolio URL
            </label>
            <input
              name="website_url"
              value={profile.website_url || ""}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "6px" }}>
              GitHub Profile URL
            </label>
            <input
              name="github_url"
              value={profile.github_url || ""}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "6px" }}>
              Avatar Image (Max 2MB, .jpg, .png, .webp)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files?.[0])}
              style={{ fontSize: "var(--text-sm)" }}
            />
            {profile.avatar && (
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                Current: <a href={profile.avatar} target="_blank" rel="noreferrer">View Avatar</a>
              </div>
            )}
          </div>
          <div>
            <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "6px" }}>
              Resume PDF (Max 5MB)
            </label>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => setResumeFile(e.target.files?.[0])}
              style={{ fontSize: "var(--text-sm)" }}
            />
            {profile.resume && (
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                Current: <a href={profile.resume} target="_blank" rel="noreferrer">View Resume</a>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "var(--text-sm)" }}>
            <input
              name="is_available_for_hire"
              type="checkbox"
              checked={Boolean(profile.is_available_for_hire)}
              onChange={handleChange}
            />
            <span>Available for Full-Time & Contract Hire</span>
          </label>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "10px 24px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--accent-primary)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "var(--text-sm)",
            }}
          >
            {saving ? "Saving Changes..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
