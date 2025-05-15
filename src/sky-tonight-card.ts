import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  Observer,
  SearchRiseSet,
  MoonPhase,
  Body,
  Equator,
  Horizon,
} from "astronomy-engine";
import { DateTime } from "luxon";
import "./sky-tonight-card-editor";

type CelestialObjectInfo = {
  body: Body;
  name: string;
  type: string;
  isNakedEye: boolean;
  isBinocular: boolean;
};

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
    showSun: true, // Default to showing Sun
    showBelowHorizon: false, // Default to hiding objects below horizon
  };

  static styles = css`
    ha-card {
      padding: 16px;
      background-color: #1b2431;
      color: #ffffff;
      font-family: "Segoe UI", sans-serif;
      border-radius: 12px;
    }

    h2 {
      margin: 0 0 10px;
      font-size: 1.4rem;
    }

    .summary,
    .moon-phase {
      margin: 8px 0;
      font-size: 0.95rem;
      color: #ddd;
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
      background-color: #223044;
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
      color: #aaa;
    }

    .astro-name {
      font-weight: 600;
      font-size: 1.1rem;
      margin: 2px 0;
    }

    .astro-data {
      font-size: 0.85rem;
      color: #ccc;
    }

    .astro-icons {
      font-size: 1.2rem;
    }

    .astro-icons span {
      margin-left: 8px;
    }

    .moon-phase img {
      vertical-align: middle;
      height: 20px;
      margin-left: 6px;
    }

    .astro-icons img {
      width: 20px;
      height: 20px;
    }
  `;

  setConfig(config: any): void {
    this.config = config;
  }

  static getConfigElement() {
    return document.createElement("sky-tonight-card-editor");
  }

  protected render(): TemplateResult {
    if (!this.hass || !this.config) return html``;

    const latitude = this.config.lat || this.hass.config.latitude;
    const longitude = this.config.lon || this.hass.config.longitude;
    const elevation = this.config.elev || 0;
    const showSun = this.config.showSun !== false; // Default to true if not specified
    const showBelowHorizon = this.config.showBelowHorizon === true; // Default to false if not specified

    const now = DateTime.local();
    const observer = new Observer(latitude, longitude, elevation);

    const celestialObjectsWithTimes = CelestialObjects.filter(
      (obj) => showSun || obj.body !== Body.Sun
    ) // Filter out Sun if showSun is false
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

        return {
          ...obj,
          rise,
          set,
          riseStr: rise.toFormat("MMM dd HH:mm"),
          setStr: set.toFormat("MMM dd HH:mm"),
          duration: this.calculateDuration(rise, set),
          altitude,
        };
      })
      .filter((obj): obj is Exclude<typeof obj, null> => {
        // Filter out null objects and objects below horizon if showBelowHorizon is false
        if (!obj) return false;
        if (!showBelowHorizon && obj.altitude < 0) return false;
        return true;
      })
      .sort((a, b) => a.rise.toMillis() - b.rise.toMillis());

    const moonPhase = this.getMoonPhase(now.toJSDate());

    const moduleBaseUrl = new URL(".", import.meta.url).href;

    return html`
      <ha-card>
        <h2>Sky Tonight</h2>
        <div>
          <div><strong>Latitude:</strong> ${latitude.toFixed(2)}</div>
          <div><strong>Longitude:</strong> ${longitude.toFixed(2)}</div>
          <div><strong>Elevation:</strong> ${elevation}m</div>
        </div>
        <div class="moon-phase">
          Moon Phase:
          <img
            src="${moduleBaseUrl}images/moon-phases/${this.toKebabCase(
              moonPhase
            )}.png"
            alt="${moonPhase}"
          />
          ${moonPhase}
        </div>
        <div class="astro-list">
          ${celestialObjectsWithTimes.map(
            (obj) => html`
              <div class="astro-card">
                <img
                  src="${moduleBaseUrl}images/objects/${obj.name}.png"
                  alt="${obj.name}"
                />
                <div class="astro-info">
                  <div class="astro-type">${obj.type}</div>
                  <div class="astro-name">${obj.name}</div>
                  <div class="astro-data">
                    Visible: ${obj.riseStr} - ${obj.setStr}
                  </div>
                  <div class="astro-data">Duration: ${obj.duration}</div>
                  <div class="astro-data">
                    Altitude: ${obj.altitude.toFixed(1)}°
                  </div>
                </div>
                <div class="astro-icons">
                  <div>
                    <img
                      src="${moduleBaseUrl}images/${obj.altitude > 0 &&
                      obj.isNakedEye
                        ? "eye.png"
                        : "eye_disabled.png"}"
                      alt="Naked Eye"
                    />
                  </div>
                  <div>
                    <img
                      src="${moduleBaseUrl}images/${obj.altitude > 0 &&
                      obj.isBinocular
                        ? "binoculars.png"
                        : "binoculars_disabled.png"}"
                      alt="Binocular"
                    />
                  </div>
                  <div>
                    <img
                      src="${moduleBaseUrl}images/${obj.altitude > 0
                        ? "telescope.png"
                        : "telescope_disabled.png"}"
                      alt="Telescope"
                    />
                  </div>
                </div>
              </div>
            `
          )}
        </div>
      </ha-card>
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
    return `${hours}h ${minutes}m`;
  }

  private getMoonPhase(date: Date): string {
    const phase = MoonPhase(date);
    // Exact phase points (single-degree moments)
    if (phase === 0) return "New Moon";
    if (phase === 90) return "First Quarter";
    if (phase === 180) return "Full Moon";
    if (phase === 270) return "Last Quarter"; // (also called Third Quarter)

    // Ranges between exact phases
    if (phase > 0 && phase < 90) return "Waxing Crescent";
    if (phase > 90 && phase < 180) return "Waxing Gibbous";
    if (phase > 180 && phase < 270) return "Waning Gibbous";
    if (phase > 270 && phase < 360) return "Waning Crescent";

    // Fallback (shouldn't be needed if MoonPhase() returns [0, 360))
    return "New Moon";
  }

  private toKebabCase(str: string): string {
    return str.toLowerCase().replace(/\s+/g, "-").trim();
  }

  public getCardSize(): number {
    return 4;
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
