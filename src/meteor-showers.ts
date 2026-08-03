import { Body, DefineStar, Equator, Horizon, Observer, SiderealTime } from "astronomy-engine";

interface MonthDay {
  month: number; // 1-12
  day: number;
}

// Approximate radiant position (J2000 equatorial), sufficient to estimate
// whether the radiant clears the horizon from a given location - not precise
// enough for anything beyond that.
interface Radiant {
  ra: number; // sidereal hours, [0, 24)
  dec: number; // degrees
}

export interface MeteorShowerDefinition {
  name: string;
  activeStart: MonthDay;
  activeEnd: MonthDay;
  peak: MonthDay;
  zhr: number;
  radiant: Radiant;
}

export interface MeteorShowerEvent {
  name: string;
  peak: Date;
  zhr: number;
  isActive: boolean;
  peakLocalTime: Date;
  radiantAltitude: number;
  isRadiantVisible: boolean;
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
    radiant: { ra: 15.33, dec: 49.5 },
  },
  {
    name: "Lyrids",
    activeStart: { month: 4, day: 16 },
    activeEnd: { month: 4, day: 25 },
    peak: { month: 4, day: 22 },
    zhr: 18,
    radiant: { ra: 18.17, dec: 33.3 },
  },
  {
    name: "Eta Aquariids",
    activeStart: { month: 4, day: 19 },
    activeEnd: { month: 5, day: 28 },
    peak: { month: 5, day: 5 },
    zhr: 50,
    radiant: { ra: 22.5, dec: -1.0 },
  },
  {
    name: "Alpha Capricornids",
    activeStart: { month: 7, day: 3 },
    activeEnd: { month: 8, day: 15 },
    peak: { month: 7, day: 30 },
    zhr: 5,
    radiant: { ra: 20.47, dec: -10.0 },
  },
  {
    name: "Southern Delta Aquariids",
    activeStart: { month: 7, day: 12 },
    activeEnd: { month: 8, day: 23 },
    peak: { month: 7, day: 30 },
    zhr: 25,
    radiant: { ra: 22.6, dec: -16.0 },
  },
  {
    name: "Perseids",
    activeStart: { month: 7, day: 17 },
    activeEnd: { month: 8, day: 24 },
    peak: { month: 8, day: 12 },
    zhr: 100,
    radiant: { ra: 3.22, dec: 58.0 },
  },
  {
    name: "Draconids",
    activeStart: { month: 10, day: 6 },
    activeEnd: { month: 10, day: 10 },
    peak: { month: 10, day: 8 },
    zhr: 10,
    radiant: { ra: 17.47, dec: 54.0 },
  },
  {
    name: "Southern Taurids",
    activeStart: { month: 9, day: 10 },
    activeEnd: { month: 11, day: 20 },
    peak: { month: 11, day: 5 },
    zhr: 5,
    radiant: { ra: 3.53, dec: 13.0 },
  },
  {
    name: "Orionids",
    activeStart: { month: 10, day: 2 },
    activeEnd: { month: 11, day: 7 },
    peak: { month: 10, day: 21 },
    zhr: 20,
    radiant: { ra: 6.35, dec: 16.0 },
  },
  {
    name: "Northern Taurids",
    activeStart: { month: 10, day: 20 },
    activeEnd: { month: 12, day: 10 },
    peak: { month: 11, day: 12 },
    zhr: 5,
    radiant: { ra: 3.87, dec: 22.0 },
  },
  {
    name: "Leonids",
    activeStart: { month: 11, day: 6 },
    activeEnd: { month: 11, day: 30 },
    peak: { month: 11, day: 17 },
    zhr: 15,
    radiant: { ra: 10.28, dec: 22.0 },
  },
  {
    name: "Geminids",
    activeStart: { month: 12, day: 4 },
    activeEnd: { month: 12, day: 17 },
    peak: { month: 12, day: 14 },
    zhr: 150,
    radiant: { ra: 7.55, dec: 32.5 },
  },
  {
    name: "Ursids",
    activeStart: { month: 12, day: 17 },
    activeEnd: { month: 12, day: 26 },
    peak: { month: 12, day: 22 },
    zhr: 10,
    radiant: { ra: 14.47, dec: 75.8 },
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

// Sidereal days are slightly shorter than solar days, so an hour of hour
// angle corresponds to slightly more than an hour of solar time.
const SIDEREAL_TO_SOLAR_RATE = 1.0027379093;

function normalizeHourAngle(hours: number): number {
  let h = hours % 24;
  if (h < -12) h += 24;
  if (h > 12) h -= 24;
  return h;
}

// Estimates when the radiant reaches its highest point (upper culmination)
// nearest to referenceDate for the given observer, and its altitude then -
// the best-case viewing moment and the ceiling on how high above the
// horizon the radiant will ever get that night.
function computeRadiantTransit(
  radiant: Radiant,
  observer: Observer,
  referenceDate: Date
): { time: Date; altitude: number } {
  DefineStar(Body.Star1, radiant.ra, radiant.dec, 1000);
  let time = referenceDate;
  for (let i = 0; i < 3; i++) {
    const equ = Equator(Body.Star1, time, observer, true, true);
    const localSiderealHours = SiderealTime(time) + observer.longitude / 15;
    const hourAngle = normalizeHourAngle(localSiderealHours - equ.ra);
    const solarHoursToTransit = -hourAngle / SIDEREAL_TO_SOLAR_RATE;
    time = new Date(time.getTime() + solarHoursToTransit * 3600000);
  }
  const finalEqu = Equator(Body.Star1, time, observer, true, true);
  const altitude = Horizon(time, observer, finalEqu.ra, finalEqu.dec, "normal")
    .altitude;
  return { time, altitude };
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

function buildShowerEvent(
  shower: MeteorShowerDefinition,
  peak: Date,
  isActive: boolean,
  observer: Observer
): MeteorShowerEvent {
  const transit = computeRadiantTransit(shower.radiant, observer, peak);
  return {
    name: shower.name,
    peak,
    zhr: shower.zhr,
    isActive,
    peakLocalTime: transit.time,
    radiantAltitude: transit.altitude,
    isRadiantVisible: transit.altitude > 0,
  };
}

function getShowerEvent(
  shower: MeteorShowerDefinition,
  now: Date,
  observer: Observer
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
    return buildShowerEvent(shower, activeCycle.peak, true, observer);
  }

  const nextPeak = cycles
    .map((cycle) => cycle.peak)
    .filter((peak) => peak >= now)
    .sort((a, b) => a.getTime() - b.getTime())[0];

  if (
    nextPeak &&
    nextPeak.getTime() - now.getTime() <= UPCOMING_WINDOW_DAYS * 86400000
  ) {
    return buildShowerEvent(shower, nextPeak, false, observer);
  }

  return null;
}

export function getActiveOrUpcomingShowers(
  now: Date,
  observer: Observer
): MeteorShowerEvent[] {
  return METEOR_SHOWERS.map((shower) => getShowerEvent(shower, now, observer))
    .filter((event): event is MeteorShowerEvent => event !== null)
    .sort((a, b) => a.peak.getTime() - b.peak.getTime());
}
