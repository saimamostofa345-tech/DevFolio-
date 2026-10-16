import ManagementPage from "./ManagementPage";

export default function MessagesManagement() {
    return (
        <ManagementPage
            title="Contact Messages"
            endpoint="/contact/"
            fields={[]}
            readOnly
            canCreate={false}
            canEdit={false}
            canDelete
        />
    );
}
