import { Sidebar } from './components/Sidebar'
import { Calendar } from './components/Calendar'

export default function Home() {
  return (
    <main className="flex min-h-screen">
      <Sidebar />
      <Calendar />
    </main>
  )
}
