import {
  Observer,
  EclipseKind,
  SearchLunarEclipse,
  NextLunarEclipse,
  SearchLocalSolarEclipse,
  NextLocalSolarEclipse,
} from "astronomy-engine";

export type EclipseType = "lunar" | "solar";

export interface EclipseInfo {
  type: EclipseType;
  kind: EclipseKind;
  obscuration: number;
  peak: Date;
  begin: Date;
  end: Date;
  totalBegin?: Date;
  totalEnd?: Date;
  isCurrent: boolean;
}

const DEFAULT_HORIZON_MONTHS = 18;
const DEFAULT_MAX_PER_TYPE = 3;

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

function withinHorizon(date: Date, now: Date, horizonMonths: number): boolean {
  const horizon = new Date(now);
  horizon.setMonth(horizon.getMonth() + horizonMonths);
  return date <= horizon;
}

function getUpcomingLunarEclipses(
  now: Date,
  horizonMonths: number,
  maxResults: number
): EclipseInfo[] {
  const results: EclipseInfo[] = [];
  let eclipse = SearchLunarEclipse(now);

  while (
    results.length < maxResults &&
    withinHorizon(eclipse.peak.date, now, horizonMonths)
  ) {
    const peak = eclipse.peak.date;
    results.push({
      type: "lunar",
      kind: eclipse.kind,
      obscuration: eclipse.obscuration,
      peak,
      begin: addMinutes(peak, -eclipse.sd_penum),
      end: addMinutes(peak, eclipse.sd_penum),
      totalBegin: eclipse.sd_total > 0 ? addMinutes(peak, -eclipse.sd_total) : undefined,
      totalEnd: eclipse.sd_total > 0 ? addMinutes(peak, eclipse.sd_total) : undefined,
      isCurrent:
        now >= addMinutes(peak, -eclipse.sd_penum) &&
        now <= addMinutes(peak, eclipse.sd_penum),
    });
    eclipse = NextLunarEclipse(eclipse.peak);
  }

  return results;
}

function getUpcomingLocalSolarEclipses(
  observer: Observer,
  now: Date,
  horizonMonths: number,
  maxResults: number
): EclipseInfo[] {
  const results: EclipseInfo[] = [];
  let eclipse = SearchLocalSolarEclipse(now, observer);

  while (
    results.length < maxResults &&
    withinHorizon(eclipse.peak.time.date, now, horizonMonths)
  ) {
    const begin = eclipse.partial_begin.time.date;
    const end = eclipse.partial_end.time.date;
    results.push({
      type: "solar",
      kind: eclipse.kind,
      obscuration: eclipse.obscuration,
      peak: eclipse.peak.time.date,
      begin,
      end,
      totalBegin: eclipse.total_begin?.time.date,
      totalEnd: eclipse.total_end?.time.date,
      isCurrent: now >= begin && now <= end,
    });
    eclipse = NextLocalSolarEclipse(eclipse.peak.time, observer);
  }

  return results;
}

export function getUpcomingEclipses(
  observer: Observer,
  now: Date,
  horizonMonths: number = DEFAULT_HORIZON_MONTHS,
  maxPerType: number = DEFAULT_MAX_PER_TYPE
): EclipseInfo[] {
  return [
    ...getUpcomingLunarEclipses(now, horizonMonths, maxPerType),
    ...getUpcomingLocalSolarEclipses(observer, now, horizonMonths, maxPerType),
  ].sort((a, b) => a.peak.getTime() - b.peak.getTime());
}
