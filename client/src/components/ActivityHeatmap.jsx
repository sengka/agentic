export default function ActivityHeatmap({ reports, isDark, onDayClick }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const NUM_WEEKS = 13; // ~91 gün
  const totalDays = NUM_WEEKS * 7;

  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (totalDays - 1));
  while (startDate.getDay() !== 0) {
    startDate.setDate(startDate.getDate() - 1);
  }

  const dayCounts = {};
  reports.forEach((r) => {
    const d = new Date(r.createdAt);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().split('T')[0];
    dayCounts[key] = (dayCounts[key] || 0) + 1;
  });

  const weeks = [];
  let current = new Date(startDate);
  while (current <= today) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      const key = current.toISOString().split('T')[0];
      week.push({
        date: new Date(current),
        count: dayCounts[key] || 0,
        isFuture: current > today,
      });
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }

  const getColor = (count, isFuture) => {
    if (isFuture) return 'transparent';
    if (count === 0) return isDark ? '#1f2937' : '#f3f4f6';
    if (count <= 2) return isDark ? '#3730a3' : '#c7d2fe';
    if (count <= 5) return isDark ? '#4f46e5' : '#818cf8';
    return isDark ? '#818cf8' : '#4f46e5';
  };

  return (
    <div className={`${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} rounded-2xl p-5 border mb-8 overflow-x-auto`}>
      <p className={`${isDark ? "text-gray-400" : "text-gray-500"} text-sm mb-3 font-semibold`}>📅 Aktivite Takvimi</p>
      <div className="inline-flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) => (
<div
                key={di}
                onClick={() => day.count > 0 && onDayClick && onDayClick(day.date)}
                title={`${day.date.toLocaleDateString('tr-TR')}: ${day.count} rapor`}
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: getColor(day.count, day.isFuture),
                  borderRadius: 2,
                  cursor: day.count > 0 ? 'pointer' : 'default',
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs">
        <span className={isDark ? "text-gray-500" : "text-gray-400"}>Az</span>
        <div style={{ width: 12, height: 12, backgroundColor: getColor(0, false), borderRadius: 2 }} />
        <div style={{ width: 12, height: 12, backgroundColor: getColor(1, false), borderRadius: 2 }} />
        <div style={{ width: 12, height: 12, backgroundColor: getColor(3, false), borderRadius: 2 }} />
        <div style={{ width: 12, height: 12, backgroundColor: getColor(6, false), borderRadius: 2 }} />
        <span className={isDark ? "text-gray-500" : "text-gray-400"}>Çok</span>
      </div>
    </div>
  );
}