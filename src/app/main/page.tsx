import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Main",
  description: "UzChess main page.",
};

export default function MainPage() {
  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <h1 className="text-3xl font-semibold">Main</h1>
    </div>
  );
}
