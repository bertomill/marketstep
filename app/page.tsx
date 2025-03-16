import { Sidebar } from './components/Sidebar'

export default function Home() {
  return (
    <main className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Welcome to MarketStep</h1>
          <p className="text-lg text-gray-600">Your financial market companion</p>
        </div>
      </div>
    </main>
  )
}
