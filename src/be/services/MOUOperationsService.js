import { Service } from "@framework";
import fs from "fs";
import path from "path";
import Employee from "../../models/Employee"; // Standard import
import { generateMOUPDF } from "./mouService/generator"; // Sibling import
import { uploadToS3 } from "../../lib/s3"; // Standard import
import { NotificationHelper } from "../../lib/notification-helpers";
import { sendMOUApprovalMail } from "../../lib/emails/sendMOUApprovedMail";
import { loginAuth } from "../../middlewares/loginAuth"; // Import to use manually if needed

class MOUOperationsService extends Service {
  constructor() {
    super();
  }

  async _tryAuth(req, res) {
    // Attempt to hydrate req.employee using loginAuth, but don't fail if it fails.
    // This is to maintain the "optional facilitator" behavior.
    if (req.employee) return;
    try {
      await new Promise((resolve) => {
        loginAuth(req, res, () => {
          resolve();
        });
      });
    } catch (e) {
      // Ignore auth errors
    }
  }

  async approveAndSendMOU(req, res) {
    try {
      const { id } = req.query;
      if (!id)
        return res.status(400).json({ success: false, message: "Missing id" });

      await this._tryAuth(req, res);

      const mou = await Employee.findById(id);
      if (!mou)
        return res
          .status(404)
          .json({ success: false, message: "Employee not found" });

      // generate PDF
      const facilitatorSignatureUrl =
        req.employee && (req.employee.signatureUrl || req.employee.signatureURL)
          ? req.employee.signatureUrl || req.employee.signatureURL
          : "";

      const pdfPath = await generateMOUPDF(
        mou.toObject(),
        facilitatorSignatureUrl
      );

      // read file buffer
      const buffer = fs.readFileSync(pdfPath);

      // upload to s3
      const key = `mou/${mou._id}_${Date.now()}.pdf`;
      const s3Url = await uploadToS3(buffer, key, "application/pdf");

      // update employee record
      mou.mouPdfUrl = s3Url;
      mou.mouStatus = "Approved";
      await mou.save();

      // Send notification
      try {
        await NotificationHelper.notifyMOUStatusChange(
          mou._id,
          "APPROVED",
          req.employee?._id,
          mou.toObject()
        );
        console.log("✅ MOU approval notification sent");
      } catch (error) {
        console.error("❌ MOU approval notification failed:", error);
      }

      // send email
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

      return res.json({ success: true, data: { s3Url } });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async previewMOU(req, res) {
    try {
      const { id } = req.query;
      if (!id)
        return res.status(400).json({ success: false, message: "Missing id" });

      await this._tryAuth(req, res);

      const mou = await Employee.findById(id).lean();
      if (!mou)
        return res
          .status(404)
          .json({ success: false, message: "Employee not found" });

      const facilitatorSignatureUrl =
        req.employee && (req.employee.signatureUrl || req.employee.signatureURL)
          ? req.employee.signatureUrl || req.employee.signatureURL
          : "";
      
      const pdfPath = await generateMOUPDF(mou, facilitatorSignatureUrl);
      const stat = fs.statSync(pdfPath);
      res.setHeader("Content-Type", "application/pdf");
      
      try {
        const rawName =
          (mou &&
            (mou.name || mou.username || mou.employeeProfileId || mou._id)) ||
          "preview";
        const sanitized =
          String(rawName)
            .replace(/[^ \- ]/g, "")
            .replace(/[^a-zA-Z0-9 _\-\.]/g, "")
            .replace(/\s+/g, "")
            .trim() || "preview";
        const filename = `${sanitized}MOU.pdf`;
        res.setHeader(
          "Content-Disposition",
          `inline; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(
            filename
          )}`
        );
      } catch (e) {
        res.setHeader("Content-Disposition", 'inline; filename="preview.pdf"');
      }
      res.setHeader("Content-Length", stat.size);
      
      const stream = fs.createReadStream(pdfPath);
      stream.pipe(res).on("finish", () => {
        try {
          if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
        } catch (e) {}
      });
      
    } catch (err) {
      console.error(err);
      if (err && err.code === "MISSING_PDFKIT") {
        return res.status(503).json({
          success: false,
          message:
            "Service temporarily unavailable: pdf generation dependency 'pdfkit' is missing in the runtime.",
          detail: err.message,
        });
      }
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async resendMOUMail(req, res) {
    try {
      const { id } = req.query;
      if (!id)
        return res.status(400).json({ success: false, message: "Missing id" });

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
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

export default MOUOperationsService;
