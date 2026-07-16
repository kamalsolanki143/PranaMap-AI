import TopBar from "@/components/Common/TopBar";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <>
      <TopBar title="System Settings" />
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl mb-4 block" style={{ color: "rgba(185,202,202,0.2)" }}>
            settings
          </span>
          <h2 className="font-geist font-semibold mb-2" style={{ fontSize: "22px", color: "rgba(185,202,202,0.5)" }}>
            Settings Panel
          </h2>
          <p style={{ fontSize: "14px", color: "rgba(185,202,202,0.35)" }}>Configuration options coming soon.</p>
          <Link href="/dashboard" className="inline-block mt-6 px-6 py-3 rounded font-inter font-bold uppercase text-xs" style={{ background: "rgba(0,245,255,0.1)", border: "1px solid rgba(0,245,255,0.3)", color: "#00f5ff", letterSpacing: "0.06em" }}>
            Back to Command Center
          </Link>
        </div>
      </div>
    </>
  );
}
