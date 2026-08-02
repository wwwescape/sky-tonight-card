import { Observer, EclipseKind } from "astronomy-engine";
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
export declare function getUpcomingEclipses(observer: Observer, now: Date, horizonMonths?: number, maxPerType?: number): EclipseInfo[];
