export default async function handler(req, res) {
  try {
    const { id } = req.query;
    if (!id)
      return res.status(400).json({ success: false, message: "Missing id" });

    if (req.method !== "POST") return res.status(405).end();

    const Employee_raw = require("../../../../../models/Employee");
    const Employee =
      Employee_raw && Employee_raw.default
        ? Employee_raw.default
        : Employee_raw;

    const mou = await Employee.findById(id).lean();
    if (!mou)
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });

    if (!mou.mouPdfUrl)
      return res
        .status(400)
        .json({ success: false, message: "MOU PDF not available" });

    const mailerMod = require("../../../../../lib/emails/sendMOUApprovedMail.js");
    const sendMOUApprovalMail =
      mailerMod && mailerMod.sendMOUApprovalMail
        ? mailerMod.sendMOUApprovalMail
        : mailerMod.default;

    try {
      await sendMOUApprovalMail(
        mou.email,
        mou.name,
        mou.employeeProfileId,
        mou.mouPdfUrl
      );
      return res.json({ success: true });
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
