import ManagementPage from "./ManagementPage";

export default function TagsManagement() {
    return (
        <ManagementPage
            title="Blog Tags"
            endpoint="/blog/tags/"
            fields={[
                { name: "name", label: "Tag name", required: true },
                { name: "slug", label: "URL slug", required: true },
            ]}
        />
    );
}
