'use client'

export function Calendar() {
  // Get current date info
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  // Get days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  
  // Get first day of month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()

  // Create calendar grid
  const days = []
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-32 border-t border-r bg-white" />)
  }

  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
    days.push(
      <div
        key={day}
        className={`h-32 p-2 border-t border-r bg-white hover:bg-zinc-50 transition-colors ${
          isToday ? 'bg-zinc-50 border-zinc-400' : ''
        }`}
      >
        <span className={`text-sm ${isToday ? 'font-bold' : ''}`}>{day}</span>
      </div>
    )
  }

  return (
    <div className="p-6 flex-1">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">
          {new Date(currentYear, currentMonth).toLocaleString('default', {
            month: 'long',
            year: 'numeric'
          })}
        </h2>
      </div>
      <div className="grid grid-cols-7 border-l border-b">
        {weekDays.map(day => (
          <div key={day} className="text-center font-medium text-sm p-2 border-t border-r bg-white">
            {day}
          </div>
        ))}
        {days}
      </div>
    </div>
  )
} 