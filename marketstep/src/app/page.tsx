import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-zinc-900 dark:text-zinc-100">
          Welcome to <span className="text-zinc-800 dark:text-zinc-200 px-2 py-1">MarketStep</span>
        </h1>
        <p className="mt-6 text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Stay ahead of the curve by following innovative activity in your market. Get real-time insights and updates on emerging trends.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/login" passHref>
            <Button size="lg" className="px-8 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
              Login
            </Button>
          </Link>
          <Link href="/dashboard" passHref>
            <Button size="lg" variant="outline" className="px-8 border-zinc-300 text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800">
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="mt-20 max-w-7xl mx-auto grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Market Intelligence</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            Get comprehensive insights into market trends, competitor activities, and emerging opportunities.
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Innovation Tracking</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            Monitor patents, research papers, startups, and other innovation indicators in your industry.
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Personalized Alerts</h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            Receive customized notifications about important developments relevant to your specific interests.
          </p>
        </div>
      </div>
    </div>
  );
}
