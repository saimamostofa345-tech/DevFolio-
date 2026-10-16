import ManagementPage from "./ManagementPage";

export default function ProjectsManagement() {
  return (
    <ManagementPage
      title="Projects"
      endpoint="/projects/"
      fields={[
        { name: "title", label: "Project Title", required: true },
        { name: "summary", label: "Summary (Max 200 chars)", required: true },
        { name: "description", label: "Full Description", type: "textarea", required: true },
        { name: "category", label: "Category (WEB / MOBILE / API / ML / OTHER)", required: true },
        { name: "live_url", label: "Live Project / Demo URL" },
        { name: "github_url", label: "GitHub Repository URL" },
        { name: "is_featured", label: "Featured on Homepage", type: "checkbox" },
        { name: "cover_image", label: "Cover Image File", type: "file", accept: "image/*" },
      ]}
    />
  );
}
