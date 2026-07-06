const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/inrext_crm").then(async () => {
  const db = mongoose.connection.db;
  const Employee = db.collection("employees");
  const emps = await Employee.find({ aadharBackUrl: { $exists: true, $ne: "" } }).toArray();
  console.log("Employees with aadharBackUrl:", emps.length);
  if(emps.length > 0) console.log(emps[0].aadharBackUrl);
  process.exit(0);
}).catch(console.error);
