import { Observer } from "astronomy-engine";
interface MonthDay {
    month: number;
    day: number;
}
interface Radiant {
    ra: number;
    dec: number;
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
export declare function getActiveOrUpcomingShowers(now: Date, observer: Observer): MeteorShowerEvent[];
export {};
