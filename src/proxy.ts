import { NextResponse, type NextRequest } from "next/server";

// Hızlı ön kontrol: oturum çerezi yoksa panel sayfalarından girişe yönlendir.
// Asıl yetki kontrolü sayfalarda ve server action'larda requireAdmin() ile yapılır.
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/giris") return NextResponse.next();
  if (!req.cookies.has("hermoza_admin")) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/giris";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
