import ManagementPage from "./ManagementPage";

export default function SkillsManagement() {
  return (
    <ManagementPage
      title="Skills"
      endpoint="/skills/"
      fields={[
        { name: "name", label: "Skill Name", required: true },
        { name: "category", label: "Category (FRONTEND / BACKEND / DATABASE / DEVOPS / TOOLS / SOFT_SKILL)", required: true },
        { name: "proficiency", label: "Proficiency Percentage (1-100)", type: "number", required: true },
        { name: "icon", label: "Icon Name or Emoji" },
        { name: "display_order", label: "Display Order (e.g. 1, 2, 3)", type: "number" },
        { name: "is_featured", label: "Featured Skill", type: "checkbox" },
      ]}
    />
  );
}
