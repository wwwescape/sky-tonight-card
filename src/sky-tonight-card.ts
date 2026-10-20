import { LitElement, html, css, TemplateResult, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ref, createRef, Ref } from "lit/directives/ref.js";
import {
  Observer,
  SearchRiseSet,
  MoonPhase,
  Body,
  Equator,
  Horizon,
} from "astronomy-engine";
import { DateTime } from "luxon";
import { translations, TranslationKey, LanguageCode } from "./translations";
import { EventCategory, EventDataRow, EventRow } from "./event-types";
import { EclipseInfo, getUpcomingEclipses } from "./eclipses";
import {
  CelestialEventInfo,
  getUpcomingCelestialEvents,
} from "./celestial-events";
import {
  MeteorShowerEvent,
  getActiveOrUpcomingShowers,
} from "./meteor-showers";
import "./sky-tonight-card-editor";

type TabId = "solarSystem" | EventCategory;

const MAX_ROWS_PER_TAB = 10;

const TAB_ORDER: TabId[] = [
  "solarSystem",
  "eclipse",
  "celestialEvent",
  "meteorShower",
];

const TAB_ICON_FILE: Record<TabId, string> = {
  solarSystem: "solar-system",
  eclipse: "eclipses",
  celestialEvent: "celestial-events",
  meteorShower: "meteor-showers",
};

type CelestialObjectInfo = {
  body: Body;
  name: string;
  type: string;
  isNakedEye: boolean;
  isBinocular: boolean;
};

interface CelestialObjectDisplay extends CelestialObjectInfo {
  rise: DateTime;
  set: DateTime;
  riseStr: string;
  setStr: string;
  duration: string;
  altitude: number;
}

const CelestialObjects: CelestialObjectInfo[] = [
  {
    body: Body.Sun,
    name: "Sun",
    type: "Star",
    isNakedEye: true,
    isBinocular: true,
  },
  {
    body: Body.Moon,
    name: "Moon",
    type: "Moon",
    isNakedEye: true,
    isBinocular: true,
  },
  {
    body: Body.Mercury,
    name: "Mercury",
    type: "Planet",
    isNakedEye: true,
    isBinocular: true,
  },
  {
    body: Body.Venus,
    name: "Venus",
    type: "Planet",
    isNakedEye: true,
    isBinocular: true,
  },
  {
    body: Body.Mars,
    name: "Mars",
    type: "Planet",
    isNakedEye: true,
    isBinocular: true,
  },
  {
    body: Body.Jupiter,
    name: "Jupiter",
    type: "Planet",
    isNakedEye: true,
    isBinocular: true,
  },
  {
    body: Body.Saturn,
    name: "Saturn",
    type: "Planet",
    isNakedEye: true,
    isBinocular: true,
  },
  {
    body: Body.Uranus,
    name: "Uranus",
    type: "Planet",
    isNakedEye: false,
    isBinocular: true,
  },
  {
    body: Body.Neptune,
    name: "Neptune",
    type: "Planet",
    isNakedEye: false,
    isBinocular: true,
  },
];

@customElement("sky-tonight-card")
export class SkyTonightNativeCard extends LitElement {
  @property({ attribute: false }) public hass: any;
  @property({ type: Object }) private config: any = {
    showSun: true,
    showBelowHorizon: false,
  };
  @state() private languageOverride?: LanguageCode;
  @state() private activeTab: TabId = "solarSystem";
  @state() private canScrollTabsLeft = false;
  @state() private canScrollTabsRight = false;
  private tabBarRef: Ref<HTMLDivElement> = createRef();
  private lastMaxTabRowCount = 0;
  private readonly tabWheelListener = {
    handleEvent: (e: WheelEvent) => this.handleTabWheel(e),
    passive: false,
  };

