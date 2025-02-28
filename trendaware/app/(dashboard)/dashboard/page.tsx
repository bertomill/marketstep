import MorningBriefing from '@/components/dashboard/MorningBriefing';
import TrendCard from '@/components/dashboard/TrendCard';

export const metadata = {
  title: 'Dashboard - TrendAware',
  description: 'Your personalized technology trend insights',
};

export default function DashboardPage() {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="py-4">
          <MorningBriefing />
          
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mt-8 mb-4">
            Top Trends for You
          </h2>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <TrendCard 
              title="AI in Financial Services"
              description="Recent developments in AI are transforming financial services with new capabilities for risk assessment and fraud detection."
              category="Artificial Intelligence"
              relevanceScore={92}
            />
            <TrendCard 
              title="Blockchain for Supply Chain"
              description="Companies are increasingly adopting blockchain technology to improve supply chain transparency and efficiency."
              category="Blockchain"
              relevanceScore={85}
            />
            <TrendCard 
              title="Quantum Computing Advances"
              description="Recent breakthroughs in quantum computing are accelerating the timeline for practical applications in finance."
              category="Quantum Computing"
              relevanceScore={78}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 