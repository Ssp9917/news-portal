import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    message: "सफलतापूर्वक लॉगआउट किया गया (Logged out successfully)",
  });

  // Clear both cookies
  response.cookies.set("auth_token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });
  response.cookies.set("admin_token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}