  static get styles() {
    return css`
      ha-card {
        padding: 16px;
        background-color: var(--card-background-color, #1b2431);
        color: var(--card-text-color, #ffffff);
        font-family: "Segoe UI", sans-serif;
        border-radius: 12px;
      }

      h2 {
        margin: 0 0 10px;
        font-size: 1.4rem;
        color: var(--card-text-color, #ffffff);
      }

      .astro-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 12px;
      }

      .astro-card {
        display: flex;
        align-items: center;
        background-color: var(--object-background-color, #223044);
        padding: 10px;
        border-radius: 10px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      }

      .astro-card img {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        object-fit: cover;
        margin-right: 12px;
      }

      .astro-info {
        flex: 1;
      }

      .astro-type {
        font-size: 0.75rem;
        color: var(--object-type-color, #aaaaaa);
      }

      .astro-name {
        font-weight: 600;
        font-size: 1.1rem;
        margin: 2px 0;
        color: var(--object-name-color, #ffffff);
      }

      .astro-data {
        font-size: 0.85rem;
        color: var(--object-data-color, #cccccc);
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .astro-data img {
        width: 16px;
        height: 16px;
        margin: 0;
      }

      .astro-icons {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .astro-icons img {
        width: 20px;
        height: 20px;
      }

      .location-info {
        margin-bottom: 12px;
        font-size: 0.9rem;
        color: var(--object-data-color, #cccccc);
      }

      .location-info div {
        margin: 4px 0;
      }

      .tab-bar-wrapper {
        display: flex;
        align-items: center;
        margin-top: 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .tab-bar {
        display: flex;
        gap: 4px;
        flex: 1;
        min-width: 0;
        overflow-x: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }

      .tab-bar::-webkit-scrollbar {
        display: none;
      }

      .tab-scroll-button {
        flex-shrink: 0;
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px 6px;
        font-size: 1.2rem;
        line-height: 1;
        color: var(--object-type-color, #aaaaaa);
        visibility: hidden;
      }

      .tab-scroll-button.visible {
        visibility: visible;
      }

      .tab-scroll-button:hover {
        color: var(--card-text-color, #ffffff);
      }

      .tab-button {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 12px;
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        cursor: pointer;
        font-family: inherit;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--object-type-color, #aaaaaa);
        white-space: nowrap;
      }

      .tab-button img {
        width: 18px;
        height: 18px;
      }

      .tab-button.active {
        color: var(--card-text-color, #ffffff);
        border-bottom-color: var(--object-name-color, #ffffff);
      }

      .tab-panel {
        margin-top: 12px;
      }

      .event-row {
        justify-content: flex-start;
        gap: 6px;
      }

      .event-row-label {
        color: var(--object-type-color, #aaaaaa);
      }

      .event-empty {
        font-size: 0.85rem;
        color: var(--object-data-color, #cccccc);
        padding: 8px 0;
      }

      .icon-credit {
        margin-top: 16px;
        font-size: 0.7rem;
        text-align: center;
        color: var(--object-type-color, #aaaaaa);
      }

      .icon-credit a {
        color: inherit;
        text-decoration: underline;
      }

      .icon-credit a:hover {
        color: var(--card-text-color, #ffffff);
      }
    `;
  }

  private _translate(key: TranslationKey): string {
    const lang = (this.languageOverride ||
      this.hass?.language ||
      "en") as LanguageCode;
    const [category, subKey] = key.split(".") as [
      keyof typeof translations.en,
      string
    ];

    // Type-safe lookup
    const translationCategory = translations[lang]?.[category] as Record<
      string,
      string
    >;
    const englishCategory = translations.en[category] as Record<string, string>;

    return translationCategory?.[subKey] || englishCategory?.[subKey] || key;
  }

  setConfig(config: any): void {
    this.config = {
      ...this.config,
      ...config,
      colors: {
        ...this.config.colors,
        ...config.colors,
      },
    };
    this.languageOverride = config.languageOverride;
  }

