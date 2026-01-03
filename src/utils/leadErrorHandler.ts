export function extractErrorMessage(err: any): string {
  if (!err) return "Failed to save lead";

  const status = err?.response?.status || err?.status || err?.statusCode;

  // axios response body
  const resp = err.response?.data ?? err.data ?? null;
  if (typeof resp === "string") return resp;
  if (resp) {
    if (resp.message) return resp.message;
    if (resp.msg) return resp.msg;
    if (resp.error) return resp.error;
    if (resp.data && typeof resp.data === "string") return resp.data;
    if (resp.data && resp.data.message) return resp.data.message;
    if (Array.isArray(resp.errors) && resp.errors.length) {
      return resp.errors[0].message || JSON.stringify(resp.errors[0]);
    }
  }

  // Handle 409 status
  if (status === 409) {
    return "Lead with same identifier exists";
  }

  // fallback to error.message or JSON
  if (err.message) return err.message;
  try {
    return JSON.stringify(err);
  } catch (_) {
    return "Failed to save lead";
  }
}
