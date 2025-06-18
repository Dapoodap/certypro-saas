// middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login", // ganti sesuai halaman login kamu
  },
});

export const config = {
  matcher: ["/dashboard/:path*"], // path yang ingin kamu proteksi
};