  static getConfigElement() {
    return document.createElement("sky-tonight-card-editor");
  }

  private getLocale(): string {
    return this.languageOverride || this.hass?.locale?.language || "en-US";
  }

  protected render(): TemplateResult {
    if (!this.hass || !this.config) return html``;

    const cardTitle = this.config.cardTitle || this._translate("card.title");
    // Older README versions documented latitude/longitude/elevation, so those
    // keys are still accepted as fallbacks for lat/lon/elev.
    const latitude =
      this.config.lat ?? this.config.latitude ?? this.hass.config.latitude;
    const longitude =
      this.config.lon ?? this.config.longitude ?? this.hass.config.longitude;
    const elevation = this.config.elev ?? this.config.elevation ?? 0;
    const showSun = this.config.showSun !== false;
    const showBelowHorizon = this.config.showBelowHorizon === true;
    const showConfiguration = this.config.showConfiguration === true;
    const showEclipses = this.config.showEclipses !== false;
    const showCelestialEvents = this.config.showCelestialEvents !== false;
    const showMeteorShowers = this.config.showMeteorShowers !== false;

    const now = DateTime.local();
    const observer = new Observer(latitude, longitude, elevation);

    const celestialObjectsWithTimes = CelestialObjects.filter(
      (obj) => showSun || obj.body !== Body.Sun
    )
      .map((obj) => {
        const { rise, set } = this.getRiseSet(observer, obj.body, now);
        if (!rise || !set) return null;

        const altitude = this.getAltitude(
          obj.body,
          now.toJSDate(),
          latitude,
          longitude,
          elevation
        );

        const locale = this.getLocale();

        return {
          ...obj,
          rise,
          set,
          riseStr: rise.toFormat("MMM dd HH:mm", { locale }),
          setStr: set.toFormat("MMM dd HH:mm", { locale }),
          duration: this.calculateDuration(rise, set),
          altitude,
        };
      })
      .filter((obj): obj is Exclude<typeof obj, null> => {
        if (!obj) return false;
        if (!showBelowHorizon && obj.altitude < 0) return false;
        return true;
      })
      .sort((a, b) => a.rise.toMillis() - b.rise.toMillis());

    const moonPhase = this.getMoonPhase(now.toJSDate());

    const upcomingEvents = this.getUpcomingEvents(observer, now, {
      showEclipses,
      showCelestialEvents,
      showMeteorShowers,
    });
    const eventsByCategory = this.groupEventsByCategory(upcomingEvents);
    this.lastMaxTabRowCount = Math.max(
      Math.min(celestialObjectsWithTimes.length, MAX_ROWS_PER_TAB),
      ...Array.from(eventsByCategory.values()).map((events) =>
        Math.min(events.length, MAX_ROWS_PER_TAB)
      ),
      0
    );

    const style = html`
      <style>
        :host {
          --card-background-color: ${this.config.colors?.cardBackground ||
          "#1b2431"};
          --card-text-color: ${this.config.colors?.cardTitle || "#ffffff"};
          --object-background-color: ${this.config.colors?.objectBackground ||
          "#223044"};
          --object-name-color: ${this.config.colors?.objectName || "#ffffff"};
          --object-data-color: ${this.config.colors?.objectData || "#cccccc"};
          --object-type-color: ${this.config.colors?.objectType || "#aaaaaa"};
        }
      </style>
    `;

    return html`
      ${style}
      <ha-card>
        <h2>${cardTitle}</h2>
        ${showConfiguration !== false
          ? html`
              <div>
                <div>
                  <strong>${this._translate("card.latitude")}:</strong>
                  ${latitude.toFixed(2)}
                </div>
                <div>
                  <strong>${this._translate("card.longitude")}:</strong>
                  ${longitude.toFixed(2)}
                </div>
                <div>
                  <strong>${this._translate("card.elevation")}:</strong>
                  ${elevation}m
                </div>
              </div>
            `
          : ""}
        ${this.renderTabBar({
          showEclipses,
          showCelestialEvents,
          showMeteorShowers,
        })}
        ${this.renderActiveTabPanel(
          { showEclipses, showCelestialEvents, showMeteorShowers },
          celestialObjectsWithTimes,
          moonPhase,
          eventsByCategory
        )}
        ${this.renderIconCredit()}
      </ha-card>
    `;
  }

