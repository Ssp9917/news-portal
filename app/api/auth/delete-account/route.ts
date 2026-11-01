import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import DeviceToken from "@/models/DeviceToken";
import { authenticateRequest } from "@/lib/auth/require-auth";

export async function DELETE(req: Request) {
  try {
    const auth = authenticateRequest(req);
    if (!auth.authorized || !auth.user) {
      return auth.errorResponse || NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Prevent deletion of master super admin
    if (auth.user.role === "super_admin") {
      const superAdminCount = await User.countDocuments({ role: "super_admin" });
      if (superAdminCount <= 1) {
        return NextResponse.json(
          { message: "Cannot delete the sole super admin account" },
          { status: 400 }
        );
      }
    }

    // Clean up device tokens and user record
    await Promise.all([
      DeviceToken.deleteMany({ userId: auth.user.userId }),
      User.findByIdAndDelete(auth.user.userId),
    ]);

    const response = NextResponse.json({
      message: "खाता सफलतापूर्वक हटा दिया गया है (Account deleted successfully)",
    });

    response.cookies.set("auth_token", "", { expires: new Date(0), path: "/" });
    response.cookies.set("admin_token", "", { expires: new Date(0), path: "/" });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

