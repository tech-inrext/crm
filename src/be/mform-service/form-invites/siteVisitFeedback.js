import mformClient from "../mformClient.js";

/**
 * Sends a Site Visit Feedback invite via mForm.
 *
 * Creates a one-time invite link for the "site_visit_feedback" form
 * and returns the URL + token to be saved on the FollowUp record.
 *
 * @param {{ name: string, phone: string, email: string }} lead
 * @returns {Promise<{ url: string, token: string }>}
 */
export const createSiteVisitFeedbackInvite = async ({ name, phone, email }) => {
  console.log(`📋 [mForm] Creating site visit feedback invite for ${phone}`);
  const data = await mformClient.createInvite("site_visit_feedback", { name, phone, email });
  console.log(`✅ [mForm] Invite created: ${data.url}`);
  return { url: data.url, token: data.token };
};

/**
 * Fetches the submitted feedback for a site visit invite.
 *
 * @param {string} token - The invite token stored on the FollowUp record
 * @returns {Promise<{ invite, submission }>}
 */
export const getSiteVisitFeedbackSubmission = async (token) => {
  return mformClient.getSubmission("site_visit_feedback", token);
};