  private getUpcomingEvents(
    observer: Observer,
    now: DateTime,
    flags: {
      showEclipses: boolean;
      showCelestialEvents: boolean;
      showMeteorShowers: boolean;
    }
  ): EventRow[] {
    const events: EventRow[] = [];
    if (flags.showEclipses) {
      events.push(...this.getEclipseEventRows(observer, now));
    }
    if (flags.showCelestialEvents) {
      events.push(...this.getCelestialEventRows(now, observer.latitude));
    }
    if (flags.showMeteorShowers) {
      events.push(...this.getMeteorShowerEventRows(now, observer));
    }
    return events;
  }

  private getEclipseEventRows(observer: Observer, now: DateTime): EventRow[] {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const locale = this.getLocale();
    const eclipses = getUpcomingEclipses(observer, now.toJSDate());

    return eclipses.map((eclipse) => this.buildEclipseRow(eclipse, timeZone, locale));
  }

  private buildEclipseRow(
    eclipse: EclipseInfo,
    timeZone: string,
    locale: string
  ): EventRow {
    const typeKey: TranslationKey =
      eclipse.type === "lunar" ? "eclipseTypes.lunar" : "eclipseTypes.solar";
    const kindKey = `eclipseKinds.${eclipse.kind}` as TranslationKey;
    const name = `${eclipse.isCurrent ? `${this._translate("card.eclipseCurrent")} — ` : ""}${this._translate(
      typeKey
    )} — ${this._translate(kindKey)}`;

    const begin = DateTime.fromJSDate(eclipse.begin).setZone(timeZone);
    const end = DateTime.fromJSDate(eclipse.end).setZone(timeZone);

    const rows: EventDataRow[] = [
      {
        label: this._translate("card.visible"),
        value: `${begin.toFormat("HH:mm", { locale })} – ${end.toFormat(
          "HH:mm",
          { locale }
        )}`,
      },
      {
        label: this._translate("card.duration"),
        value: this.calculateDuration(begin, end),
      },
      {
        label: this._translate("card.eclipseObscuration"),
        value: `${(eclipse.obscuration * 100).toFixed(0)}%`,
      },
      {
        label: this._translate("card.eclipsePeak"),
        value: DateTime.fromJSDate(eclipse.peak)
          .setZone(timeZone)
          .toFormat("MMM dd HH:mm", { locale }),
      },
    ];

    return {
      category: "eclipse",
      name,
      rows,
    };
  }

  private getCelestialEventRows(now: DateTime, latitude: number): EventRow[] {
    const locale = this.getLocale();
    const events = getUpcomingCelestialEvents(now.toJSDate());

    return events.map((event) =>
      this.buildCelestialEventRow(event, locale, latitude)
    );
  }

