import { Service } from "@framework";
import fs from "fs";
import path from "path";
import Employee from "../models/Employee"; // Standard import
import EmployeeService from "./EmployeeService";

import { generateMOUPDF } from "./mouService/generator"; // Sibling import
import { uploadToS3 } from "../../lib/s3"; // Standard import
import { NotificationHelper } from "../../lib/notification-helpers";
import { sendMOUApprovalMail } from "../email-service/mou/sendMOUApprovedMail.js";


class MOUOperationsService extends Service {
  constructor() {
    super();
  }



  async approveAndSendMOU(req, res) {
    try {
      const { id } = req.query;
      if (!id)
        return res.status(400).json({ success: false, message: "Missing id" });



      const mou = await Employee.findById(id);
      if (!mou)
        return res
          .status(404)
          .json({ success: false, message: "Employee not found" });

      // Permission check: Only AVP or SystemAdmin
      if (!req.isAVP && !req.isSystemAdmin) {
        return res.status(403).json({ success: false, message: "Only AVPs can approve MOUs" });
      }

      // Downline check: Must be in the AVP's team (entire hierarchy)
      if (!req.isSystemAdmin) {
        const employeeService = new EmployeeService();
        const downlineIds = await employeeService.getDownlineIds(req.employee?._id);
        const isDownline = downlineIds.some(dId => dId.toString() === mou._id.toString());
        if (!isDownline) {
          return res.status(403).json({ success: false, message: "You can only approve MOUs for your team members" });
        }
      }


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
      console.log("MOUOperationsService: resendMOUMail called for ID:", id);
      if (!id)
        return res.status(400).json({ success: false, message: "Missing id" });

      const mou = await Employee.findById(id); // Removed .lean() to allow saving
      if (!mou)
        return res
          .status(404)
          .json({ success: false, message: "Employee not found" });

      let s3Url = mou.mouPdfUrl;

      if (!s3Url) {
        // If PDF is missing, try to regenerate it


        const facilitatorSignatureUrl =
          req.employee &&
          (req.employee.signatureUrl || req.employee.signatureURL)
            ? req.employee.signatureUrl || req.employee.signatureURL
            : "";

        const pdfPath = await generateMOUPDF(
          mou.toObject(),
          facilitatorSignatureUrl
        );

        const buffer = fs.readFileSync(pdfPath);
        const key = `mou/${mou._id}_${Date.now()}.pdf`;
        s3Url = await uploadToS3(buffer, key, "application/pdf");

        mou.mouPdfUrl = s3Url;
        if (mou.mouStatus !== "Approved") {
          mou.mouStatus = "Approved";
        }
        await mou.save();

        try {
          if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
        } catch (e) {}
      }

      try {
        await sendMOUApprovalMail(
          mou.email,
          mou.name,
          mou.employeeProfileId,
          s3Url
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

  async rejectMOU(req, res) {
    try {
      const { id } = req.query;
      if (!id)
        return res.status(400).json({ success: false, message: "Missing id" });

      const mou = await Employee.findById(id);
      if (!mou)
        return res
          .status(404)
          .json({ success: false, message: "Employee not found" });

      // Permission check: Only AVP or SystemAdmin
      if (!req.isAVP && !req.isSystemAdmin) {
        return res.status(403).json({ success: false, message: "Only AVPs can reject MOUs" });
      }

      // Downline check: Must be in the AVP's team (entire hierarchy)
      if (!req.isSystemAdmin) {
        const employeeService = new EmployeeService();
        const downlineIds = await employeeService.getDownlineIds(req.employee?._id);
        const isDownline = downlineIds.some(dId => dId.toString() === mou._id.toString());
        if (!isDownline) {
          return res.status(403).json({ success: false, message: "You can only reject MOUs for your team members" });
        }
      }

      // Update status
      mou.mouStatus = "Rejected";
      await mou.save();

      // Send notification
      try {
        await NotificationHelper.notifyMOUStatusChange(
          mou._id,
          "REJECTED",
          req.employee?._id,
          mou.toObject()
        );
      } catch (e) {
        console.error("MOU rejection notification failed", e);
      }

      return res.json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

}


export default MOUOperationsService;
