import { NextResponse } from "next/server";
import { verifyToken, getTokenFromHeader, JWTPayload } from "./jwt";
import { hasPermission, Permission } from "./rbac";

export interface AuthResult {
  authorized: boolean;
  user?: JWTPayload;
  errorResponse?: NextResponse;
}

export function authenticateRequest(
  req: Request,
  requiredPermission?: Permission
): AuthResult {
  const authHeader = req.headers.get("authorization");
  let token = getTokenFromHeader(authHeader);

  // If no auth header, check cookies (both admin_token and auth_token supported)
  if (!token) {
    const cookieHeader = req.headers.get("cookie");
    if (cookieHeader) {
      const match =
        cookieHeader.match(/admin_token=([^;]+)/) ||
        cookieHeader.match(/auth_token=([^;]+)/);
      if (match) token = match[1];
    }
  }

  if (!token) {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  const payload = verifyToken(token);
  if (!payload) {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { message: "Invalid or expired session token" },
        { status: 401 }
      ),
    };
  }

  if (requiredPermission && !hasPermission(payload.role, requiredPermission)) {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        {
          message: "Forbidden: You do not have permission for this action",
          requiredPermission,
          role: payload.role,
        },
        { status: 403 }
      ),
    };
  }

  return { authorized: true, user: payload };
}
