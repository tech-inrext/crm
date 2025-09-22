export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ success: false, message: "Only POST" });
  try {
    const { id } = req.body;
    if (!id)
      return res.status(400).json({ success: false, message: "Missing id" });

    // load ESM implementation via dynamic import
    const relServicePath = "../../../../../be/services/mouEmailService.js";
    const mod = await import(relServicePath);
    const m = mod && mod.default ? mod.default : mod;
    if (!m || typeof m.sendApprovalConfirmationEmail !== "function") {
      throw new Error(
        "sendApprovalConfirmationEmail is not exported from mouEmailService.js"
      );
    }

    await m.sendApprovalConfirmationEmail(id);
    res.status(200).json({ success: true, message: "Email sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
}
