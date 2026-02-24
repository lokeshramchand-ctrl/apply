import { prisma } from "@/lib/prisma";
import { logApplication } from "./actions/logApplication";
import type { ApplicationDay } from "@prisma/client";

function getHeatmapColor(count: number): string {
  if (count === 0) return "#1a1a1a";
  if (count <= 2) return "#25382b";
  if (count <= 4) return "#2f543d";
  if (count <= 6) return "#437d57";
  return "#5cb57a";
}

export default async function ApplyTrack() {
  const data: ApplicationDay[] = await prisma.applicationDay.findMany({
    orderBy: { date: "asc" },
  });

  // ---- Build Fast Lookup Map (O(1) access) ----
  const dataMap = new Map<string, ApplicationDay>();
  data.forEach((entry) => {
    dataMap.set(entry.date.toDateString(), entry);
  });

  // ---- Stats ----
  const totalApplications = data.reduce(
    (sum: number, d: ApplicationDay) => sum + d.count,
    0
  );

  const totalResponses = data.reduce(
    (sum: number, d: ApplicationDay) => sum + d.responses,
    0
  );

  const responseRate =
    totalApplications > 0
      ? ((totalResponses / totalApplications) * 100).toFixed(1)
      : "0";

  const now = new Date();

  const activeDaysThisMonth = data.filter(
    (d: ApplicationDay) =>
      d.date.getMonth() === now.getMonth() &&
      d.date.getFullYear() === now.getFullYear()
  ).length;

  // ---- Correct Streak Logic ----
  let currentStreak = 0;
  let streakDate = new Date();
  streakDate.setHours(0, 0, 0, 0);

  while (true) {
    const key = streakDate.toDateString();
    const entry = dataMap.get(key);

    if (entry && entry.count > 0) {
      currentStreak++;
      streakDate.setDate(streakDate.getDate() - 1);
    } else {
      break;
    }
  }

  // ---- Heatmap (Last 119 Days / 17 Weeks) ----
  const daysToShow = 119;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const heatmapData = Array.from({ length: daysToShow }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (daysToShow - 1 - i));

    const entry = dataMap.get(date.toDateString());

    return {
      id: i,
      count: entry?.count ?? 0,
    };
  });

  return (
    <div className="min-h-screen bg-black text-gray-200 p-10 flex justify-center">
      <div className="w-full max-w-4xl space-y-12">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-semibold">ApplyTrack</h1>
          <p className="text-sm tracking-widest text-gray-500 uppercase">
            Consistency Dashboard
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <StatCard label="Current Streak" value={`${currentStreak} Days`} />
          <StatCard label="Total Applications" value={totalApplications} />
          <StatCard label="Active Days This Month" value={activeDaysThisMonth} />
          <StatCard label="Response Rate" value={`${responseRate}%`} />
        </div>

        {/* Heatmap */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Consistency Map</h2>

          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg overflow-x-auto">
            <div className="grid grid-rows-7 grid-flow-col gap-[3px] w-max">
              {heatmapData.map((day) => (
                <div
                  key={day.id}
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: getHeatmapColor(day.count) }}
                  title={`${day.count} applications`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Log Form */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Log Today's Effort</h2>

          <form
            action={logApplication}
            className="bg-neutral-900 border border-neutral-800 p-6 rounded-lg space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputField name="count" label="Applications Today *" required />
              <InputField name="responses" label="Responses Received" />
              <InputField name="interviews" label="Interviews Scheduled" />
            </div>

            <button
              type="submit"
              className="w-full bg-green-700 hover:bg-green-600 transition px-4 py-3 rounded-md font-medium"
            >
              Save Progress
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

// ---- Components ----

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-lg">
      <div className="text-2xl font-semibold text-white">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}

function InputField({
  name,
  label,
  required = false,
}: {
  name: string;
  label: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </label>
      <input
        name={name}
        type="number"
        min="0"
        required={required}
        className="bg-black border border-neutral-700 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-600"
      />
    </div>
  );
}