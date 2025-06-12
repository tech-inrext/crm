const axios = require("axios");

// Test lead creation API
async function testLeadCreation() {
  const testLead = {
    leadId: `TEST-LEAD-${Date.now()}`,
    fullName: "John Doe",
    email: "john.doe@example.com",
    phone: "1234567890",
    propertyType: "Buy",
    location: "Mumbai, Andheri",
    budgetRange: "50-80 Lakhs",
    status: "New",
    source: "Web Form",
    assignedTo: "EMP001",
    nextFollowUp: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    followUpNotes: [
      {
        note: "Initial contact made",
        date: new Date().toISOString(),
      },
    ],
  };

  try {
    console.log("Testing lead creation...");
    console.log("Lead data:", JSON.stringify(testLead, null, 2));

    // Note: This will fail without proper authentication
    // This is just to test the data structure
    const response = await axios.post(
      "http://localhost:3000/api/v0/lead",
      testLead,
      {
        headers: {
          "Content-Type": "application/json",
          // Add authentication token here if available
          // 'Authorization': 'Bearer your-token-here'
        },
      }
    );

    console.log("✅ Lead created successfully:", response.data);
  } catch (error) {
    console.error("❌ Error creating lead:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Response:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
  }
}

// Test data validation
function validateLeadData() {
  console.log("\n=== Lead Data Validation Tests ===");

  const testCases = [
    {
      name: "Valid phone (digits only)",
      phone: "1234567890",
      expected: "valid",
    },
    {
      name: "Invalid phone (too short)",
      phone: "123456789",
      expected: "invalid",
    },
    {
      name: "Invalid phone (too long)",
      phone: "12345678901234567",
      expected: "invalid",
    },
    {
      name: "Invalid phone (with characters)",
      phone: "123-456-7890",
      expected: "invalid",
    },
  ];

  const phoneRegex = /^\d{10,15}$/;

  testCases.forEach((test) => {
    const isValid = phoneRegex.test(test.phone);
    const result = isValid ? "valid" : "invalid";
    const status = result === test.expected ? "✅ PASS" : "❌ FAIL";
    console.log(`${status} ${test.name}: ${test.phone} -> ${result}`);
  });
}

console.log("Lead API Test Script");
console.log("===================");
validateLeadData();
console.log("\n=== API Creation Test ===");
testLeadCreation();
