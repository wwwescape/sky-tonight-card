export type CelestialEventKind = "equinox" | "solstice" | "opposition" | "greatestElongation" | "supermoon";
export interface CelestialEventInfo {
    kind: CelestialEventKind;
    date: Date;
    bodyName?: string;
    visibility?: "morning" | "evening";
    elongationDegrees?: number;
    distanceKm?: number;
}
export declare function getUpcomingCelestialEvents(now: Date, horizonMonths?: number): CelestialEventInfo[];
