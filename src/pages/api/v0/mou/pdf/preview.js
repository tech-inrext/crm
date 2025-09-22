const fs = require("fs");
const path = require("path");

export default async function handler(req, res) {
  try {
    const { id } = req.query;
    if (!id)
      return res.status(400).json({ success: false, message: "Missing id" });

    // require model here to avoid top-level resolution issues
    const MOU_raw = require("../../../../../models/Employee");
    const MOU = MOU_raw && MOU_raw.default ? MOU_raw.default : MOU_raw;

    const mou = await MOU.findById(id).lean();
    if (!mou)
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });

    // load the ESM implementation using dynamic import
    const relServicePath = "../../../../../be/services/mouEmailService.js";
    const mod = await import(relServicePath);
    const m = mod && mod.default ? mod.default : mod;
    if (!m || typeof m.generateMOUPDF !== "function") {
      throw new Error("generateMOUPDF is not exported from mouEmailService.js");
    }

    const pdfPath = await m.generateMOUPDF(mou);
    const stat = fs.statSync(pdfPath);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", stat.size);
    const stream = fs.createReadStream(pdfPath);
    stream.pipe(res).on("finish", () => {
      try {
        if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
      } catch (e) {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
}
