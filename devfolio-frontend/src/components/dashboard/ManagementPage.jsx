import { useEffect, useState } from "react";
import api, { errorMessage, unwrap } from "../../api/axios";

export default function ManagementPage({
  title,
  endpoint,
  fields = [],
  readOnly = false,
  canCreate = true,
  canEdit = true,
  canDelete = true,
  isComments = false,
  isMessages = false,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [editingItem, setEditingItem] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);

  // Form submission states
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get(endpoint);
      const data = unwrap(response.data);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [endpoint]);

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(""), 3500);
  };

  const handleCreateOpen = () => {
    const initial = {};
    fields.forEach((f) => {
      initial[f.name] = f.type === "checkbox" ? false : "";
    });
    setFormData(initial);
    setFormErrors({});
    setIsCreateOpen(true);
  };

  const handleEditOpen = (item) => {
    setFormData({ ...item });
    setFormErrors({});
    setEditingItem(item);
  };

  const handleFieldChange = (e, fieldName, type) => {
    const value = type === "checkbox" ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, [fieldName]: file }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});

    try {
      const isMultipart = fields.some((f) => f.type === "file");
      let payload = formData;

      if (isMultipart) {
        payload = new FormData();
        Object.entries(formData).forEach(([k, v]) => {
          if (v !== null && v !== undefined) {
            payload.append(k, v);
          }
        });
      }

      if (editingItem) {
        const idKey = editingItem.slug || editingItem.id;
        await api.patch(`${endpoint}${idKey}/`, payload, {
          headers: isMultipart ? { "Content-Type": "multipart/form-data" } : undefined,
        });
        showToast("Record updated successfully!");
        setEditingItem(null);
      } else {
        await api.post(endpoint, payload, {
          headers: isMultipart ? { "Content-Type": "multipart/form-data" } : undefined,
        });
        showToast("Record created successfully!");
        setIsCreateOpen(false);
      }
      loadData();
    } catch (err) {
      const data = err?.response?.data;
      if (data && typeof data === "object") {
        setFormErrors(data);
      } else {
        setFormErrors({ non_field: errorMessage(err) });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmItem) return;
    setSubmitting(true);
    try {
      const idKey = deleteConfirmItem.slug || deleteConfirmItem.id;
      await api.delete(`${endpoint}${idKey}/`);
      showToast("Record deleted successfully.");
      setDeleteConfirmItem(null);
      loadData();
    } catch (err) {
      alert(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleApproval = async (comment) => {
    try {
      await api.patch(`/comments/${comment.id}/`, {
        is_approved: !comment.is_approved,
      });
      showToast(comment.is_approved ? "Comment unapproved." : "Comment approved!");
      loadData();
    } catch (err) {
      alert(errorMessage(err));
    }
  };

  const handleToggleRead = async (msg) => {
    try {
      await api.patch(`/contact/${msg.id}/`, {
        is_read: !msg.is_read,
      });
      showToast(msg.is_read ? "Marked as unread." : "Marked as read.");
      loadData();
    } catch (err) {
      alert(errorMessage(err));
    }
  };

  // Filter items by search
  const filteredItems = items.filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return Object.values(item).some(
      (val) => val && String(val).toLowerCase().includes(term)
    );
  });

  return (
    <div style={{ maxWidth: "1100px" }}>
      {/* Toast Notification */}
      {successToast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 9999,
            backgroundColor: "var(--status-success)",
            color: "#fff",
            padding: "12px 24px",
            borderRadius: "var(--radius-sm)",
            boxShadow: "var(--shadow-lg)",
            fontWeight: 600,
            fontSize: "var(--text-sm)",
          }}
        >
          ✓ {successToast}
        </div>
      )}

      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "var(--text-2xl)", marginBottom: "4px" }}>{title}</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
            Manage and maintain your {title.toLowerCase()} records.
          </p>
        </div>

        {canCreate && !readOnly && (
          <button
            type="button"
            onClick={handleCreateOpen}
            style={{
              padding: "10px 18px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--accent-primary)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "var(--text-sm)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>+</span>
            <span>Add New</span>
          </button>
        )}
      </div>

      {/* Search / Filter Bar */}
      <div
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          padding: "16px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <span style={{ color: "var(--text-muted)" }}>🔍</span>
        <input
          type="text"
          placeholder={`Search ${title.toLowerCase()}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            border: "none",
            backgroundColor: "transparent",
            color: "var(--text-primary)",
            outline: "none",
          }}
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Main Table or Card List */}
      <div
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        {loading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)" }}>
            Loading records...
          </div>
        ) : error ? (
          <div style={{ padding: "48px", textAlign: "center" }}>
            <p style={{ color: "var(--status-danger)", marginBottom: "16px" }}>{error}</p>
            <button
              type="button"
              onClick={loadData}
              style={{
                padding: "8px 16px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--accent-primary)",
                color: "#fff",
                fontSize: "var(--text-sm)",
              }}
            >
              Retry
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)" }}>
            {searchTerm ? `No matching records found for "${searchTerm}".` : "No records found."}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "var(--text-sm)" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-secondary)" }}>
                  <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: 600 }}>Title / Name</th>
                  <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: 600 }}>Details</th>
                  <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: 600 }}>Status / Date</th>
                  <th style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: 600, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const displayTitle = item.title || item.name || item.subject || item.company || `Item #${item.id}`;
                  const displayDetail = item.role || item.category || item.institution || item.summary || item.email || "";
                  const displayDate = item.published_at || item.created_at || item.start_date || "";

                  return (
                    <tr
                      key={item.id || item.slug}
                      style={{
                        borderBottom: "1px solid var(--border-subtle)",
                        transition: "background-color var(--transition-fast)",
                      }}
                    >
                      <td style={{ padding: "14px 16px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {displayTitle}
                        {item.slug && (
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 400 }}>
                            /{item.slug}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "14px 16px", color: "var(--text-secondary)" }}>
                        {displayDetail}
                        {item.proficiency && <span> ({item.proficiency}%)</span>}
                      </td>
                      <td style={{ padding: "14px 16px", color: "var(--text-muted)" }}>
                        {item.status && (
                          <span
                            style={{
                              display: "inline-block",
                              padding: "2px 8px",
                              borderRadius: "var(--radius-full)",
                              fontSize: "11px",
                              fontWeight: 600,
                              backgroundColor: item.status === "PUBLISHED" ? "var(--status-success-bg)" : "var(--bg-secondary)",
                              color: item.status === "PUBLISHED" ? "var(--status-success)" : "var(--text-muted)",
                            }}
                          >
                            {item.status}
                          </span>
                        )}
                        {isComments && (
                          <span
                            style={{
                              display: "inline-block",
                              padding: "2px 8px",
                              borderRadius: "var(--radius-full)",
                              fontSize: "11px",
                              fontWeight: 600,
                              backgroundColor: item.is_approved ? "var(--status-success-bg)" : "var(--status-danger-bg)",
                              color: item.is_approved ? "var(--status-success)" : "var(--status-danger)",
                            }}
                          >
                            {item.is_approved ? "Approved" : "Pending"}
                          </span>
                        )}
                        {isMessages && (
                          <span
                            style={{
                              display: "inline-block",
                              padding: "2px 8px",
                              borderRadius: "var(--radius-full)",
                              fontSize: "11px",
                              fontWeight: 600,
                              backgroundColor: item.is_read ? "var(--bg-secondary)" : "var(--accent-light)",
                              color: item.is_read ? "var(--text-muted)" : "var(--accent-primary)",
                            }}
                          >
                            {item.is_read ? "Read" : "Unread"}
                          </span>
                        )}
                        {displayDate && (
                          <div style={{ fontSize: "11px", marginTop: "4px" }}>
                            {new Date(displayDate).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
                          {isComments && (
                            <button
                              type="button"
                              onClick={() => handleToggleApproval(item)}
                              style={{
                                padding: "4px 8px",
                                borderRadius: "var(--radius-sm)",
                                fontSize: "11px",
                                fontWeight: 600,
                                border: "1px solid var(--border-subtle)",
                                color: item.is_approved ? "var(--status-warning)" : "var(--status-success)",
                              }}
                            >
                              {item.is_approved ? "Unapprove" : "Approve"}
                            </button>
                          )}
                          {isMessages && (
                            <button
                              type="button"
                              onClick={() => handleToggleRead(item)}
                              style={{
                                padding: "4px 8px",
                                borderRadius: "var(--radius-sm)",
                                fontSize: "11px",
                                fontWeight: 600,
                                border: "1px solid var(--border-subtle)",
                              }}
                            >
                              {item.is_read ? "Mark Unread" : "Mark Read"}
                            </button>
                          )}
                          {canEdit && !readOnly && (
                            <button
                              type="button"
                              onClick={() => handleEditOpen(item)}
                              style={{
                                padding: "4px 8px",
                                borderRadius: "var(--radius-sm)",
                                border: "1px solid var(--border-subtle)",
                                fontSize: "12px",
                                color: "var(--text-secondary)",
                              }}
                            >
                              Edit
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmItem(item)}
                              style={{
                                padding: "4px 8px",
                                borderRadius: "var(--radius-sm)",
                                border: "1px solid rgba(239, 68, 68, 0.2)",
                                backgroundColor: "var(--status-danger-bg)",
                                fontSize: "12px",
                                color: "var(--status-danger)",
                              }}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal (F-12) */}
      {(isCreateOpen || editingItem) && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "var(--bg-surface-solid)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "var(--shadow-lg)",
              padding: "28px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "var(--text-lg)" }}>
                {editingItem ? `Edit ${title}` : `Create New ${title}`}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingItem(null);
                }}
                style={{ fontSize: "18px", color: "var(--text-muted)" }}
              >
                ✕
              </button>
            </div>

            {formErrors.non_field && (
              <div style={{ color: "var(--status-danger)", backgroundColor: "var(--status-danger-bg)", padding: "10px", borderRadius: "var(--radius-sm)", marginBottom: "16px", fontSize: "var(--text-sm)" }}>
                {formErrors.non_field}
              </div>
            )}

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {fields.map((field) => {
                const errorMsg = formErrors[field.name];
                return (
                  <div key={field.name}>
                    <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "6px" }}>
                      {field.label} {field.required && <span style={{ color: "var(--status-danger)" }}>*</span>}
                    </label>

                    {field.type === "textarea" ? (
                      <textarea
                        rows={field.rows || 4}
                        value={formData[field.name] ?? ""}
                        onChange={(e) => handleFieldChange(e, field.name, "text")}
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "var(--radius-sm)",
                          border: errorMsg ? "1px solid var(--status-danger)" : "1px solid var(--border-subtle)",
                          backgroundColor: "var(--bg-primary)",
                          color: "var(--text-primary)",
                        }}
                      />
                    ) : field.type === "checkbox" ? (
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={Boolean(formData[field.name])}
                          onChange={(e) => handleFieldChange(e, field.name, "checkbox")}
                        />
                        <span style={{ fontSize: "var(--text-sm)" }}>Enable / Yes</span>
                      </label>
                    ) : field.type === "file" ? (
                      <div>
                        <input
                          type="file"
                          accept={field.accept || "image/*"}
                          onChange={(e) => handleFileChange(e, field.name)}
                          style={{ fontSize: "var(--text-sm)" }}
                        />
                      </div>
                    ) : (
                      <input
                        type={field.type || "text"}
                        value={formData[field.name] ?? ""}
                        onChange={(e) => handleFieldChange(e, field.name, field.type)}
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "var(--radius-sm)",
                          border: errorMsg ? "1px solid var(--status-danger)" : "1px solid var(--border-subtle)",
                          backgroundColor: "var(--bg-primary)",
                          color: "var(--text-primary)",
                        }}
                      />
                    )}

                    {errorMsg && (
                      <span style={{ display: "block", color: "var(--status-danger)", fontSize: "12px", marginTop: "4px" }}>
                        {Array.isArray(errorMsg) ? errorMsg.join(" ") : errorMsg}
                      </span>
                    )}
                  </div>
                );
              })}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingItem(null);
                  }}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-subtle)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "var(--accent-primary)",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "var(--text-sm)",
                  }}
                >
                  {submitting ? "Saving..." : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (F-12: not window.confirm) */}
      {deleteConfirmItem && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "var(--bg-surface-solid)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              maxWidth: "440px",
              width: "100%",
              padding: "24px",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "8px", color: "var(--status-danger)" }}>
              Confirm Deletion
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", marginBottom: "24px" }}>
              Are you sure you want to delete this record? This action cannot be undone.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: "var(--text-sm)",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                style={{
                  padding: "8px 16px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--status-danger)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "var(--text-sm)",
                }}
              >
                {submitting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
