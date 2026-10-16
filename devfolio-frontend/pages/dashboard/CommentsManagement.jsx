import ManagementPage from "./ManagementPage";

export default function CommentsManagement() {
    return (
        <ManagementPage
            title="Comments Management"
            endpoint="/blog/comments/"
            fields={[]}
            readOnly
            canCreate={false}
            canEdit={false}
            canDelete
        />
    );
}
