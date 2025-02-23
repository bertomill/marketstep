'use client';

export function Calendar() {
  // Helper function to format dates
  const formatDate = (date: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return {
      month: months[date.getMonth()],
      day: date.getDate(),
      weekday: days[date.getDay()]
    };
  };

  const dateCards = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    return {
      date,
      isToday: i === 0
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Calendar</h2>
        <p className="text-sm text-muted-foreground">
          Upcoming events
        </p>
      </div>
      
      <div className="flex overflow-x-auto pb-4 -mx-4 px-4 gap-3 snap-x">
        {dateCards.map(({ date, isToday }) => {
          const { month, day, weekday } = formatDate(date);
          return (
            <div
              key={date.toISOString()}
              className={`flex-none w-[120px] rounded-lg border ${
                isToday ? 'bg-white' : 'bg-gray-50'
              } p-3 space-y-2 snap-start`}
            >
              <div className="text-center">
                <div className="text-sm font-medium">
                  {isToday ? 'Today' : `${month} ${day}`}
                </div>
                <div className="text-xs text-muted-foreground">
                  {weekday}
                </div>
              </div>

              <div className="h-6 flex items-center justify-center">
                <span className="text-xs text-gray-400">No events</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 