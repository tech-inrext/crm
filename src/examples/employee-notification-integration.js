// Example integration with User/Employee module
import { NotificationHelper } from "../../../../lib/notification-helpers";

// Add this to your existing Employee service/controller

class EmployeeServiceWithNotifications {
  async createEmployee(req, res) {
    try {
      const employeeData = req.body;
      const createdBy = req.employee?._id;

      // Create employee (your existing logic)
      const employee = new Employee(employeeData);
      await employee.save();

      // Send notification to HR and managers about new employee
      await NotificationHelper.notifyNewUser(employee._id, createdBy, {
        name: employee.name,
        email: employee.email,
      });

      return res.status(201).json({
        success: true,
        data: employee,
        message: "Employee created successfully",
      });
    } catch (error) {
      console.error("Error creating employee:", error);
      return res.status(500).json({
        success: false,
        message: "Error creating employee",
        error: error.message,
      });
    }
  }

  async updateEmployeeRoles(req, res) {
    try {
      const { employeeId } = req.params;
      const { roles } = req.body;
      const updatedBy = req.employee?._id;

      // Get current employee with roles
      const employee = await Employee.findById(employeeId).populate("roles");
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      const oldRoles = employee.roles;

      // Update roles (your existing logic)
      employee.roles = roles;
      await employee.save();

      // Get new roles
      const updatedEmployee = await Employee.findById(employeeId).populate(
        "roles"
      );

      // Send notification about role change
      await NotificationHelper.notifyUserRoleChanged(
        employeeId,
        oldRoles,
        updatedEmployee.roles,
        updatedBy
      );

      return res.status(200).json({
        success: true,
        data: updatedEmployee,
        message: "Employee roles updated successfully",
      });
    } catch (error) {
      console.error("Error updating employee roles:", error);
      return res.status(500).json({
        success: false,
        message: "Error updating roles",
        error: error.message,
      });
    }
  }

  async updateMOUStatus(req, res) {
    try {
      const { employeeId } = req.params;
      const { status, comments } = req.body;
      const approvedBy = req.employee?._id;

      const employee = await Employee.findByIdAndUpdate(
        employeeId,
        {
          mouStatus: status,
          mouComments: comments,
          mouApprovedBy: status === "APPROVED" ? approvedBy : null,
          mouApprovedAt: status === "APPROVED" ? new Date() : null,
        },
        { new: true }
      );

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      // Send notification about MOU status change
      await NotificationHelper.notifyMOUStatusChange(
        employeeId,
        status,
        approvedBy,
        {
          comments,
        }
      );

      return res.status(200).json({
        success: true,
        data: employee,
        message: `MOU ${status.toLowerCase()} successfully`,
      });
    } catch (error) {
      console.error("Error updating MOU status:", error);
      return res.status(500).json({
        success: false,
        message: "Error updating MOU status",
        error: error.message,
      });
    }
  }
}

// Example system announcement function
export async function sendSystemAnnouncement(req, res) {
  try {
    const { title, message, priority, targetRoles } = req.body;

    // Send system announcement
    await NotificationHelper.notifySystemAnnouncement(
      title,
      message,
      priority,
      targetRoles
    );

    return res.status(200).json({
      success: true,
      message: "System announcement sent successfully",
    });
  } catch (error) {
    console.error("Error sending system announcement:", error);
    return res.status(500).json({
      success: false,
      message: "Error sending announcement",
      error: error.message,
    });
  }
}
