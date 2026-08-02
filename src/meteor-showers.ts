interface MonthDay {
  month: number; // 1-12
  day: number;
}

export interface MeteorShowerDefinition {
  name: string;
  activeStart: MonthDay;
  activeEnd: MonthDay;
  peak: MonthDay;
  zhr: number;
}

export interface MeteorShowerEvent {
  name: string;
  peak: Date;
  zhr: number;
  isActive: boolean;
}

const UPCOMING_WINDOW_DAYS = 60;

// Approximate active windows, peak dates, and zenith hourly rates (ZHR) for
// the major annual showers, per commonly published figures (e.g. IMO
// calendar). Peak dates drift by a day or two year to year; this table is a
// static lookup, not a computation, and will need occasional updates.
const METEOR_SHOWERS: MeteorShowerDefinition[] = [
  {
    name: "Quadrantids",
    activeStart: { month: 12, day: 28 },
    activeEnd: { month: 1, day: 12 },
    peak: { month: 1, day: 3 },
    zhr: 120,
  },
  {
    name: "Lyrids",
    activeStart: { month: 4, day: 16 },
    activeEnd: { month: 4, day: 25 },
    peak: { month: 4, day: 22 },
    zhr: 18,
  },
  {
    name: "Eta Aquariids",
    activeStart: { month: 4, day: 19 },
    activeEnd: { month: 5, day: 28 },
    peak: { month: 5, day: 5 },
    zhr: 50,
  },
  {
    name: "Alpha Capricornids",
    activeStart: { month: 7, day: 3 },
    activeEnd: { month: 8, day: 15 },
    peak: { month: 7, day: 30 },
    zhr: 5,
  },
  {
    name: "Southern Delta Aquariids",
    activeStart: { month: 7, day: 12 },
    activeEnd: { month: 8, day: 23 },
    peak: { month: 7, day: 30 },
    zhr: 25,
  },
  {
    name: "Perseids",
    activeStart: { month: 7, day: 17 },
    activeEnd: { month: 8, day: 24 },
    peak: { month: 8, day: 12 },
    zhr: 100,
  },
  {
    name: "Draconids",
    activeStart: { month: 10, day: 6 },
    activeEnd: { month: 10, day: 10 },
    peak: { month: 10, day: 8 },
    zhr: 10,
  },
  {
    name: "Southern Taurids",
    activeStart: { month: 9, day: 10 },
    activeEnd: { month: 11, day: 20 },
    peak: { month: 11, day: 5 },
    zhr: 5,
  },
  {
    name: "Orionids",
    activeStart: { month: 10, day: 2 },
    activeEnd: { month: 11, day: 7 },
    peak: { month: 10, day: 21 },
    zhr: 20,
  },
  {
    name: "Northern Taurids",
    activeStart: { month: 10, day: 20 },
    activeEnd: { month: 12, day: 10 },
    peak: { month: 11, day: 12 },
    zhr: 5,
  },
  {
    name: "Leonids",
    activeStart: { month: 11, day: 6 },
    activeEnd: { month: 11, day: 30 },
    peak: { month: 11, day: 17 },
    zhr: 15,
  },
  {
    name: "Geminids",
    activeStart: { month: 12, day: 4 },
    activeEnd: { month: 12, day: 17 },
    peak: { month: 12, day: 14 },
    zhr: 150,
  },
  {
    name: "Ursids",
    activeStart: { month: 12, day: 17 },
    activeEnd: { month: 12, day: 26 },
    peak: { month: 12, day: 22 },
    zhr: 10,
  },
];

// Ordering key only (not a true day-of-year), sufficient to compare two
// month/day pairs within a calendar year since day is always <= 31.
function monthDayOrder(md: MonthDay): number {
  return md.month * 31 + md.day;
}

function resolveDate(md: MonthDay, year: number): Date {
  return new Date(year, md.month - 1, md.day);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function cycleDates(
  shower: MeteorShowerDefinition,
  cycleStartYear: number
): { start: Date; end: Date; peak: Date } {
  const startOrder = monthDayOrder(shower.activeStart);
  const endWraps = monthDayOrder(shower.activeEnd) < startOrder;
  const peakWraps = monthDayOrder(shower.peak) < startOrder;

  return {
    start: resolveDate(shower.activeStart, cycleStartYear),
    end: resolveDate(shower.activeEnd, endWraps ? cycleStartYear + 1 : cycleStartYear),
    peak: resolveDate(shower.peak, peakWraps ? cycleStartYear + 1 : cycleStartYear),
  };
}

function getShowerEvent(
  shower: MeteorShowerDefinition,
  now: Date
): MeteorShowerEvent | null {
  // Check the surrounding three cycles so showers whose active window
  // wraps across the calendar year boundary (e.g. Quadrantids) resolve
  // correctly regardless of which side of the boundary "now" falls on.
  const cycles = [
    now.getFullYear() - 1,
    now.getFullYear(),
    now.getFullYear() + 1,
  ].map((year) => cycleDates(shower, year));

  const activeCycle = cycles.find(
    (cycle) => now >= cycle.start && now < addDays(cycle.end, 1)
  );
  if (activeCycle) {
    return {
      name: shower.name,
      peak: activeCycle.peak,
      zhr: shower.zhr,
      isActive: true,
    };
  }

  const nextPeak = cycles
    .map((cycle) => cycle.peak)
    .filter((peak) => peak >= now)
    .sort((a, b) => a.getTime() - b.getTime())[0];

  if (
    nextPeak &&
    nextPeak.getTime() - now.getTime() <= UPCOMING_WINDOW_DAYS * 86400000
  ) {
    return { name: shower.name, peak: nextPeak, zhr: shower.zhr, isActive: false };
  }

  return null;
}

export function getActiveOrUpcomingShowers(now: Date): MeteorShowerEvent[] {
  return METEOR_SHOWERS.map((shower) => getShowerEvent(shower, now))
    .filter((event): event is MeteorShowerEvent => event !== null)
    .sort((a, b) => a.peak.getTime() - b.peak.getTime());
}
