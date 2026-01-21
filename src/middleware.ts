import { NextResponse } from "next/server";

export function middleware(req: Request) {
   const origin = req.headers.get("origin");
  const allowedOrigin = "http://localhost:3001";

  const response = NextResponse.next();

  if (origin === allowedOrigin) {
    console.log("🔥 MIDDLEWARE HIT:", req.method, req.url);

    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: response.headers,
    });
  }

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
