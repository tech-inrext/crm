"use client";

import { useRef, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import axios from "axios";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, CircularProgress, Snackbar,
} from "@/components/ui/Component";
import Alert from "@/components/ui/Component/Alert";
import { BUTTON_LABELS, FIELD_LABELS } from "@/fe/pages/department/constants/departments";
import { useDepartmentDialogData } from "@/fe/pages/department/hooks/useDepartmentDialogData";
import { departmentValidationSchema } from "./validation";
import { SavedAttachmentRow, PendingFileRow } from "./AttachmentRows";
import type { DepartmentDialogProps, DepartmentAttachment } from "@/fe/pages/department/types";

import {
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
} from "@/fe/pages/department/departmentApi";

interface PendingFile {
  id: string;
  file: File;
  customName: string;
}

async function uploadToS3(file: File): Promise<string> {
  const { data } = await axios.post<{ uploadUrl: string; fileUrl: string }>(
    "/api/v0/s3/upload-url",
    { fileName: file.name, fileType: file.type },
    { withCredentials: true },
  );
  await axios.put(data.uploadUrl, file, {
    headers: { "Content-Type": file.type },
    withCredentials: false,
  });
  return data.fileUrl;
}

const DepartmentDialog: React.FC<DepartmentDialogProps> = ({
  open,
  editId,
  initialData,
  onClose,
  onSave,
}) => {
  const { managers } = useDepartmentDialogData(open);
  const createMutation = useCreateDepartmentMutation();
  const updateMutation = useUpdateDepartmentMutation();

  const {
    mutate: handleDepartmentSave,
    loading: saving = false,
  } = editId ? updateMutation : createMutation;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"error" | "success">(
    "error",
  );
  const [renamingUrl, setRenamingUrl] = useState<string | null>(null);

  const notify = (msg: string, type: "error" | "success" = "error") => {
    setSnackbarMsg(msg);
    setSnackbarSeverity(type);
    setSnackbarOpen(true);
  };

  if (!open) return null;

  const pickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setPendingFiles((prev) => [
      ...prev,
      ...files.map((f) => ({
        id: `${f.name}-${Date.now()}-${Math.random()}`,
        file: f,
        customName: f.name.replace(/\.[^.]+$/, ""),
      })),
    ]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        BackdropProps={{
          sx: {
            backdropFilter: "blur(1px)",
            backgroundColor: "rgba(15,23,42,0.4)",
          },
        }}
        PaperProps={{
          sx: { borderRadius: 3, boxShadow: "0 10px 30px rgba(0,0,0,0.12)" },
        }}
      >
        <Formik
          initialValues={initialData}
          validationSchema={departmentValidationSchema}
          enableReinitialize
          onSubmit={async (values, { setSubmitting }) => {
            setSubmitting(true);
            try {
              setUploading(true);
              const newAttachments: DepartmentAttachment[] = await Promise.all(
                pendingFiles.map(async (p) => ({
                  filename: p.customName.trim() || p.file.name,
                  url: await uploadToS3(p.file),
                })),
              );
              setUploading(false);

              const payload = {
                ...values,
                attachments: [
                  ...(values.attachments ?? []),
                  ...newAttachments,
                ],
              };

              if (editId) {
                await handleDepartmentSave({ ...payload, id: editId }, onSave);
              } else {
                await handleDepartmentSave(payload, onSave);
              }

              setPendingFiles([]);
            } catch (e: any) {
              setUploading(false);
              notify(e?.message ?? "Failed to save department");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ dirty, values, submitForm, setTouched, setFieldValue }) => (
            <Form>
              <DialogTitle sx={{ fontWeight: 600, color: "#1f2937", fontSize: 18, px: 3, pt: 2.5, pb: 1.5, borderBottom: "1px solid #eef2f7" }}>
                {editId ? BUTTON_LABELS.EDIT_DEPARTMENT : BUTTON_LABELS.ADD_DEPARTMENT}
              </DialogTitle>

              <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: "72vh", overflowY: "auto", px: 3, py: 2, backgroundColor: "#f8fafc" }}>
                {/* Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{FIELD_LABELS.NAME}</label>
                  <Field name="name" type="text" placeholder="e.g. Engineering" className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  <ErrorMessage name="name" component="p" className="text-xs text-red-500" />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{FIELD_LABELS.DESCRIPTION}</label>
                  <Field as="textarea" name="description" rows={3} placeholder="Brief description..." className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
                  <ErrorMessage name="description" component="p" className="text-xs text-red-500" />
                </div>

                {/* Manager */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{FIELD_LABELS.MANAGER}</label>
                  <Field as="select" name="managerId" className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="">Select Manager (optional)</option>
                    {managers.map((m) => (
                      <option key={m._id} value={m._id}>{m.name}{m.designation ? ` (${m.designation})` : ""}</option>
                    ))}
                  </Field>
                </div>

                {/* Attachments */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{FIELD_LABELS.ATTACHMENTS}</label>
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      Add files
                    </button>
                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={pickFiles} />
                  </div>

                  {values.attachments?.map((att) => (
                    <SavedAttachmentRow
                      key={att.url}
                      att={att}
                      renamingUrl={renamingUrl}
                      onRenameToggle={(url) => setRenamingUrl(renamingUrl === url ? null : url)}
                      onRenameCommit={(url, name) => { setFieldValue("attachments", values.attachments.map((a) => a.url === url ? { ...a, filename: name } : a)); setRenamingUrl(null); }}
                      onRenameCancel={() => setRenamingUrl(null)}
                      onRemove={(url) => setFieldValue("attachments", values.attachments.filter((a) => a.url !== url))}
                    />
                  ))}

                  {pendingFiles.map((p) => (
                    <PendingFileRow
                      key={p.id}
                      {...p}
                      onRename={(id, name) => setPendingFiles((prev) => prev.map((f) => f.id === id ? { ...f, customName: name } : f))}
                      onRemove={(id) => setPendingFiles((prev) => prev.filter((f) => f.id !== id))}
                    />
                  ))}

                  {!values.attachments?.length && !pendingFiles.length && (
                    <p className="text-xs text-slate-400 italic">No attachments yet. Click "Add files" to upload.</p>
                  )}
                </div>
              </DialogContent>

              <DialogActions sx={{ p: 2, px: 3, borderTop: "1px solid #eef2f7", backgroundColor: "#fff" }}>
                <Button onClick={onClose} disabled={saving || uploading} variant="text" sx={{ fontWeight: 500, color: "#475569" }}>
                  {BUTTON_LABELS.CANCEL}
                </Button>
                <Button
                  type="button" variant="contained"
                  disabled={saving || uploading || (editId ? !dirty && pendingFiles.length === 0 : false)}
                  sx={{ fontWeight: 600, bgcolor: "#2563eb", color: "#fff", px: 3, boxShadow: "none", "&:hover": { bgcolor: "#1d4ed8", boxShadow: "none" } }}
                  onClick={() => { setTouched(Object.fromEntries(Object.keys(values).map((k) => [k, true]))); submitForm(); }}
                >
                  {saving || uploading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : editId ? BUTTON_LABELS.SAVE : BUTTON_LABELS.ADD}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} variant="filled">{snackbarMsg}</Alert>
      </Snackbar>
    </>
  );
};

export default DepartmentDialog;