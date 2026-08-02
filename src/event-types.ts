export type EventCategory = "eclipse" | "meteorShower" | "celestialEvent";

export interface EventRow {
  category: EventCategory;
  name: string;
  date: Date;
  dateEnd?: Date;
  subtitle?: string;
  icon?: string;
}
