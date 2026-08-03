export type EventCategory = "eclipse" | "meteorShower" | "celestialEvent";

export interface EventDataRow {
  label: string;
  value: string;
}

export interface EventRow {
  category: EventCategory;
  name: string;
  date: Date;
  dateEnd?: Date;
  rows: EventDataRow[];
}
