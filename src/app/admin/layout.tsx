import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = { title: "Admin — VYRAL" };

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
