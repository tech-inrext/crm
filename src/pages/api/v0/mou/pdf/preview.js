const fs = require("fs");
const path = require("path");

export default async function handler(req, res) {
  try {
    const { id } = req.query;
    if (!id)
      return res.status(400).json({ success: false, message: "Missing id" });

    // ensure request is authenticated and attach logged-in employee to req.employee
    try {
      const authMod = await import("../../../../../middlewares/loginAuth.js");
      if (authMod && typeof authMod.loginAuth === "function") {
        // loginAuth will populate req.employee or send an error response
        await authMod.loginAuth(req, res, () => {});
        if (res.headersSent) return; // auth middleware already sent a response (error)
      }
    } catch (e) {
      // proceed without logged-in user if middleware import fails
    }

  // import model using project alias so runtime resolution works after build
  const empMod = await import('@/models/Employee');
  const MOU = empMod && empMod.default ? empMod.default : empMod;

  const mou = await MOU.findById(id).lean();
    if (!mou)
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });

    // load the ESM generator implementation directly (avoid wrapper)
    const relServicePath = "../../../../../be/services/mouService/generator.js";
    const mod = await import(relServicePath);
    const m = mod && mod.default ? mod.default : mod;
    if (!m || typeof m.generateMOUPDF !== "function") {
      throw new Error(
        "generateMOUPDF is not exported from mouService/generator.js"
      );
    }

    // pass facilitator signature URL (if available from authenticated user) to generator
    const facilitatorSignatureUrl =
      req.employee && (req.employee.signatureUrl || req.employee.signatureURL)
        ? req.employee.signatureUrl || req.employee.signatureURL
        : "";
    const pdfPath = await m.generateMOUPDF(mou, facilitatorSignatureUrl);
    const stat = fs.statSync(pdfPath);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", stat.size);
    const stream = fs.createReadStream(pdfPath);
    stream.pipe(res).on("finish", () => {
      try {
        if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
      } catch (e) {}
    });
    m;
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
}
