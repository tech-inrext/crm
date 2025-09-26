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
    const empMod = await import("@/models/Employee");
    const Employee = empMod && empMod.default ? empMod.default : empMod;

    const mou = await Employee.findById(id);
    if (!mou)
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });

    // load generator
    const mod = await import(
      "../../../../../be/services/mouService/generator.js"
    );
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

    // upload to s3 — use dynamic import with project alias so Vercel's build resolver finds the module
    let uploadToS3 = null;
    try {
      const s3Mod = await import("@/lib/s3");
      uploadToS3 =
        s3Mod && (s3Mod.uploadToS3 || s3Mod.default || s3Mod.uploadToS3);
    } catch (e) {
      // fallback to relative require for environments that still need it
      try {
        // eslint-disable-next-line global-require
        const s3Mod2 = require("../../../../../lib/s3");
        uploadToS3 = s3Mod2 && (s3Mod2.uploadToS3 || s3Mod2.default || s3Mod2);
      } catch (e2) {
        console.error(
          "Failed to load s3 module via both alias import and relative require",
          e,
          e2
        );
        throw e2 || e;
      }
    }
    const key = `mou/${mou._id}_${Date.now()}.pdf`;
    if (!uploadToS3 || typeof uploadToS3 !== "function") {
      console.error("uploadToS3 is not available");
      return res
        .status(500)
        .json({
          success: false,
          message: "S3 upload function not available on server",
        });
    }
    const s3Url = await uploadToS3(buffer, key, "application/pdf");

    // update employee record
    // ensure status is set to Approved when mail is sent
    mou.mouPdfUrl = s3Url;
    mou.mouStatus = "Approved";
    await mou.save();

    // send email — dynamic import via alias for serverless compatibility
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
      if (sendMOUApprovalMail)
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