  private buildCelestialEventRow(
    event: CelestialEventInfo,
    locale: string,
    latitude: number
  ): EventRow {
    const bodyLabel = event.bodyName
      ? this._translate(`objects.${event.bodyName}` as TranslationKey)
      : undefined;

    let name: string;
    const rows: EventDataRow[] = [];

    switch (event.kind) {
      case "equinox":
        name = this._translate(`events.${event.kind}`);
        rows.push({
          label: this._translate("card.dayLength"),
          value: this._translate("card.equalDayNight"),
        });
        break;
      case "solstice": {
        name = this._translate(`events.${event.kind}`);
        const isJuneSolstice = event.date.getMonth() + 1 === 6;
        const isLongestDay = isJuneSolstice === latitude >= 0;
        rows.push({
          label: this._translate("card.dayLength"),
          value: this._translate(
            isLongestDay ? "card.longestDay" : "card.shortestDay"
          ),
        });
        break;
      }
      case "opposition":
        name = `${bodyLabel} ${this._translate("events.opposition")}`;
        rows.push({
          label: this._translate("card.visibility"),
          value: this._translate("card.visibleAllNight"),
        });
        break;
      case "greatestElongation":
        name = `${bodyLabel} ${this._translate("events.greatestElongation")}`;
        if (event.visibility) {
          rows.push({
            label: this._translate("card.visibility"),
            value: this._translate(
              `card.${event.visibility}` as TranslationKey
            ),
          });
        }
        if (event.elongationDegrees !== undefined) {
          rows.push({
            label: this._translate("card.elongation"),
            value: `${event.elongationDegrees.toFixed(1)}°`,
          });
        }
        break;
      case "supermoon":
        name = this._translate("events.supermoon");
        if (event.distanceKm !== undefined) {
          rows.push({
            label: this._translate("card.distance"),
            value: `${Math.round(event.distanceKm).toLocaleString(locale)} km`,
          });
        }
        break;
    }

    rows.push({
      label: this._translate("card.date"),
      value: DateTime.fromJSDate(event.date).toFormat("MMM dd", { locale }),
    });

    return {
      category: "celestialEvent",
      name,
      rows,
    };
  }

  private getMeteorShowerEventRows(
    now: DateTime,
    observer: Observer
  ): EventRow[] {
    const showers = getActiveOrUpcomingShowers(now.toJSDate(), observer);
    return showers.map((shower) => this.buildMeteorShowerRow(shower, now));
  }

  private buildMeteorShowerRow(
    shower: MeteorShowerEvent,
    now: DateTime
  ): EventRow {
    const name = this._translate(`showers.${shower.name}` as TranslationKey);
    const locale = this.getLocale();

    const statusValue = shower.isActive
      ? this._translate("card.active")
      : this._translate("card.peaksIn").replace(
          "{days}",
          String(
            Math.ceil(
              DateTime.fromJSDate(shower.peak).diff(now, "days").days
            )
          )
        );

    const visibilityValue = shower.isRadiantVisible
      ? this._translate("card.radiantAboveHorizon").replace(
          "{deg}",
          shower.radiantAltitude.toFixed(0)
        )
      : this._translate("card.radiantBelowHorizon");

    const rows: EventDataRow[] = [
      { label: this._translate("card.status"), value: statusValue },
      { label: this._translate("card.zhr"), value: String(shower.zhr) },
      { label: this._translate("card.visibility"), value: visibilityValue },
      {
        label: this._translate("card.peakDate"),
        value: DateTime.fromJSDate(shower.peakLocalTime).toFormat(
          "MMM dd HH:mm",
          { locale }
        ),
      },
    ];

    return {
      category: "meteorShower",
      name,
      rows,
    };
  }

  private groupEventsByCategory(
    events: EventRow[]
  ): Map<EventCategory, EventRow[]> {
    const map = new Map<EventCategory, EventRow[]>();
    for (const event of events) {
      const list = map.get(event.category) ?? [];
      list.push(event);
      map.set(event.category, list);
    }
    return map;
  }

  private getCategoryLabelKey(category: EventCategory): TranslationKey {
    switch (category) {
      case "eclipse":
        return "card.eclipses";
      case "meteorShower":
        return "card.meteorShowers";
      case "celestialEvent":
        return "card.celestialEvents";
    }
  }

  private getTabLabelKey(tab: TabId): TranslationKey {
    return tab === "solarSystem" ? "card.solarSystem" : this.getCategoryLabelKey(tab);
  }

