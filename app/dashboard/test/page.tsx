import { DocFeed } from "@/components/testing/DocFeed";

export default function TestPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Test Lab</h1>
        <p className="text-muted-foreground">
          Experimental features and testing environment
        </p>
      </div>
      <DocFeed />
    </div>
  );
} 