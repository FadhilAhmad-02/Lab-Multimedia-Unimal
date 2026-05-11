import { Outlet } from "react-router";
import { AppNavbar } from "./AppNavbar";
import { AppFooter } from "./AppFooter";
import { v } from "./pageUtils";

export function Layout() {
  return (
    <div
      className="min-h-screen theme-aware"
      style={{
        background: v("--c-bg"),
        color: v("--c-text"),
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <AppNavbar />
      <Outlet />
      <AppFooter />
    </div>
  );
}
