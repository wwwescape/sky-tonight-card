import {
  Body,
  FlexibleDateTime,
  GeoVector,
  KM_PER_AU,
  Seasons,
  SearchMaxElongation,
  SearchMoonPhase,
  SearchRelativeLongitude,
} from "astronomy-engine";

export type CelestialEventKind =
  | "equinox"
  | "solstice"
  | "opposition"
  | "greatestElongation"
  | "supermoon";

export interface CelestialEventInfo {
  kind: CelestialEventKind;
  date: Date;
  bodyName?: string;
  visibility?: "morning" | "evening";
  elongationDegrees?: number;
  distanceKm?: number;
}

const DEFAULT_HORIZON_MONTHS = 18;
const SUPERMOON_DISTANCE_KM = 360000;
const MAX_SUPERMOON_RESULTS = 3;
const OPPOSITION_BODIES: Body[] = [
  Body.Mars,
  Body.Jupiter,
  Body.Saturn,
  Body.Uranus,
  Body.Neptune,
];
const ELONGATION_BODIES: Body[] = [Body.Mercury, Body.Venus];

function withinHorizon(date: Date, now: Date, horizonMonths: number): boolean {
  const horizon = new Date(now);
  horizon.setMonth(horizon.getMonth() + horizonMonths);
  return date <= horizon;
}

function getUpcomingEquinoxesAndSolstices(
  now: Date,
  horizonMonths: number
): CelestialEventInfo[] {
  const events: CelestialEventInfo[] = [];
  for (const year of [now.getFullYear(), now.getFullYear() + 1]) {
    const seasons = Seasons(year);
    events.push(
      { kind: "equinox", date: seasons.mar_equinox.date },
      { kind: "solstice", date: seasons.jun_solstice.date },
      { kind: "equinox", date: seasons.sep_equinox.date },
      { kind: "solstice", date: seasons.dec_solstice.date }
    );
  }
  return events
    .filter(
      (event) => event.date > now && withinHorizon(event.date, now, horizonMonths)
    )
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

function getUpcomingOppositions(
  now: Date,
  horizonMonths: number
): CelestialEventInfo[] {
  const events: CelestialEventInfo[] = [];
  for (const body of OPPOSITION_BODIES) {
    const time = SearchRelativeLongitude(body, 0, now);
    if (withinHorizon(time.date, now, horizonMonths)) {
      events.push({ kind: "opposition", date: time.date, bodyName: body });
    }
  }
  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

function getUpcomingGreatestElongations(
  now: Date,
  horizonMonths: number
): CelestialEventInfo[] {
  const events: CelestialEventInfo[] = [];
  for (const body of ELONGATION_BODIES) {
    const elongation = SearchMaxElongation(body, now);
    if (withinHorizon(elongation.time.date, now, horizonMonths)) {
      events.push({
        kind: "greatestElongation",
        date: elongation.time.date,
        bodyName: body,
        visibility: elongation.visibility as "morning" | "evening",
        elongationDegrees: elongation.elongation,
      });
    }
  }
  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

function getUpcomingSupermoons(
  now: Date,
  horizonMonths: number,
  maxResults: number
): CelestialEventInfo[] {
  const events: CelestialEventInfo[] = [];
  let cursor: FlexibleDateTime = now;
  const maxFullMoonSearches = 24;

  for (
    let i = 0;
    i < maxFullMoonSearches && events.length < maxResults;
    i++
  ) {
    const fullMoon = SearchMoonPhase(180, cursor, 40);
    if (!fullMoon || !withinHorizon(fullMoon.date, now, horizonMonths)) break;

    const distanceKm = GeoVector(Body.Moon, fullMoon, true).Length() * KM_PER_AU;
    if (distanceKm < SUPERMOON_DISTANCE_KM) {
      events.push({ kind: "supermoon", date: fullMoon.date, distanceKm });
    }
    cursor = fullMoon.AddDays(1);
  }

  return events;
}

export function getUpcomingCelestialEvents(
  now: Date,
  horizonMonths: number = DEFAULT_HORIZON_MONTHS
): CelestialEventInfo[] {
  return [
    ...getUpcomingEquinoxesAndSolstices(now, horizonMonths),
    ...getUpcomingOppositions(now, horizonMonths),
    ...getUpcomingGreatestElongations(now, horizonMonths),
    ...getUpcomingSupermoons(now, horizonMonths, MAX_SUPERMOON_RESULTS),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());
}
