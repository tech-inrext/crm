// Simple test to check if employee creation works
const testEmployeeAPI = async () => {
  try {
    const testData = {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+919876543210",
      address: "123 Main Street, Test City, Test State",
      designation: "Software Developer",
      role: "Employee",
      gender: "Male",
      age: 28,
      joiningDate: "2024-01-15",
    };

    console.log("Testing employee creation with data:", testData);

    // This would need to be run when the server is running
    console.log("To test this manually:");
    console.log("1. Make sure the dev server is running (npm run dev)");
    console.log("2. Open browser dev tools");
    console.log("3. Go to Network tab");
    console.log("4. Try to create an employee through the UI");
    console.log("5. Check the request and response in Network tab");
  } catch (error) {
    console.error("Test failed:", error);
  }
};

testEmployeeAPI();
