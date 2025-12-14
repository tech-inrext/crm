// pages/api/v0/booking-login/export.js
import dbConnect from "../../../../lib/mongodb";
import BookingLogin from "../../../../models/BookingLogin";
import * as cookie from "cookie";
import { userAuth } from "../../../../middlewares/auth";
import ExcelJS from 'exceljs';

const exportBookingsToExcel = async (req, res) => {
  try {
    const {
      startDate = "",
      endDate = "",
      projectName = "",
      teamHeadName = "",
      status = ""
    } = req.query;

    const userRole = req.role?.name?.toLowerCase();
    const isAccountsUser = userRole === 'accounts' || userRole === 'admin';
    const isSystemAdmin = req.isSystemAdmin;
    const currentUserId = req.employee?._id;

    // Build query
    const query = {};

    // Regular users can only see their own bookings
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

    // date filtering
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Fetch all bookings
    const bookings = await BookingLogin.find(query)
      .populate("createdBy", "name email employeeProfileId")
      .populate("approvedBy", "name email employeeProfileId")
      .sort({ teamHeadName: 1, projectName: 1 });

    const summaryData = generateTeamHeadSummary(bookings);

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    
    // Team Head Summary Sheet (Main Report)
    const summarySheet = workbook.addWorksheet('Team Head Summary');
    
    // Set column headers matching your screenshot
    summarySheet.columns = [
      { header: 'Team Head Name', key: 'teamHead', width: 30 },
      { header: 'Project', key: 'project', width: 40 },
      { header: 'Bookings', key: 'bookings', width: 20 },
      { header: 'Total No. of Booking', key: 'total', width: 20 }
    ];

    // data in the format from your screenshot
    let rowIndex = 1;
    
    summaryData.forEach((teamHeadData, index) => {
      // team head row
      summarySheet.addRow({
        teamHead: teamHeadData.teamHead,
        project: '',
        bookings: '',
        total: ''
      });
      
      // Style team head row
      const teamHeadRow = summarySheet.getRow(rowIndex);
      teamHeadRow.font = { bold: true, size: 12 };
      teamHeadRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      
      rowIndex++;

      // project rows for this team head
      teamHeadData.projects.forEach(project => {
        summarySheet.addRow({
          teamHead: '',
          project: project.name,
          bookings: project.count,
          total: ''
        });
        rowIndex++;
      });

      // total row for this team head
      summarySheet.addRow({
        teamHead: '',
        project: '',
        bookings: '',
        total: `Total: ${teamHeadData.total}`
      });
      
      // Style total row
      const totalRow = summarySheet.getRow(rowIndex);
      totalRow.font = { bold: true };
      totalRow.getCell('D').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF0F0F0' }
      };
      
      rowIndex++;

      // empty row for spacing (except after last team head)
      if (index < summaryData.length - 1) {
        summarySheet.addRow({});
        rowIndex++;
      }
    });

    // Format header row
    const headerRow = summarySheet.getRow(1);
    headerRow.font = { bold: true, size: 12 };
    headerRow.alignment = { horizontal: 'center' };
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F81BD' }
      };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // borders to all cells
    for (let i = 1; i <= rowIndex; i++) {
      const row = summarySheet.getRow(i);
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    }

    // Auto-size columns
    summarySheet.columns.forEach(column => {
      column.width = Math.max(column.width || 0, 15);
    });

    // Detailed Bookings Sheet
    const detailsSheet = workbook.addWorksheet('Detailed Bookings');
    detailsSheet.columns = [
      { header: 'Team Head', key: 'teamHead', width: 25 },
      { header: 'Project Name', key: 'projectName', width: 30 },
      { header: 'Customer Name', key: 'customer1Name', width: 25 },
      { header: 'Phone No', key: 'phoneNo', width: 15 },
      { header: 'Unit No', key: 'unitNo', width: 15 },
      { header: 'Area', key: 'area', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Created By', key: 'createdByName', width: 25 },
      { header: 'Booking Amount', key: 'bookingAmount', width: 20 },
      { header: 'Created Date', key: 'createdAt', width: 20 },
      { header: 'Transaction Date', key: 'transactionDate', width: 20 }
    ];

    // booking data
    bookings.forEach(booking => {
      detailsSheet.addRow({
        teamHead: booking.teamHeadName || '',
        projectName: booking.projectName || '',
        customer1Name: booking.customer1Name || '',
        phoneNo: booking.phoneNo || '',
        unitNo: booking.unitNo || '',
        area: booking.area || '',
        status: booking.status || '',
        createdByName: booking.createdBy?.name || '',
        bookingAmount: booking.bookingAmount || '',
        createdAt: booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : '',
        transactionDate: booking.transactionDate ? new Date(booking.transactionDate).toLocaleDateString() : ''
      });
    });

    // Format details sheet header
    detailsSheet.getRow(1).font = { bold: true };
    detailsSheet.getRow(1).eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
    });

    // Summary Statistics Sheet
    const statsSheet = workbook.addWorksheet('Statistics');
    statsSheet.columns = [
      { header: 'Team Head', key: 'teamHead', width: 25 },
      { header: 'Total Bookings', key: 'total', width: 15 },
      { header: 'By Project', key: 'byProject', width: 40 }
    ];

    // statistics data
    summaryData.forEach(teamHeadData => {
      const projectDetails = teamHeadData.projects
        .map(p => `${p.name}: ${p.count}`)
        .join(', ');
      
      statsSheet.addRow({
        teamHead: teamHeadData.teamHead,
        total: teamHeadData.total,
        byProject: projectDetails
      });
    });

    // statistics sheet
    statsSheet.getRow(1).font = { bold: true };
    statsSheet.getRow(1).eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
    });

    // filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `booking_summary_${timestamp}.xlsx`;

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Export error:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to export bookings",
      error: error.message,
    });
  }
};

// Helper function to generate team head summary matching screenshot format
function generateTeamHeadSummary(bookings) {
  const teamHeadMap = {};
  
  // Group by team head
  bookings.forEach(booking => {
    const teamHead = booking.teamHeadName || 'Unknown Team Head';
    const project = booking.projectName || 'Unknown Project';
    
    if (!teamHeadMap[teamHead]) {
      teamHeadMap[teamHead] = {
        teamHead: teamHead,
        projects: {},
        total: 0
      };
    }
    
    if (!teamHeadMap[teamHead].projects[project]) {
      teamHeadMap[teamHead].projects[project] = 0;
    }
    
    teamHeadMap[teamHead].projects[project]++;
    teamHeadMap[teamHead].total++;
  });
  
  // Convert to array format for Excel
  const summaryData = Object.values(teamHeadMap).map(teamHeadData => {
    // Convert projects object to array
    const projectsArray = Object.entries(teamHeadData.projects)
      .map(([name, count]) => ({
        name,
        count
      }))
      .sort((a, b) => b.count - a.count); // Sort by count descending
    
    return {
      teamHead: teamHeadData.teamHead,
      projects: projectsArray,
      total: teamHeadData.total
    };
  });
  
  // Sort by team head name
  summaryData.sort((a, b) => a.teamHead.localeCompare(b.teamHead));
  
  return summaryData;
}

function withAuth(handler) {
  return async (req, res) => {
    const parsedCookies = cookie.parse(req.headers.cookie || "");
    req.cookies = parsedCookies;
    await userAuth(req, res, () => handler(req, res));
  };
}

export default withAuth(exportBookingsToExcel);