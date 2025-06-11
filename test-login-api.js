// Test login API call
async function testLoginAPI() {
  try {
    console.log("Testing login API...");

    const response = await fetch(
      "http://localhost:3001/api/v0/employee/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "demo@example.com",
          password: "demo123",
        }),
      }
    );

    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Response:", data);

    if (response.ok) {
      console.log("✅ Login API works!");
    } else {
      console.log("❌ Login API failed");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testLoginAPI();
