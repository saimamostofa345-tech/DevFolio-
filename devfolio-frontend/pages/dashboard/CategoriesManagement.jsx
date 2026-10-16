import ManagementPage from "./ManagementPage";

export default function CategoriesManagement() {
  return (
    <ManagementPage
      title="Blog Categories"
      endpoint="/categories/"
      fields={[
        { name: "name", label: "Category Name", required: true },
        { name: "description", label: "Description", type: "textarea" },
      ]}
    />
  );
}
