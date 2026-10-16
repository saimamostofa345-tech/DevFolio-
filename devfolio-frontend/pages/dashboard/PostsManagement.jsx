import ManagementPage from "./ManagementPage";

export default function PostsManagement() {
  return (
    <ManagementPage
      title="Blog Posts"
      endpoint="/posts/"
      fields={[
        { name: "title", label: "Post Title (Min 5 chars)", required: true },
        { name: "excerpt", label: "Excerpt / Summary (Max 300 chars)", type: "textarea" },
        { name: "content", label: "Post Body (Markdown, Min 100 chars to publish)", type: "textarea", rows: 8, required: true },
        { name: "category", label: "Category ID (Required to publish)", type: "number" },
        { name: "status", label: "Status (DRAFT or PUBLISHED)", required: true },
        { name: "is_featured", label: "Featured Article", type: "checkbox" },
        { name: "cover_image", label: "Cover Image File", type: "file", accept: "image/*" },
      ]}
    />
  );
}