  private getVisibleTabs(flags: {
    showEclipses: boolean;
    showCelestialEvents: boolean;
    showMeteorShowers: boolean;
  }): TabId[] {
    return TAB_ORDER.filter((tab) => {
      switch (tab) {
        case "eclipse":
          return flags.showEclipses;
        case "celestialEvent":
          return flags.showCelestialEvents;
        case "meteorShower":
          return flags.showMeteorShowers;
        default:
          return true;
      }
    });
  }

  private renderTabBar(flags: {
    showEclipses: boolean;
    showCelestialEvents: boolean;
    showMeteorShowers: boolean;
  }): TemplateResult {
    const tabs = this.getVisibleTabs(flags);
    const activeTab = tabs.includes(this.activeTab) ? this.activeTab : tabs[0];

    return html`
      <div class="tab-bar-wrapper">
        <button
          class="tab-scroll-button ${this.canScrollTabsLeft ? "visible" : ""}"
          aria-label="${this._translate("card.scrollTabsLeft")}"
          @click=${() => this.scrollTabs(-1)}
        >
          ‹
        </button>
        <div
          class="tab-bar"
          ${ref(this.tabBarRef)}
          @wheel=${this.tabWheelListener}
          @scroll=${() => this.updateTabScrollState()}
        >
          ${tabs.map(
            (tab) => html`
              <button
                class="tab-button ${tab === activeTab ? "active" : ""}"
                @click=${() => {
                  this.activeTab = tab;
                }}
              >
                <img
                  src="https://cdn.jsdelivr.net/gh/wwwescape/sky-tonight-card@main/images/tabs/${TAB_ICON_FILE[
                    tab
                  ]}.png"
                  alt=""
                />
                ${this._translate(this.getTabLabelKey(tab))}
              </button>
            `
          )}
        </div>
        <button
          class="tab-scroll-button ${this.canScrollTabsRight ? "visible" : ""}"
          aria-label="${this._translate("card.scrollTabsRight")}"
          @click=${() => this.scrollTabs(1)}
        >
          ›
        </button>
      </div>
    `;
  }

  private handleTabWheel(e: WheelEvent): void {
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    const el = this.tabBarRef.value;
    if (!el) return;
    e.preventDefault();
    el.scrollLeft += e.deltaY;
  }

  private scrollTabs(direction: 1 | -1): void {
    this.tabBarRef.value?.scrollBy({
      left: direction * 150,
      behavior: "smooth",
    });
  }

  private updateTabScrollState(): void {
    const el = this.tabBarRef.value;
    if (!el) {
      this.canScrollTabsLeft = false;
      this.canScrollTabsRight = false;
      return;
    }
    this.canScrollTabsLeft = el.scrollLeft > 0;
    this.canScrollTabsRight =
      el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    this.updateTabScrollState();
  }

  private renderActiveTabPanel(
    flags: {
      showEclipses: boolean;
      showCelestialEvents: boolean;
      showMeteorShowers: boolean;
    },
    celestialObjectsWithTimes: CelestialObjectDisplay[],
    moonPhase: string,
    eventsByCategory: Map<EventCategory, EventRow[]>
  ): TemplateResult {
    const tabs = this.getVisibleTabs(flags);
    const activeTab = tabs.includes(this.activeTab) ? this.activeTab : tabs[0];

    if (activeTab === "solarSystem") {
      return this.renderSolarSystemPanel(celestialObjectsWithTimes, moonPhase);
    }

    const events = (eventsByCategory.get(activeTab) ?? []).slice(
      0,
      MAX_ROWS_PER_TAB
    );

    if (events.length === 0) {
      return html`<div class="tab-panel event-empty">
        ${this._translate("card.eventEmpty")}
      </div>`;
    }

    return html`
      <div class="tab-panel astro-list">
        ${events.map((event) => this.renderEventCard(event))}
      </div>
    `;
  }

  private renderEventCard(event: EventRow): TemplateResult {
    return html`
      <div class="astro-card">
        <div class="astro-info">
          <div class="astro-name">${event.name}</div>
          ${event.rows.map(
            (row) => html`
              <div class="astro-data event-row">
                <span class="event-row-label">${row.label}:</span>
                <span>${row.value}</span>
              </div>
            `
          )}
        </div>
      </div>
    `;
  }

  private renderIconCredit(): TemplateResult {
    const [before, after] = this._translate("card.iconCredit").split(
      "{icons8}"
    );
    return html`
      <div class="icon-credit">
        ${before}<a
          href="https://icons8.com/"
          target="_blank"
          rel="noopener noreferrer"
          >Icons8</a
        >${after ?? ""}
      </div>
    `;
  }

  private renderSolarSystemPanel(
    celestialObjectsWithTimes: CelestialObjectDisplay[],
    moonPhase: string
  ): TemplateResult {
    return html`
      <div class="tab-panel astro-list">
        ${celestialObjectsWithTimes.slice(0, MAX_ROWS_PER_TAB).map(
          (obj) => html`
            <div class="astro-card">
              <img
                src="https://cdn.jsdelivr.net/gh/wwwescape/sky-tonight-card@main/images/objects/${obj.name}.png"
                alt="${this._translate(`objects.${obj.name}` as TranslationKey)}"
              />
              <div class="astro-info">
                <div class="astro-type">
                  ${this._translate(`types.${obj.type}` as TranslationKey)}
                </div>
                <div class="astro-name">
                  ${this._translate(`objects.${obj.name}` as TranslationKey)}
                </div>
                <div class="astro-data">
                  ${this._translate("card.visible")}: ${obj.riseStr} -
                  ${obj.setStr}
                </div>
                <div class="astro-data">
                  ${this._translate("card.duration")}: ${obj.duration}
                </div>
                <div class="astro-data">
                  ${this._translate("card.altitude")}:
                  ${obj.altitude.toFixed(1)}°
                </div>
                ${obj.body === Body.Moon
                  ? html`
                      <div class="astro-data">
                        ${this._translate("card.moonPhase")}:
                        <img
                          src="https://cdn.jsdelivr.net/gh/wwwescape/sky-tonight-card@main/images/moon-phases/${this.toKebabCase(
                            moonPhase
                          )}.png"
                          alt="${this._translate(
                            `moonPhases.${moonPhase}` as TranslationKey
                          )}"
                        />
                        ${this._translate(
                          `moonPhases.${moonPhase}` as TranslationKey
                        )}
                      </div>
                    `
                  : ""}
              </div>
              <div class="astro-icons">
                <div>
                  <img
                    src="https://cdn.jsdelivr.net/gh/wwwescape/sky-tonight-card@main/images/${obj.altitude >
                      0 && obj.isNakedEye
                      ? "eye.png"
                      : "eye_disabled.png"}"
                    alt="${this._translate("card.nakedEye")}"
                  />
                </div>
                <div>
                  <img
                    src="https://cdn.jsdelivr.net/gh/wwwescape/sky-tonight-card@main/images/${obj.altitude >
                      0 && obj.isBinocular
                      ? "binoculars.png"
                      : "binoculars_disabled.png"}"
                    alt="${this._translate("card.binocular")}"
                  />
                </div>
                <div>
                  <img
                    src="https://cdn.jsdelivr.net/gh/wwwescape/sky-tonight-card@main/images/${obj.altitude >
                    0
                      ? "telescope.png"
                      : "telescope_disabled.png"}"
                    alt="${this._translate("card.telescope")}"
                  />
                </div>
              </div>
            </div>
          `
        )}
      </div>
    `;
  }

  private getAltitude(
    body: Body,
    date: Date,
    lat: number,
    lon: number,
    elevation: number
  ): number {
    const observer = new Observer(lat, lon, elevation);
    const equ = Equator(body, date, observer, true, true);
    const hor = Horizon(date, observer, equ.ra, equ.dec, "normal");
    return hor.altitude;
  }

  private getRiseSet(observer: Observer, body: Body, now: DateTime) {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const nowJs = now.toJSDate();
    let rise: DateTime | null = null;
    let set: DateTime | null = null;

    try {
      const nextSetResult = SearchRiseSet(body, observer, -1, nowJs, 300);
      if (!nextSetResult) return { rise: null, set: null };

      const nextSetTime = nextSetResult.date;
      set = DateTime.fromJSDate(nextSetTime).setZone(timeZone);

      if (nextSetTime > nowJs) {
        const searchTime = new Date(nextSetTime.getTime() - 36 * 3600 * 1000);
        const prevRiseResult = SearchRiseSet(
          body,
          observer,
          +1,
          searchTime,
          300
        );
        if (prevRiseResult && prevRiseResult.date < nextSetTime) {
          const durationHours =
            (nextSetTime.getTime() - prevRiseResult.date.getTime()) / 3600000;
          if (durationHours <= 24) {
            rise = DateTime.fromJSDate(prevRiseResult.date).setZone(timeZone);
            return { rise, set };
          }
        }

        const nextRiseResult = SearchRiseSet(body, observer, +1, nowJs, 300);
        if (nextRiseResult && nextRiseResult.date < nextSetTime) {
          rise = DateTime.fromJSDate(nextRiseResult.date).setZone(timeZone);
          return { rise, set };
        }
      }

      const nextRiseResult = SearchRiseSet(body, observer, +1, nowJs, 300);
      if (!nextRiseResult) return { rise: null, set: null };

      rise = DateTime.fromJSDate(nextRiseResult.date).setZone(timeZone);

      const setAfterRiseResult = SearchRiseSet(
        body,
        observer,
        -1,
        nextRiseResult.date,
        300
      );
      if (setAfterRiseResult) {
        set = DateTime.fromJSDate(setAfterRiseResult.date).setZone(timeZone);
      }

      return { rise, set };
    } catch (error) {
      console.error(
        `[${Body[body]}] Error during rise/set calculation:`,
        error
      );
      return { rise: null, set: null };
    }
  }

  private calculateDuration(
    rise: DateTime | null,
    set: DateTime | null
  ): string {
    if (!rise || !set) return "-";
    const diff = set.diff(rise, ["hours", "minutes"]).toObject();
    const hours = Math.floor(diff.hours || 0);
    const minutes = Math.round(diff.minutes || 0);
    return `${hours}${this._translate("time.h")} ${minutes}${this._translate(
      "time.m"
    )}`;
  }

  private getMoonPhase(date: Date): string {
    const phase = MoonPhase(date);
    if (phase === 0) return "New Moon";
    if (phase === 90) return "First Quarter";
    if (phase === 180) return "Full Moon";
    if (phase === 270) return "Last Quarter";

    if (phase > 0 && phase < 90) return "Waxing Crescent";
    if (phase > 90 && phase < 180) return "Waxing Gibbous";
    if (phase > 180 && phase < 270) return "Waning Gibbous";
    if (phase > 270 && phase < 360) return "Waning Crescent";

    return "New Moon";
  }

  private toKebabCase(str: string): string {
    return str.toLowerCase().replace(/\s+/g, "-").trim();
  }

  public getCardSize(): number {
    const baseSize = 4;
    if (this.lastMaxTabRowCount === 0) {
      return baseSize;
    }
    // Only one tab panel is visible at a time, but Home Assistant sizes the
    // card once - so size for the tallest tab (capped per MAX_ROWS_PER_TAB),
    // not the sum across all categories, or switching tabs would clip.
    return baseSize + 1 + Math.ceil(this.lastMaxTabRowCount / 2);
  }
}

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: "sky-tonight-card",
  name: "Sky Tonight Native Card",
  preview: false,
  description:
    "A Home Assistant card showing sun, moon, and planet visibility using Astronomy Engine",
});
