/**
 * mForm Service Client
 *
 * Central configuration for the mForm integration.
 * Add new form IDs here instead of putting them in .env.
 * MFORM_API_URL and MFORM_API_KEY stay in .env since they are
 * environment-specific secrets, but form IDs are product config
 * and belong here.
 */
class MFormClient {
  constructor() {
    this.apiUrl = process.env.MFORM_API_URL;
    this.apiKey = process.env.MFORM_API_KEY;

    // ── Form Templates ─────────────────────────────────────────
    // Add / update form IDs here without touching .env
    this.forms = {
      site_visit_feedback: "6a2e1df682bfd52a4253429e",
      // Add more forms here as needed:
      // employee_onboarding:   "...",
      // lead_qualification:    "...",
    };
  }

  /**
   * Creates an invite for a given form template key.
   * @param {string} formKey   - Key from this.forms (e.g. "site_visit_feedback")
   * @param {{ name, phone, email }} targetUser
   * @returns {Promise<{ success, url, token, invite }>}
   */
  async createInvite(formKey, { name, phone, email }) {
    const formId = this.forms[formKey];
    if (!formId) throw new Error(`[MFormClient] Unknown form key: "${formKey}"`);
    if (!this.apiUrl || !this.apiKey) throw new Error("[MFormClient] MFORM_API_URL or MFORM_API_KEY is not set in .env");

    const res = await fetch(`${this.apiUrl}/api/external/v0/forms/${formId}/invites`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
      },
      body: JSON.stringify({ name, phone, email }),
    });

    const data = await res.json();
    if (!data.success) throw new Error(`[MFormClient] Failed to create invite: ${data.message}`);
    return data;
  }

  /**
   * Fetches the invite status and submission for a given form template key + token.
   * @param {string} formKey
   * @param {string} token
   * @returns {Promise<{ success, invite, submission }>}
   */
  async getSubmission(formKey, token) {
    const formId = this.forms[formKey];
    if (!formId) throw new Error(`[MFormClient] Unknown form key: "${formKey}"`);
    if (!this.apiUrl || !this.apiKey) throw new Error("[MFormClient] MFORM_API_URL or MFORM_API_KEY is not set in .env");

    const res = await fetch(`${this.apiUrl}/api/external/v0/forms/${formId}/invites/${token}`, {
      headers: { "x-api-key": this.apiKey },
    });

    return res.json();
  }
}

const mformClient = new MFormClient();
export default mformClient;
