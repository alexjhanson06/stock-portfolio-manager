import { auth, signOut } from "@/lib/auth";
import Link from "next/link";

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-lg font-bold text-indigo-600">
            PortfolioAI
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/portfolio"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Portfolio
            </Link>
            <Link
              href="/insights"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              AI Insights
            </Link>
            <Link
              href="/risk"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Risk
            </Link>
            <Link
              href="/allocate"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Allocate
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {session?.user?.name && (
            <span className="text-sm text-gray-500">{session.user.name}</span>
          )}
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/auth/login" });
            }}
          >
            <button
              type="submit"
              className="text-sm text-gray-500 hover:text-gray-900 font-medium"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
