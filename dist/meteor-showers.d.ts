interface MonthDay {
    month: number;
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
export declare function getActiveOrUpcomingShowers(now: Date): MeteorShowerEvent[];
export {};
