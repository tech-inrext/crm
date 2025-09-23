const fs = require("fs");
const path = require("path");

export default async function handler(req, res) {
  try {
    const { id } = req.query;
    if (!id)
      return res.status(400).json({ success: false, message: "Missing id" });

    // only allow POST
    if (req.method !== "POST") return res.status(405).end();

    // attempt to run auth middleware to populate req.employee (facilitator)
    try {
      const authMod = await import("../../../../../middlewares/loginAuth.js");
      if (authMod && typeof authMod.loginAuth === "function") {
        await authMod.loginAuth(req, res, () => {});
        if (res.headersSent) return; // auth disconnected the request
      }
    } catch (e) {
      // ignore auth errors; proceed without facilitator
    }

    // import model using project alias so runtime resolution works after build
    const empMod = await import('@/models/Employee');
    const Employee = empMod && empMod.default ? empMod.default : empMod;

    const mou = await Employee.findById(id);
    if (!mou)
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });

  // load generator
  const mod = await import("../../../../../be/services/mouService/generator.js");
    const m = mod && mod.default ? mod.default : mod;
    if (!m || typeof m.generateMOUPDF !== "function") {
      throw new Error(
        "generateMOUPDF is not exported from mouService/generator.js"
      );
    }

    // generate PDF to a temp path — pass facilitator signature URL if available
    const facilitatorSignatureUrl =
      req.employee && (req.employee.signatureUrl || req.employee.signatureURL)
        ? req.employee.signatureUrl || req.employee.signatureURL
        : "";
    const pdfPath = await m.generateMOUPDF(
      mou.toObject(),
      facilitatorSignatureUrl
    );

    // read file buffer
    const buffer = fs.readFileSync(pdfPath);

    // upload to s3
    const s3Mod = require("../../../../../lib/s3");
    const uploadToS3 =
      s3Mod && s3Mod.uploadToS3 ? s3Mod.uploadToS3 : s3Mod.default;
    const key = `mou/${mou._id}_${Date.now()}.pdf`;
    const s3Url = await uploadToS3(buffer, key, "application/pdf");

    // update employee record
    // ensure status is set to Approved when mail is sent
    mou.mouPdfUrl = s3Url;
    mou.mouStatus = "Approved";
    await mou.save();

    // send email
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
        s3Url
      );
    } catch (e) {
      console.error("Failed to send approval mail:", e);
    }

    // cleanup temp pdf
    try {
      if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
    } catch (e) {}

    res.json({ success: true, data: { s3Url } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
}
