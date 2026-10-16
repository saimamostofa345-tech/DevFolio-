import ManagementPage from "./ManagementPage";

export default function ExperienceManagement() {
  return (
    <ManagementPage
      title="Work Experience"
      endpoint="/experiences/"
      fields={[
        { name: "company", label: "Company / Organization", required: true },
        { name: "role", label: "Job Title / Role", required: true },
        { name: "employment_type", label: "Employment Type (FULL_TIME, PART_TIME, CONTRACT, FREELANCE)", required: true },
        { name: "location", label: "Location" },
        { name: "start_date", label: "Start Date (YYYY-MM-DD)", type: "date", required: true },
        { name: "end_date", label: "End Date (Leave blank if currently employed)", type: "date" },
        { name: "is_current", label: "Currently Working Here", type: "checkbox" },
        { name: "description", label: "Key Responsibilities & Achievements", type: "textarea", required: true },
      ]}
    />
  );
}
