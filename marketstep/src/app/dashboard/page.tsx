import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 lg:p-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your dashboard. Here you can track innovative activity in your market.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle>Analytics</CardTitle>
            <CardDescription>Your analytics overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last month
            </p>
            <div className="mt-4 h-[80px] w-full bg-zinc-100 dark:bg-zinc-800 rounded-md flex items-center justify-center text-muted-foreground">
              Analytics Chart
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
                    {i}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Activity {i}</p>
                    <p className="text-xs text-muted-foreground">
                      Completed {i} hour{i > 1 ? "s" : ""} ago
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full justify-start bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
                Create New Project
              </Button>
              <Button className="w-full justify-start" variant="outline">
                View Reports
              </Button>
              <Link href="/profile" className="w-full">
                <Button className="w-full justify-start" variant="outline">
                  Update Profile
                </Button>
              </Link>
              <Button className="w-full justify-start" variant="outline">
                Manage Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6">
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>
              Your most recent projects and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800">
                    <th className="text-left font-medium p-4 pl-0">Name</th>
                    <th className="text-left font-medium p-4">Status</th>
                    <th className="text-left font-medium p-4">Date</th>
                    <th className="text-right font-medium p-4 pr-0">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4].map((i) => (
                    <tr key={i} className="border-b border-zinc-200 dark:border-zinc-800 last:border-0">
                      <td className="p-4 pl-0">Project {i}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          Active
                        </span>
                      </td>
                      <td className="p-4">2023-0{i}-01</td>
                      <td className="p-4 pr-0 text-right">
                        <Button variant="ghost" size="sm" className="hover:bg-zinc-100 dark:hover:bg-zinc-800">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 