import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import InsightsClient from "@/components/insights/InsightsClient";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-amber-400 mb-2">AI Insights</h1>
        <p className="text-gray-500 mb-6">
          Educational analysis only — not financial advice.
        </p>
        <InsightsClient />
      </main>
    </>
  );
}
