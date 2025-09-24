export default async function handler(req, res) {
  try {
    const { id } = req.query;
    if (!id)
      return res.status(400).json({ success: false, message: "Missing id" });

    if (req.method !== "POST") return res.status(405).end();

    const empMod = await import("@/models/Employee");
    const Employee = empMod && empMod.default ? empMod.default : empMod;

    const mou = await Employee.findById(id).lean();
    if (!mou)
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });

    if (!mou.mouPdfUrl)
      return res
        .status(400)
        .json({ success: false, message: "MOU PDF not available" });

    try {
      let sendMOUApprovalMail = null;
      try {
        const mailer = await import("@/lib/emails/sendMOUApprovedMail.js");
        sendMOUApprovalMail =
          mailer &&
          (mailer.sendMOUApprovalMail ||
            mailer.default ||
            mailer.sendMOUApprovalMail);
      } catch (e) {
        const mailer2 = require("../../../../../lib/emails/sendMOUApprovedMail.js");
        sendMOUApprovalMail =
          mailer2 &&
          (mailer2.sendMOUApprovalMail || mailer2.default || mailer2);
      }

      if (sendMOUApprovalMail) {
        await sendMOUApprovalMail(
          mou.email,
          mou.name,
          mou.employeeProfileId,
          mou.mouPdfUrl
        );
        return res.json({ success: true });
      }
      return res
        .status(500)
        .json({ success: false, message: "Mailer not available" });
    } catch (e) {
      console.error("resend mail failed", e);
      return res
        .status(500)
        .json({ success: false, message: "Failed to send mail" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
}
