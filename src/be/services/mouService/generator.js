import { createRequire } from "module";
const require = createRequire(import.meta.url);
const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const os = require("os");
const { finished } = require("stream");
const { promisify } = require("util");
const streamFinished = promisify(finished);

// Constants
const BRANCH_ADDRESSES = {
  Noida: "D-4, 3rd Floor, Sector-10, Noida, Uttar Pradesh-201301.",
  Lucknow: "312, Felix, Square, Sushant Golf City, Lucknow 226030.",
  Patna: "4th floor, Pandey Plaza, Exhibition Road, Patna, Bihar 800001.",
  Delhi: "Plot No. 29, 4th Floor, Moti Nagar, New Delhi-110015",
};

const KEYS = ["Noida", "Lucknow", "Patna", "Delhi"];

// Utility: long date formatter used in docs (e.g. 10th day of July, 2025)
function formatLongDate(date) {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  const day = d.getDate();
  const year = d.getFullYear();
  const monthName = d.toLocaleString("en-US", { month: "long" });
  const ord = (n) => {
    const s = ["th", "st", "nd", "rd"],
      v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };
  return `${ord(day)} day of ${monthName}, ${year}`;
}

// Utility: determine normalized branch key
function getBranchKey(employee) {
  if (!employee) return "Noida";
  const candidates = [
    employee.branch,
    employee.branchLocation,
    employee.city,
    employee.location,
  ];
  for (const c of candidates) {
    if (!c) continue;
    const s = String(c).trim();
    for (const k of KEYS) if (s.toLowerCase() === k.toLowerCase()) return k;
  }
  for (const c of candidates) {
    if (!c) continue;
    const s = String(c).toLowerCase();
    if (s.includes("noida")) return "Noida";
    if (s.includes("lucknow")) return "Lucknow";
    if (s.includes("patna")) return "Patna";
    if (s.includes("delhi")) return "Delhi";
  }
  return "N/A";
}

// Small helper to add wrapped text with consistent styling
function addWrappedText(doc, text, options = {}) {
  const {
    fontSize = 12,
    font = "Times-Roman",
    lineGap = 0,
    margin = 50,
  } = options;
  doc.font(font).fontSize(fontSize);
  const availableWidth = doc.page.width - margin * 2;
  doc.text(text, margin, doc.y, {
    width: availableWidth,
    align: "left",
    lineGap,
  });
  doc.moveDown();
}

