// Debug endpoint to check cookies
import cookie from "cookie";

export default async function handler(req, res) {
  console.log("=== Cookie Debug ===");
  console.log("Headers:", req.headers);
  console.log("Raw Cookie Header:", req.headers.cookie);

  const parsedCookies = cookie.parse(req.headers.cookie || "");
  console.log("Parsed Cookies:", parsedCookies);

  res.status(200).json({
    success: true,
    data: {
      rawCookieHeader: req.headers.cookie,
      parsedCookies: parsedCookies,
      hasToken: !!parsedCookies.token,
    },
  });
}
