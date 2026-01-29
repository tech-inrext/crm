import { Service } from "@framework";
import BookingLogin from "../models/BookingLogin";
import ExcelJS from "exceljs";

class BookingLoginService extends Service {
  constructor() {
    super();
  }

  // Helper function to check role permissions
  _getRolePermissions(req) {
    const userRole = req.role?.name?.toLowerCase();
    const isAccountsUser = userRole === "accounts" || userRole === "admin";
    const isSystemAdmin = req.isSystemAdmin;
    const currentUserId = req.employee?._id;
    return { isAccountsUser, isSystemAdmin, currentUserId, userRole };
  }

  // Create new booking login
  async createBookingLogin(req, res) {
    try {
      const bookingData = {
        ...req.body,
        createdBy: req.employee._id,
      };

      const bookingLogin = new BookingLogin(bookingData);
      await bookingLogin.save();

      return res.status(201).json({
        success: true,
        message: "Booking login created successfully",
        data: bookingLogin,
      });
    } catch (error) {
      console.error("Booking creation error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create booking login",
        error: error.message,
      });
    }
  }

  // Get all booking logins with filtering and pagination
  async getAllBookingLogins(req, res) {
    console.log("getAllBookingLogins hit");
    try {
      // Disable caching
      res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
      );
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.setHeader("Surrogate-Control", "no-store");

      const {
        page = 1,
        limit = 10,
        search = "",
        status = "",
        projectName = "",
        teamHeadName = "",
        startDate = "",
        endDate = "",
        download = false,
      } = req.query;

      const currentPage = parseInt(page);
      const itemsPerPage = parseInt(limit);
      const skip = (currentPage - 1) * itemsPerPage;

      const { isAccountsUser, isSystemAdmin, currentUserId } =
        this._getRolePermissions(req);

      // Build query - role-based filtering
      const query = {};

      if (!isAccountsUser && !isSystemAdmin && currentUserId) {
        query.createdBy = currentUserId;
      }

      if (search) {
        query.$or = [
          { customer1Name: { $regex: search, $options: "i" } },
          { customer2Name: { $regex: search, $options: "i" } },
          { phoneNo: { $regex: search, $options: "i" } },
          { unitNo: { $regex: search, $options: "i" } },
        ];
      }

      if (status) {
        query.status = status;
      }

      if (projectName) {
        query.projectName = { $regex: projectName, $options: "i" };
      }

      if (teamHeadName) {
        query.teamHeadName = { $regex: teamHeadName, $options: "i" };
      }

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
          query.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          query.createdAt.$lte = new Date(endDate);
        }
      }

      let bookings, totalBookings;

      if (download === "true") {
        bookings = await BookingLogin.find(query)
          .populate("createdBy", "name email employeeProfileId")
          .populate("approvedBy", "name email employeeProfileId")
          .sort({ createdAt: -1 });

        return res.status(200).json({
          success: true,
          data: bookings,
          totalItems: bookings.length,
          isDownload: true,
        });
      } else {
        [bookings, totalBookings] = await Promise.all([
          BookingLogin.find(query)
            .populate("createdBy", "name email employeeProfileId")
            .populate("approvedBy", "name email employeeProfileId")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(itemsPerPage),
          BookingLogin.countDocuments(query),
        ]);
      }

      return res.status(200).json({
        success: true,
        data: bookings,
        pagination: {
          totalItems: totalBookings,
          currentPage,
          itemsPerPage,
          totalPages: Math.ceil(totalBookings / itemsPerPage),
        },
        userInfo: {
          isAccountsUser,
          isSystemAdmin,
          userId: currentUserId,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch booking logins",
        error: error.message,
      });
    }
  }

  // Get booking login by ID
  async getBookingLoginById(req, res) {
    const { id } = req.query;

    try {
      const booking = await BookingLogin.findById(id)
        .populate("createdBy", "name email employeeProfileId")
        .populate("approvedBy", "name email employeeProfileId");

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking login not found",
        });
      }

      const { isAccountsUser, isSystemAdmin, currentUserId } =
        this._getRolePermissions(req);
      const isCreator = String(booking.createdBy._id) === String(currentUserId);

      if (!isAccountsUser && !isSystemAdmin && !isCreator) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You can only view your own bookings.",
        });
      }

      return res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch booking login",
        error: error.message,
      });
    }
  }

  // Update booking login
  async updateBookingLogin(req, res) {
    const { id } = req.query;
    console.log("updateBookingLogin hit");
    try {
      const booking = await BookingLogin.findById(id);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking login not found",
        });
      }

      const { isAccountsUser, isSystemAdmin, currentUserId } =
        this._getRolePermissions(req);
      // const isCreator = String(booking.createdBy) === String(currentUserId);

      if (!isAccountsUser && !isSystemAdmin && booking.status !== "draft") {
        return res.status(403).json({
          success: false,
          message:
            "Cannot edit submitted booking. Only draft bookings can be edited.",
        });
      }

      if (
        req.body.status &&
        ["approved", "rejected"].includes(req.body.status)
      ) {
        if (!isAccountsUser && !isSystemAdmin) {
          return res.status(403).json({
            success: false,
            message: "Only Accounts/Admin role can approve or reject bookings",
          });
        }
      }

      if (
        (booking.status === "approved" || booking.status === "rejected") &&
        !isAccountsUser &&
        !isSystemAdmin
      ) {
        return res.status(400).json({
          success: false,
          message: "Cannot modify approved or rejected booking",
        });
      }

      const updatedBooking = await BookingLogin.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true, runValidators: true }
      ).populate("createdBy", "name email employeeProfileId");

      return res.status(200).json({
        success: true,
        message: "Booking login updated successfully",
        data: updatedBooking,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to update booking login",
        error: error.message,
      });
    }
  }

  // Delete booking login
  async deleteBookingLogin(req, res) {
    const { id } = req.query;

    try {
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Booking ID is required",
        });
      }

      const booking = await BookingLogin.findById(id);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking login not found",
        });
      }

      // Check permissions logic specific for DELETE
      // Re-implementing logic from original files:
      // Accounts/Admin can delete any.
      // Others only draft.
      const userRoleLower = req.role?.name?.toLowerCase();
      const canDeleteAny =
        userRoleLower === "accounts" ||
        userRoleLower === "admin" ||
        req.isSystemAdmin; // Added system admin check for safety although not strictly in original DELETE logic variable name 'isAccountsUser' was used there for 'accounts' check only but usually admin has rights.
      // Original code: const isAccountsUser = userRole === 'accounts';
      // Original logic: if (!isAccountsUser) { if (booking.status !== 'draft') ... }
      // It seems strictly 'accounts' role was checked. Let's stick to original logic but add safety if needed?
      // Actually strictly sticking to original logic:
      const isAccountsUserStrict = userRoleLower === "accounts";

      if (!isAccountsUserStrict) {
        if (booking.status !== "draft") {
          return res.status(403).json({
            success: false,
            message:
              "Only draft bookings can be deleted. Contact accounts team for assistance.",
          });
        }
      }

      const result = await BookingLogin.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: "Booking login deleted successfully",
        data: {
          id: result._id,
          projectName: result.projectName,
          customer1Name: result.customer1Name,
        },
      });
    } catch (error) {
      console.error("Delete booking error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete booking login",
        error: error.message,
      });
    }
  }

  // Update booking status
  async updateBookingStatus(req, res) {
    const { id } = req.query;
    const { status, rejectionReason } = req.body;

    try {
      const booking = await BookingLogin.findById(id);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking login not found",
        });
      }

      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status. Must be 'approved' or 'rejected'",
        });
      }

      if (status === "rejected" && !rejectionReason) {
        return res.status(400).json({
          success: false,
          message: "Rejection reason is required",
        });
      }

      const { isAccountsUser, isSystemAdmin } = this._getRolePermissions(req);

      if (!isAccountsUser && !isSystemAdmin) {
        return res.status(403).json({
          success: false,
          message: "Only Accounts/Admin role can approve or reject bookings",
        });
      }

      booking.status = status;
      booking.approvedBy = status === "approved" ? req.employee._id : null;
      booking.rejectionReason = status === "rejected" ? rejectionReason : "";

      await booking.save();

      const updatedBooking = await BookingLogin.findById(id)
        .populate("createdBy", "name email employeeProfileId")
        .populate("approvedBy", "name email employeeProfileId");

      return res.status(200).json({
        success: true,
        message: `Booking ${status} successfully`,
        data: updatedBooking,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to update booking status",
        error: error.message,
      });
    }
  }

  // Export bookings to Excel
  async exportBookingsToExcel(req, res) {
    try {
      const {
        startDate = "",
        endDate = "",
        projectName = "",
        teamHeadName = "",
        status = "",
      } = req.query;

      const { isAccountsUser, isSystemAdmin, currentUserId } =
        this._getRolePermissions(req);

      const query = {};

      if (!isAccountsUser && !isSystemAdmin && currentUserId) {
        query.createdBy = currentUserId;
      }

      if (projectName) {
        query.projectName = { $regex: projectName, $options: "i" };
      }

      if (teamHeadName) {
        query.teamHeadName = { $regex: teamHeadName, $options: "i" };
      }

      if (status) {
        query.status = status;
      }

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
          query.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          query.createdAt.$lte = new Date(endDate);
        }
      }

      const bookings = await BookingLogin.find(query)
        .populate("createdBy", "name email employeeProfileId")
        .populate("approvedBy", "name email employeeProfileId")
        .sort({ teamHeadName: 1, projectName: 1 });

      const summaryData = this.generateTeamHeadSummary(bookings);

      const workbook = new ExcelJS.Workbook();
      const summarySheet = workbook.addWorksheet("Team Head Summary");

      summarySheet.columns = [
        { header: "Team Head Name", key: "teamHead", width: 30 },
        { header: "Project", key: "project", width: 40 },
        { header: "Bookings", key: "bookings", width: 20 },
        { header: "Total No. of Booking", key: "total", width: 20 },
      ];

      let rowIndex = 1;

      summaryData.forEach((teamHeadData, index) => {
        summarySheet.addRow({
          teamHead: teamHeadData.teamHead,
          project: "",
          bookings: "",
          total: "",
        });

        const teamHeadRow = summarySheet.getRow(rowIndex);
        teamHeadRow.font = { bold: true, size: 12 };
        teamHeadRow.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE0E0E0" },
        };

        rowIndex++;

        teamHeadData.projects.forEach((project) => {
          summarySheet.addRow({
            teamHead: "",
            project: project.name,
            bookings: project.count,
            total: "",
          });
          rowIndex++;
        });

        summarySheet.addRow({
          teamHead: "",
          project: "",
          bookings: "",
          total: `Total: ${teamHeadData.total}`,
        });

        const totalRow = summarySheet.getRow(rowIndex);
        totalRow.font = { bold: true };
        totalRow.getCell("D").fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF0F0F0" },
        };

        rowIndex++;

        if (index < summaryData.length - 1) {
          summarySheet.addRow({});
          rowIndex++;
        }
      });

      const headerRow = summarySheet.getRow(1);
      headerRow.font = { bold: true, size: 12 };
      headerRow.alignment = { horizontal: "center" };
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF4F81BD" },
        };
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      for (let i = 1; i <= rowIndex; i++) {
        const row = summarySheet.getRow(i);
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      }

      summarySheet.columns.forEach((column) => {
        column.width = Math.max(column.width || 0, 15);
      });

      const detailsSheet = workbook.addWorksheet("Detailed Bookings");
      detailsSheet.columns = [
        { header: "Team Head", key: "teamHead", width: 25 },
        { header: "Project Name", key: "projectName", width: 30 },
        { header: "Customer Name", key: "customer1Name", width: 25 },
        { header: "Phone No", key: "phoneNo", width: 15 },
        { header: "Unit No", key: "unitNo", width: 15 },
        { header: "Area", key: "area", width: 15 },
        { header: "Status", key: "status", width: 15 },
        { header: "Created By", key: "createdByName", width: 25 },
        { header: "Booking Amount", key: "bookingAmount", width: 20 },
        { header: "Created Date", key: "createdAt", width: 20 },
        { header: "Transaction Date", key: "transactionDate", width: 20 },
      ];

      bookings.forEach((booking) => {
        detailsSheet.addRow({
          teamHead: booking.teamHeadName || "",
          projectName: booking.projectName || "",
          customer1Name: booking.customer1Name || "",
          phoneNo: booking.phoneNo || "",
          unitNo: booking.unitNo || "",
          area: booking.area || "",
          status: booking.status || "",
          createdByName: booking.createdBy?.name || "",
          bookingAmount: booking.bookingAmount || "",
          createdAt: booking.createdAt
            ? new Date(booking.createdAt).toLocaleDateString()
            : "",
          transactionDate: booking.transactionDate
            ? new Date(booking.transactionDate).toLocaleDateString()
            : "",
        });
      });

      detailsSheet.getRow(1).font = { bold: true };
      detailsSheet.getRow(1).eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE0E0E0" },
        };
      });

      const statsSheet = workbook.addWorksheet("Statistics");
      statsSheet.columns = [
        { header: "Team Head", key: "teamHead", width: 25 },
        { header: "Total Bookings", key: "total", width: 15 },
        { header: "By Project", key: "byProject", width: 40 },
      ];

      summaryData.forEach((teamHeadData) => {
        const projectDetails = teamHeadData.projects
          .map((p) => `${p.name}: ${p.count}`)
          .join(", ");

        statsSheet.addRow({
          teamHead: teamHeadData.teamHead,
          total: teamHeadData.total,
          byProject: projectDetails,
        });
      });

      statsSheet.getRow(1).font = { bold: true };
      statsSheet.getRow(1).eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE0E0E0" },
        };
      });

      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `booking_summary_${timestamp}.xlsx`;

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error("Export error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to export bookings",
        error: error.message,
      });
    }
  }

  generateTeamHeadSummary(bookings) {
    const teamHeadMap = {};

    bookings.forEach((booking) => {
      const teamHead = booking.teamHeadName || "Unknown Team Head";
      const project = booking.projectName || "Unknown Project";

      if (!teamHeadMap[teamHead]) {
        teamHeadMap[teamHead] = {
          teamHead: teamHead,
          projects: {},
          total: 0,
        };
      }

      if (!teamHeadMap[teamHead].projects[project]) {
        teamHeadMap[teamHead].projects[project] = 0;
      }

      teamHeadMap[teamHead].projects[project]++;
      teamHeadMap[teamHead].total++;
    });

    const summaryData = Object.values(teamHeadMap).map((teamHeadData) => {
      const projectsArray = Object.entries(teamHeadData.projects)
        .map(([name, count]) => ({
          name,
          count,
        }))
        .sort((a, b) => b.count - a.count);

      return {
        teamHead: teamHeadData.teamHead,
        projects: projectsArray,
        total: teamHeadData.total,
      };
    });

    summaryData.sort((a, b) => a.teamHead.localeCompare(b.teamHead));

    return summaryData;
  }
}

export default BookingLoginService;
