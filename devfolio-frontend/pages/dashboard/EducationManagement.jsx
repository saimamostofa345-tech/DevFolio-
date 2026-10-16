import ManagementPage from "./ManagementPage";

export default function EducationManagement() {
  return (
    <ManagementPage
      title="Education & Credentials"
      endpoint="/education/"
      fields={[
        { name: "institution", label: "University / Institute Name", required: true },
        { name: "degree", label: "Degree / Certification", required: true },
        { name: "field_of_study", label: "Field of Study / Major" },
        { name: "start_year", label: "Start Year (e.g. 2020)", type: "number", required: true },
        { name: "end_year", label: "End Year (e.g. 2024)", type: "number" },
        { name: "grade", label: "CGPA / Grade" },
        { name: "description", label: "Highlights / Activities", type: "textarea" },
      ]}
    />
  );
}
