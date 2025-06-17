// pages/api/v0/employee/logout.js
// More robust cookie import for deployment
let cookie;
try {
  cookie = require("cookie");
} catch (err) {
  console.error("Failed to import cookie package:", err);
}

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Robust cookie clearing for deployment
  try {
    if (cookie && cookie.serialize) {
      res.setHeader(
        "Set-Cookie",
        cookie.serialize("token", "", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          expires: new Date(0),
          sameSite: "strict",
          path: "/",
        })
      );
    } else {
      // Fallback manual cookie clearing
      res.setHeader(
        "Set-Cookie",
        "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly"
      );
    }
  } catch (cookieError) {
    console.error("Cookie clearing error:", cookieError);
    // Fallback: simple cookie clearing
    res.setHeader("Set-Cookie", "token=; Path=/; HttpOnly");
  }

  res.status(200).json({ message: "Logged out successfully" });
}