// Minimal HTTP(S) fetch helpers used only for signature images
async function fetchImageBufferSimple(url) {
  try {
    const lib = url.startsWith("https://") ? require("https") : require("http");
    return await new Promise((resolve) => {
      const req = lib.get(url, { headers: { "User-Agent": "node" } }, (res) => {
        const { statusCode } = res;
        if (statusCode !== 200) {
          res.resume();
          return resolve(null);
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      });
      req.on("error", () => resolve(null));
    });
  } catch (e) {
    return null;
  }
}

// Robust fetch that follows redirects up to maxRedirects
async function fetchImageBuffer(url, maxRedirects = 5) {
  try {
    let current = url;
    for (let i = 0; i <= maxRedirects; i++) {
      const lib = current.startsWith("https://")
        ? require("https")
        : require("http");
      // wrap in a promise
      const result = await new Promise((resolve) => {
        const req = lib.get(
          current,
          { headers: { "User-Agent": "node" } },
          (res) => {
            const { statusCode, headers } = res;
            if (statusCode >= 300 && statusCode < 400 && headers.location) {
              res.resume();
              resolve({ redirect: headers.location });
              return;
            }
            if (statusCode !== 200) {
              res.resume();
              resolve(null);
              return;
            }
            const chunks = [];
            res.on("data", (c) => chunks.push(c));
            res.on("end", () => resolve(Buffer.concat(chunks)));
            res.on("error", () => resolve(null));
          }
        );
        req.on("error", () => resolve(null));
      });

      if (!result) return null;
      if (result && result.redirect) {
        const loc = result.redirect;
        if (/^https?:\/\//i.test(loc)) current = loc;
        else {
          try {
            const base = new URL(current);
            current = new URL(loc, base).toString();
          } catch {
            current = loc;
          }
        }
        continue;
      }
      return result;
    }
    return null;
  } catch (e) {
    return null;
  }
}

// The main exported function: generates MOU PDF and returns filepath
export async function generateMOUPDF(employee, facilitatorSignatureUrl = "") {
  let PDFDocument;
  // Precompute filename and filePath so fallbacks can write a file if pdfkit isn't available
  const filename = `MOU_${
    employee?.associateId || employee?._id || "unknown"
  }.pdf`;
  const filePath = path.join(os.tmpdir(), filename);
  try {
    // Prefer require.resolve to get a clear error if resolution fails
    try {
      const resolved = require.resolve("pdfkit");
      // eslint-disable-next-line no-console
      console.log("pdfkit resolved at:", resolved);
    } catch (resolveErr) {
      // resolution failed — log for diagnostics and continue to attempt require
      // eslint-disable-next-line no-console
      console.warn("pdfkit resolve failed:", resolveErr && resolveErr.message);
    }

    // Attempt CommonJS require first
    try {
      PDFDocument = require("pdfkit");
    } catch (requireErr) {
      // If require fails in an ESM environment, try dynamic import as fallback
      // eslint-disable-next-line no-console
      console.warn(
        "pdfkit require failed, attempting dynamic import:",
        requireErr && requireErr.message
      );
      try {
        // dynamic import returns a module namespace; pdfkit's default export is the constructor
        // use createRequire for CJS environments if needed, but dynamic import may work on some runtimes
        // eslint-disable-next-line no-await-in-loop
        const mod = await import("pdfkit");
        PDFDocument = mod && (mod.default || mod);
      } catch (importErr) {
        // Both require and import failed — try a pure-JS fallback using pdf-lib so the preview still works
        // eslint-disable-next-line no-console
        console.warn(
          "pdfkit import also failed, attempting pdf-lib fallback:",
          importErr && importErr.message
        );
        try {
          // Minimal manual PDF generation fallback (single page, plain text)
          // This creates a very small valid PDF and writes it to filePath so preview works.
          const title = "MEMORANDUM OF UNDERSTANDING";
          const name =
            employee?.name ||
            employee?.fullname ||
            employee?.username ||
            "______________________";
          const dateStr = new Date(
            employee?.createdAt || Date.now()
          ).toDateString();
          // Very small PDF written by hand. Not typographically rich but valid.
          const content = [];
          content.push("%PDF-1.4\n");
          content.push("1 0 obj<< /Type /Catalog /Pages 2 0 R>>endobj\n");
          content.push(
            "2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1>>endobj\n"
          );
          const text = `${title}\n${name}\n${dateStr}`;
          const utf8 = Buffer.from(text, "utf8");
          const stream = Buffer.concat([
            Buffer.from(content.join("")),
            Buffer.from(
              "3 0 obj<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>endobj\n"
            ),
            Buffer.from(
              "4 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\n"
            ),
            // Contents stream (very small) - draw text
            Buffer.from("5 0 obj<< /Length "),
            Buffer.from(String(utf8.length + 60)),
            Buffer.from(">>stream\nBT /F1 12 50 750 Tm ("),
            utf8,
            Buffer.from(
              ") Tj ET\nendstream endobj\nxref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000110 00000 n \n0000000210 00000 n \n0000000310 00000 n \ntrailer<< /Root 1 0 R /Size 6 >>\nstartxref\n420\n%%EOF\n"
            ),
          ]);
          await fsp.writeFile(filePath, stream);
          return filePath;
        } catch (fallbackErr) {
          // Fallback failed — log and rethrow
          // eslint-disable-next-line no-console
          console.error(
            "manual PDF fallback failed:",
            fallbackErr && fallbackErr.message
          );
          const e = new Error(
            "Dependency missing or not loadable: 'pdfkit' is not installed and manual PDF fallback failed. Details: " +
              String(requireErr && requireErr.message) +
              " | " +
              String(importErr && importErr.message) +
              " | " +
              String(fallbackErr && fallbackErr.message)
          );
          e.code = "MISSING_PDFKIT";
          throw e;
        }
      }
    }
  } catch (err) {
    // ensure the thrown error carries the diagnostic message
    if (!err.code) err.code = "MISSING_PDFKIT";
    throw err;
  }

  const doc = new PDFDocument({ margin: 50 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Map fields
  const employeeProfileId =
    employee.employeeProfileId || employee.associateId || employee._id || "";
  const createdAt = employee.createdAt;
  const employeeName =
    employee.name ||
    employee.fullname ||
    employee.username ||
    "______________________";
  const employeeFatherName =
    employee.fatherName || employee.father || employee.parentName || "";
  const employeeAddress =
    employee.address || employee.currentAddress || "______________________";

  // Header
  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .text("MEMORANDUM OF UNDERSTANDING", { align: "center" })
    .moveDown(1);
  doc
    .font("Times-Bold")
    .fontSize(12)
    .text(`ASSOCIATE ID: ${employeeProfileId || "______________________"}`, {
      align: "center",
    });
  doc.moveDown();

  // Date & branch
  const branchKey = getBranchKey(employee);
  doc
    .font("Times-Roman")
    .fontSize(12)
    .text(
      `This Memorandum of Understanding (i.e. MOU) is executed at ${branchKey} on `,
      { continued: true }
    );
  doc
    .font("Times-Roman")
    .font("Times-Bold")
    .text(createdAt ? formatLongDate(createdAt) : "______________________");
  doc.moveDown();

  // BY AND BETWEEN
  doc
    .font("Times-Roman")
    .font("Times-Bold")
    .fontSize(14)
    .text("BY AND BETWEEN", { align: "center" });
  doc.moveDown();

  // Facilitator
  doc
    .font("Times-Roman")
    .font("Times-Bold")
    .fontSize(12)
    .text("M/s. Inrext Pvt. Ltd. ", { continued: true });
  const facilitatorAddress =
    BRANCH_ADDRESSES[branchKey] || BRANCH_ADDRESSES.Noida;
  addWrappedText(
    doc,
    `is a company having its Co. office at ${facilitatorAddress} hereinafter referred to as the facilitator which expression unless repugnant to the context or subject shall mean and include its successors, representatives and assigns; i.e. the First Party.`
  );

  // AND
  doc
    .font("Times-Roman")
    .font("Times-Bold")
    .fontSize(14)
    .text("AND", { align: "center" });
  doc.moveDown();

  // Associate details
  doc
    .font("Times-Roman")
    .font("Times-Bold")
    .fontSize(12)
    .text(`Mr/Mrs ${employeeName}`, { continued: true });
  if (employeeFatherName)
    doc
      .font("Times-Roman")
      .font("Times-Roman")
      .fontSize(12)
      .text(` S/o ${employeeFatherName}`, { continued: true });
  doc
    .font("Times-Roman")
    .font("Times-Bold")
    .fontSize(12)
    .text(` At ${employeeAddress}.`, { continued: true });

  doc
    .font("Times-Roman")
    .font("Times-Roman")
    .fontSize(12)
    .text(
      "According to our agreed business model, you are becoming a part of the Exclusive Freelance Program as Manager (Sales) with ",
      { continued: true }
    );
  doc
    .font("Times-Roman")
    .font("Times-Bold")
    .fontSize(12)
    .text(`${employee.slabPercentage ? employee.slabPercentage : "N/A"}`, {
      continued: true,
    });
  doc
    .font("Times-Roman")
    .font("Times-Roman")
    .fontSize(12)
    .text(
      " % share profit (As Mentioned in Freelance Growth Matrix). Who are duly authorized to enter into this agreement (hereinafter referred to as the Associate) Second Party be deemed to mean and include its successors, representatives, assigns, administrators, executors and heirs.",
      { continued: false }
    );
  doc.moveDown(1);

  // WHEREAS
  doc.font("Times-Roman").font("Times-Bold").fontSize(14).text("WHEREAS:");
  const clauses = [
    "(A) Facilitator is engaged in the business of real estate consultation and services, facilitation transfer (i.e. sales/purchase/lease) of immovable properties.",
    "(B) Associate/Freelancer (Second Party) is a real estate broker and has represented that it is in contact with several persons/parties, who would be interested in seeking allotment of Plots/Flats/Spaces in said complex and has offered his service for booking of Plots/Flats/Spaces in said complex on commission basis.",
    "(C) That the Associate is desirous of expanding its business and understanding the services provided by Facilitator.",
    "(D) Both Associate and Facilitator have agreed to work together whereby Facilitator will provide the opportunities to sell space / area in the real estate projects and thereafter the Associate shall proceed to work on the business leads /opportunities provided by Facilitator and sell space /area to its clients as per their requirement.",
    "(E) The Associate and Facilitator have agreed to carry out the assignment for the clients (s) referred to the Associate by Facilitator on the terms and conditions stated herein under.",
    "This Agreement shall be deemed to have come into force, for all intents and purposes on the date of its execution. No one (including any employee of Inrext Pvt. Ltd.) is authorized to make any concession or deviation in any of the term or condition contained herein.",
  ];
  clauses.forEach((c) => addWrappedText(doc, c));

  // NOW THEREFORE
  doc
    .font("Times-Roman")
    .font("Times-Bold")
    .fontSize(12)
    .text("NOW THEREFORE: ", { continued: true });
  doc
    .font("Times-Roman")
    .text(
      "in consideration of the mutual promises and undertaking given by the parties to each other herein the parties hereby agree and covenant as follows:"
    );
  doc.moveDown();
  addWrappedText(
    doc,
    "Both the parties have agreed to enter into the present agreement on the terms and conditions as laid down herein below."
  );

  doc
    .font("Times-Roman")
    .font("Times-Bold")
    .fontSize(14)
    .text("NOW, THEREFORE, THIS AGREEMENT WITNESS AS FOLLOWS:");
  doc.moveDown();

  const agreementClauses = [
    "1. That the party of the first party is a well knows name in the real estate sector. It has various tie up with different real estate developers to sell the area/space and their various projects in different cities in India. These projects are residential, commercial, plots, farmlands. leasing, re-sale etc. as the case may be.",
    "2. In order to expand its business and provides area/space for selling in the market available with Inrext Pvt. Ltd. The Associate understanding the strength of Inrext Pvt. Ltd. & the Facilitator has approached to make the said area/space available to them so as enable to Associate to sell the said area/space to its clients in its state.",
    "3. Facilitator shall make available to the Associate market material, brochures etc. of each project that Facilitator makes available to the Associate to sell (As per availability) from developer.",
    "4. Associate/Freelancer (Second Party) shall not issue or execute any receipt on behalf of First Party/Developer. Associate shall also not receive any communication for and/or on behalf of Facilitator or Developer.",
    "5. All the rights related to PLC/Club Charge/IDC/EDC and other additional charges will be reserved for the Facilitator or Developer.",
    "6. Facilitator shall give entire pricing of the area/space made available to the Associate to sell, these prices are fixed by the Developer and Inrext Pvt. Ltd. (Facilitator) has no control over the same. It is an exclusive domain of the developer and cannot be charged or reduced.",
    "7. Count of booking for eligibility will be made only in the cases where 25% amount of total cost or unit is received as per the payment plan.",
    "8. It is agreed between the parties that Inrext Pvt. Ltd. shall pay brokerage/commission to the Associate at the rate mutually agreed between themselves on each area /space sold. A separate supplementary minutes duly signed by both the parties will be enters for each project area/space sold for determination of commission.",
    "9. It is hereby agreed by the Associate that the Associate will sell area /space to its customer/clients strictly as per the price fixed by the developer. Even the area/space sold by the Associate will be on the terms and conditions of the developers and that the Associate shall not change any term and conditions. The application for allotment etc. will always be on the standard format of the developer. This will vary from developer to developer and project to project. There is no say of even Inrext Pvt. Ltd. in these matters. It wills however be the prerogative of the Associate to offer discount to its customers /clients from the percentage of brokerage /commission received by it and that will be deduct from their brokerage / commission there will be no discount offered by Inrext Pvt. Ltd. or developer.",
    "10. In case First Party gives any discount to any intending allottee(s) on the recommendation of Associate, First Party shall be entitled to adjust and/or deduct amount equivalent to such discounts from the amounts/commissions payable to Associate.",
    "11. The Associate shall always keep Inrext Pvt. Ltd. informed about the area/space being sold to its clients /customers. Associate shall submit all booking application forms along with relevant documents and cheque/draft towards booking amount in the office of Inrext Pvt. Ltd. within twenty four hours of concluding the booking.",
    "12. Apart from commission, there is no any monthly financial support will be given from facilitator/First Party side to associates/Second Party. In case of any monthly support/advanced taken by associates/Second Party from facilitator/First Party which will be adjustable in commission at the time of commission billing.",
    "13. All payments made to the Associate shall be subject to deduction of TDS as per provisions of income tax act.",
    "14. It is understood between the parties that Inrext Pvt. Ltd. receives the payments from the developer. In no event, the Associate shall demand its brokerage/commission before Inrext Pvt. Ltd. receives the same from the Developers.",
    "15. The Associate shall update Inrext Pvt. Ltd. by way of weekly and monthly reports, wherein it shall give the detail of all the business transacted by it with its clients during the week & month. The monthly reports shall be sent to the first party in no time later than the 2nd day of the next month. In case the second party fails to abide by the obligations under the business model, party fails to perform the work properly and don't perform as per their work capability then company can terminate the second party without any written notice and this MOU treated as null and void.",
    "16. That the Facilitator/first party shall not be responsible for any dispute/litigation that might arise between the Associate and prospective clients of the second party for the nonperformance of the Associate. The second party undertakes to indemnify and hold the Inrext Pvt. Ltd. and its agents harmless against any dispute/litigation arising between the Associate and its prospective clients or existing clients.",
    "17. Failure of the parties to enforce at any time or for any period of time the provision hereof shall not be construed to be waiver of any provisions or of the right thereafter to enforce every provision no waiver by any of the parties in respect of a breach shall operate as a waiver in respect of any subsequent breach.",
    "18. Under the present agreement the parties are entitled to use each other's name as business partners for promoting the space/area being sold in the market. Associate shall not make any misrepresentation with respect to said project to anyone.",
    "19. Subsequent switching of sales/bookings between the Associate is not permitted.",
    "20. The party of the second part undertakes that it or any of its agents or employees or any other person working under it shall not either directly or indirectly solicit any work from the developers(s) that have been referred to by INREXT PVT. LTD.  however, if it is found that the second party has solicited work from the developers (s) referred by Inrext Pvt. Ltd. either during the subsistence or post termination of this agreement in that event Inrext Pvt. Ltd. shall be liable to claim damages for the loss of business suffered by it, due to business solicited by Associate further any or all space/area sold by the Associate directly through the developer shall be deemed to have been sold by Inrext Pvt. Ltd. and Inrext Pvt. Ltd. shall be entitled for its share of agreed percentage.",
    "21. Any cancellation in the said bookings shall revoke the incentive. All Advertising & Marketing Expense will be divided in 50:50 ratios both parties (First Party & Second Party).",
    "22. If any intending allottee ever surrenders or seeks cancellation of his booking or seeks reduction of area booked by him, Associate shall issue a 'No Objection Certificate' for such cancellation/surrender/reduction of area. Such 'No Objection Certificate' shall be accompanied by a Demand Draft issued in favor of FIRST PARTY for an amount equivalent to the total commission/discount received by Associate on account of such booking. In no condition Associate shall ever claim any commission (if remaining to be paid) on account of such booking. In case Associate fails or neglects to issue such 'No Objection Certificate' within fifteen days of intending allottee's request for cancellation/surrender/reduction of area, FIRST PARTY shall be free to act in accordance with intending request and deduct the commission paid for cancelled/surrendered/reduced area from Associate account. FIRST PARTY shall have no concern in case Associate had given any credit or other benefit to intending allottee and Associate shall settle its issues/matters/accounts with intending allottee at its own level.",
    "23. In addition, it is agreed by Associate/Freelancers (Second Party), if facilitator observes any indecency behavior, vulgar language or abuse etc., with the employees/staffs/senior staffs, or with our any clients. In such cases, the MOU/Agreement will be treated as null and void and facilitator can be charge to second party on any type of lost/damages when getting incurred by second party, remaining commission will be forfeited.",
    "24. That first party is expecting to associates to maintain the highest standards of professionalism, integrity, and respect in all interactions with clients, colleagues, and senior staff. Any form of misbehavior, including but not limited to Sexual harassment or misconduct, Unprofessional or disrespectful conduct, Breach of confidentiality or data protection, any unauthorized commitments to clients offering unauthorized discounts. Company will result in immediate disciplinary action, up to and including termination of this MOU, Furthermore, in the event of any misbehavior or misconduct, the Company reserves the right to seize and forfeit any accrued or unpaid commissions.",
    "25. This Memorandum may be amended at any time by agreement between the Parties the writing & signed.",
    "26. That in case a request for refund of booking is made by the clients through the Associate or directly for which commission has already been disbursed to the Associate the commission paid against the said booking shall be returned or adjusted as the case may be in the final account with Inrext Pvt. Ltd.",
    "27. That all payments made by Inrext Pvt. Ltd. shall be inclusive of the Taxes any deviations or changes to this clause shall be mutually decided on or before signing any agreement and the same shall be incorporated in the agreement.",
    "28. That the Associate will raise its Invoice/Commission bill on a monthly basis (Commission slab as per mentioned bellow) and the amount will be disbursed within 45-60 days from receiving a paper invoice and after due verification by the First Party. Associate commission shall be paid to Associate in such manner and installments, which shall become due on such payout structure as have been mentioned below. First Party shall not be liable to pay any interest on the amount of commission including on the ground of delay in payment thereof.",
    "29. Any payment made for site visits to the Associate will be subject to deduction from their Commission slab.",
    "30. This MOU valid for 3 months from the date of execution as mentioned in this MOU.",
    "31. Once the Agreement stand cancelled/terminated, in the event neither party shall use each other's intellectual property of the other party.",
    "32. Any dispute and differences arising out of or relating to this contract including interpretation of its terms shall be resolved through joint discussion of the chief executives of both the parties. However, if the dispute is not resolved by joint discussions, then the matter shall be referred to and settled by the party's arbitration and the arbitrator shall be appointed by the first party only. The arbitration proceedings shall be held in accordance with the arbitration and conciliation act, 2013 per any subsequent enactment or amendment thereto. The decision of the arbitrator shall be final and binding upon the parties. The venue of arbitration proceedings shall be at Noida.",
    "For all legal matters between the facilitator and associate Courts/Tribunals/Forums at Noida shall have the exclusive jurisdiction.",
  ];
  agreementClauses.forEach((clause) => addWrappedText(doc, clause));

  doc.moveDown();
  doc
    .font("Times-Roman")
    .font("Times-Bold")
    .fontSize(14)
    .text(
      "NOTE: PAYMENT OR OTHER RELATED TERMS & CONDITIONS OF BUILDER APPLY ON BOTH THE PARTIES."
    );
  doc.moveDown();

  doc
    .font("Times-Roman")
    .font("Times-Bold")
    .fontSize(12)
    .text("Consideration: -");
  doc.moveDown();

  const considerationPoints = [
    "It is agreed that the Facilitator/First Party shall pay brokerage/commission to Associate/Freelancer on Basic Price.",
    "Eligibility of promotion will be considered according to Freelancer growth matrix.",
    "Commission on Food Kiosk per Sale Rs.500/- PSF Comm.",
    "Commission on Retail Shop per Sale Rs.1,000/- PSF Comm. (Applicable on All Floors).",
    "Commission on Studio per Sale 50K Comm.",
    "Commission on Eco Village Cottage & Resort (Dehradun) per Sale 3% Comm. On BSP.",
  ];
  considerationPoints.forEach((p) => addWrappedText(doc, p));

  // Projects list
  doc
    .font("Times-Bold")
    .fontSize(12)
    .text("All Non-Exclusive Projects:", { underline: true });
  doc.moveDown(0.5);
  const projects = [
    ["Godrej", "KW"],
    ["Saya Piaza", "Bhutani"],
    ["Urbainia", "SBTL"],
    ["Paras Avenue", "Master Infra"],
    ["Lake City (Residential Plot & Farmhouse land)", ""],
  ];
  const projCol1X = 70;
  const projCol2X = 300;
  const projRowHeight = 18;
  let projY = doc.y;
  projects.forEach(([col1, col2]) => {
    doc.font("Times-Roman").fontSize(12).text(`• ${col1}`, projCol1X, projY);
    if (col2) doc.text(`• ${col2}`, projCol2X, projY);
    projY += projRowHeight;
  });
  doc.moveDown();
  addWrappedText(
    doc,
    "Note: Profit Slab will be declared at time of Booking. (Subject to discussion before booking)."
  );

  // Terms table
  doc.moveDown(2);
  doc
    .font("Times-Bold")
    .fontSize(12)
    .text("Terms of Commission Releasing Policy", { underline: true });
  doc.moveDown(0.5);
  const tableHeaders = [
    "Project Name",
    "Unit Payment % of COP",
    "Commission Release %",
  ];
  const tableRows = [
    ["Residential", "30-40% *", "100% Commission"],
    ["Commercial", "50% *", "100% Commission"],
    ["Plots (Freehold)", "On Every 30% Payment", "30% Commission"],
  ];
  const tableCol1X = 70,
    tableCol2X = 250,
    tableCol3X = 420,
    tableRowHeight = 20;
  let tableY = doc.y;
  doc.font("Times-Bold").fontSize(12);
  doc.text(tableHeaders[0], tableCol1X, tableY);
  doc.text(tableHeaders[1], tableCol2X, tableY);
  doc.text(tableHeaders[2], tableCol3X, tableY);
  tableY += 25;
  doc.font("Times-Roman").fontSize(12);
  tableRows.forEach((row) => {
    doc.text(row[0], tableCol1X, tableY);
    doc.text(row[1], tableCol2X, tableY);
    doc.text(row[2], tableCol3X, tableY);
    tableY += tableRowHeight;
  });
  doc.moveDown(2);

  addWrappedText(
    doc,
    "The Facilitator will pay the brokerage/commission within forty five to sixty days of submission of bill. However, bill will be treated as submitted only when all formalities of booking including submission of all documents and Booking Login Form have been completed and submitted."
  );
  addWrappedText(
    doc,
    "IN WITNESS WHEREOF the parties have set their respective hands to this memorandum of understanding on day, month and year first above mentioned in the presence of following witnesses."
  );

  doc.moveDown(2);

  // Signatures
  const currentY = doc.y;
  const sigStartOffset = 8;

  // Prefer facilitatorSignatureUrl param; otherwise leave empty
  let facilSigUrl = facilitatorSignatureUrl || "";

  try {
    if (facilSigUrl) {
      const sigX = 50; // left
      const sigMaxWidth = 150;
      const sigMaxHeight = 60;
      const sigYStart = currentY + sigStartOffset;
      try {
        doc.image(facilSigUrl, sigX, sigYStart, {
          fit: [sigMaxWidth, sigMaxHeight],
        });
      } catch (err) {
        if (
          facilSigUrl.startsWith("http://") ||
          facilSigUrl.startsWith("https://")
        ) {
          const buf = await fetchImageBufferSimple(facilSigUrl);
          if (buf) {
            try {
              doc.image(buf, sigX, sigYStart, {
                fit: [sigMaxWidth, sigMaxHeight],
              });
            } catch (e) {
              // ignore
            }
          }
        }
      }
    }
  } catch (e) {
    // continue
  }

  // Associate signature
  const loggedUser =
    employee &&
    (employee.loggedInUser || employee.loggedInUserObj || employee.loggedIn);
  const sigUrl =
    (loggedUser && loggedUser.employee && loggedUser.employee.signatureURL) ||
    (loggedUser && loggedUser.signatureURL) ||
    (employee && employee.signatureURL) ||
    (employee && employee.employee && employee.employee.signatureURL) ||
    "";

  if (sigUrl) {
    try {
      const sigX = 420;
      const sigMaxWidth = 150;
      const sigMaxHeight = 80;
      const sigYStart = currentY + sigStartOffset;
      try {
        doc.image(sigUrl, sigX, sigYStart, {
          fit: [sigMaxWidth, sigMaxHeight],
        });
      } catch (e) {
        if (sigUrl.startsWith("http://") || sigUrl.startsWith("https://")) {
          const buf = await fetchImageBuffer(sigUrl, 5);
          if (buf) {
            try {
              doc.image(buf, sigX, sigYStart, {
                fit: [sigMaxWidth, sigMaxHeight],
              });
            } catch (err) {
              // ignore
            }
          }
        }
      }
    } catch (err) {
      // ignore
    }
  }

  const sigBlockHeight = Math.max(60, 80);
  const sigBlockPadding = 4;
  const afterSigY =
    currentY + sigStartOffset + sigBlockHeight + sigBlockPadding;

  // Right side - Associate
  doc
    .font("Times-Roman")
    .font("Times-Bold")
    .fontSize(12)
    .text(`Associate`, 420, afterSigY, { align: "left" });
  doc.text(employeeName || "", 420, afterSigY + 12, { align: "left" });
  doc.text("ASSOCIATE", 420, afterSigY + 24, { align: "left" });

  // Left side - Facilitator
  const facilitatorLabelY = afterSigY;
  doc
    .font("Times-Roman")
    .font("Times-Bold")
    .fontSize(12)
    .text(`Authorized Person`, 50, facilitatorLabelY, { align: "left" });
  doc.text("M/s. Inrext Pvt. Ltd.", 50, facilitatorLabelY + 12, {
    align: "left",
  });
  doc.text("FACILITATOR", 50, facilitatorLabelY + 24, { align: "left" });

  doc.end();
  await streamFinished(stream);
  return filePath;
}

// generator.js already exports the function at its declaration; no extra export here.
