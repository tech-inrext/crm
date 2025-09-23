const handler = async (req, res) => {
  try {
    // Try to require pdfkit; if not present this will throw
    require("pdfkit");
    return res.status(200).json({ success: true, pdfkit: true, message: "pdfkit available" });
  } catch (err) {
    return res
      .status(503)
      .json({ success: false, pdfkit: false, message: "pdfkit not available", error: err.message });
  }
};

export default handler;
