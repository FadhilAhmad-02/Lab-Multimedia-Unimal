import { Outlet } from "react-router";
import { v } from "./pageUtils";

export function AuthLayout() {
  return (
    <div
      className="min-h-screen theme-aware"
      style={{ background: v("--c-bg"), color: v("--c-text") }}
    >
      <Outlet />
    </div>
  );
}
