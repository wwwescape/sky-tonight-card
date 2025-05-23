import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { fireEvent } from "custom-card-helpers";
import { translations, TranslationKey, LanguageCode } from "./translations";

const DEFAULT_COLORS = {
  cardBackground: "#1b2431",
  cardTitle: "#ffffff",
  objectBackground: "#223044",
  objectName: "#ffffff",
  objectData: "#cccccc",
  objectType: "#aaaaaa",
};

@customElement("sky-tonight-card-editor")
export class SkyTonightNativeCardEditor extends LitElement {
  @property({ attribute: false }) public hass?: any;
  @state() private _config?: any;

  private _translate(key: TranslationKey): string {
    const lang = (this._config.languageOverride ||
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

  private _resetColor(key: string): void {
    this._config.colors = this._config.colors || {};
    this._config.colors[key] =
      DEFAULT_COLORS[key as keyof typeof DEFAULT_COLORS];
    fireEvent(this, "config-changed", { config: this._config });
  }

  static styles = css`
    .card-config {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .config-row {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .radio-group {
      display: flex;
      gap: 16px;
    }

    .radio-option {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .color-option {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 8px;
    }

    .color-option label {
      min-width: 150px;
    }

    .color-input {
      width: 60px;
      height: 36px;
      border-radius: 4px;
      cursor: pointer;
      padding: 0;
      border: 1px solid var(--secondary-text-color);
    }

    .reset-btn {
      background-color: var(--primary-color);
      color: var(--text-primary-color);
      border: none;
      border-radius: 4px;
      padding: 8px 12px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background-color 0.3s;
    }

    .reset-btn:hover {
      background-color: var(--primary-dark-color);
    }

    h3 {
      margin: 0 0 8px;
      font-size: 1.1rem;
    }
  `;

  setConfig(config: any): void {
    this._config = config;
  }

  protected render() {
    if (!this.hass || !this._config) {
      return html``;
    }

    if (this._config.showSun === undefined) {
      this._config.showSun = true;
    }
    if (this._config.showBelowHorizon === undefined) {
      this._config.showBelowHorizon = false;
    }
    if (this._config.showConfiguration === undefined) {
      this._config.showConfiguration = true;
    }

    return html`
      <div class="card-config">
        <div class="config-row">
          <label
            >${this._translate("editor.cardTitle")}
            (${this._translate("editor.optional")}):</label
          >
          <input
            type="text"
            .value=${this._config.cardTitle || ""}
            .placeholder=${this._translate("card.title")}
            @input=${(e: Event) => {
              const input = e.target as HTMLInputElement;
              this._config.cardTitle = input.value || undefined;
              fireEvent(this, "config-changed", { config: this._config });
            }}
          />
        </div>

        <div class="config-row">
          <label
            >${this._translate("editor.latitude")}
            (${this._translate("editor.optional")}):</label
          >
          <input
            type="number"
            .value=${this._config.lat || ""}
            .placeholder=${this.hass.config.latitude}
            @input=${(e: Event) => {
              const input = e.target as HTMLInputElement;
              this._config.lat = input.value
                ? parseFloat(input.value)
                : undefined;
              fireEvent(this, "config-changed", { config: this._config });
            }}
          />
        </div>

        <div class="config-row">
          <label
            >${this._translate("editor.longitude")}
            (${this._translate("editor.optional")}):</label
          >
          <input
            type="number"
            .value=${this._config.lon || ""}
            .placeholder=${this.hass.config.longitude}
            @input=${(e: Event) => {
              const input = e.target as HTMLInputElement;
              this._config.lon = input.value
                ? parseFloat(input.value)
                : undefined;
              fireEvent(this, "config-changed", { config: this._config });
            }}
          />
        </div>

        <div class="config-row">
          <label
            >${this._translate("editor.elevation")}
            (${this._translate("editor.elevationUnit")},
            ${this._translate("editor.optional")}):</label
          >
          <input
            type="number"
            .value=${this._config.elev || 0}
            @input=${(e: Event) => {
              const input = e.target as HTMLInputElement;
              this._config.elev = input.value ? parseFloat(input.value) : 0;
              fireEvent(this, "config-changed", { config: this._config });
            }}
          />
        </div>

        <div class="config-row">
          <label>${this._translate("editor.languageOverride")}:</label>
          <select
            .value=${this._config.languageOverride || ""}
            @change=${(e: Event) => {
              const select = e.target as HTMLSelectElement;
              this._config.languageOverride = select.value || undefined;
              fireEvent(this, "config-changed", { config: this._config });
            }}
          >
            <option value="">${this._translate("editor.useHASetting")}</option>
            <option value="en">${this._translate("languages.en")}</option>
            <option value="hi">${this._translate("languages.hi")}</option>
            <option value="fr">${this._translate("languages.fr")}</option>
          </select>
        </div>

        <div class="config-row">
          <label>${this._translate("editor.showSun")}:</label>
          <div class="radio-group">
            <label class="radio-option">
              <input
                type="radio"
                name="showSun"
                .checked=${this._config.showSun}
                @change=${() => {
                  this._config.showSun = true;
                  fireEvent(this, "config-changed", { config: this._config });
                }}
              />
              ${this._translate("editor.yes")}
            </label>
            <label class="radio-option">
              <input
                type="radio"
                name="showSun"
                .checked=${!this._config.showSun}
                @change=${() => {
                  this._config.showSun = false;
                  fireEvent(this, "config-changed", { config: this._config });
                }}
              />
              ${this._translate("editor.no")}
            </label>
          </div>
        </div>

        <div class="config-row">
          <label>${this._translate("editor.showBelowHorizon")}:</label>
          <div class="radio-group">
            <label class="radio-option">
              <input
                type="radio"
                name="showBelowHorizon"
                .checked=${this._config.showBelowHorizon}
                @change=${() => {
                  this._config.showBelowHorizon = true;
                  fireEvent(this, "config-changed", { config: this._config });
                }}
              />
              ${this._translate("editor.yes")}
            </label>
            <label class="radio-option">
              <input
                type="radio"
                name="showBelowHorizon"
                .checked=${!this._config.showBelowHorizon}
                @change=${() => {
                  this._config.showBelowHorizon = false;
                  fireEvent(this, "config-changed", { config: this._config });
                }}
              />
              ${this._translate("editor.no")}
            </label>
          </div>
        </div>

        <div class="config-row">
          <label>${this._translate("editor.showConfiguration")}:</label>
          <div class="radio-group">
            <label class="radio-option">
              <input
                type="radio"
                name="showConfiguration"
                .checked=${this._config.showConfiguration !== false}
                @change=${() => {
                  this._config.showConfiguration = true;
                  fireEvent(this, "config-changed", { config: this._config });
                }}
              />
              ${this._translate("editor.yes")}
            </label>
            <label class="radio-option">
              <input
                type="radio"
                name="showConfiguration"
                .checked=${this._config.showConfiguration === false}
                @change=${() => {
                  this._config.showConfiguration = false;
                  fireEvent(this, "config-changed", { config: this._config });
                }}
              />
              ${this._translate("editor.no")}
            </label>
          </div>
        </div>

        <div class="config-row">
          <h3>${this._translate("editor.colorCustomization")}</h3>

          <div class="color-option">
            <label>${this._translate("editor.cardBackground")}:</label>
            <input
              type="color"
              class="color-input"
              .value=${this._config.colors?.cardBackground ||
              DEFAULT_COLORS.cardBackground}
              @input=${(e: Event) => {
                this._config.colors = this._config.colors || {};
                this._config.colors.cardBackground = (
                  e.target as HTMLInputElement
                ).value;
                fireEvent(this, "config-changed", { config: this._config });
              }}
            />
            <button
              class="reset-btn"
              @click=${() => this._resetColor("cardBackground")}
            >
              ${this._translate("editor.reset")}
            </button>
          </div>

          <div class="color-option">
            <label>${this._translate("editor.cardTitle")}:</label>
            <input
              type="color"
              class="color-input"
              .value=${this._config.colors?.cardTitle ||
              DEFAULT_COLORS.cardTitle}
              @input=${(e: Event) => {
                this._config.colors = this._config.colors || {};
                this._config.colors.cardTitle = (
                  e.target as HTMLInputElement
                ).value;
                fireEvent(this, "config-changed", { config: this._config });
              }}
            />
            <button
              class="reset-btn"
              @click=${() => this._resetColor("cardTitle")}
            >
              ${this._translate("editor.reset")}
            </button>
          </div>

          <div class="color-option">
            <label>${this._translate("editor.objectBackground")}:</label>
            <input
              type="color"
              class="color-input"
              .value=${this._config.colors?.objectBackground ||
              DEFAULT_COLORS.objectBackground}
              @input=${(e: Event) => {
                this._config.colors = this._config.colors || {};
                this._config.colors.objectBackground = (
                  e.target as HTMLInputElement
                ).value;
                fireEvent(this, "config-changed", { config: this._config });
              }}
            />
            <button
              class="reset-btn"
              @click=${() => this._resetColor("objectBackground")}
            >
              ${this._translate("editor.reset")}
            </button>
          </div>

          <div class="color-option">
            <label>${this._translate("editor.objectName")}:</label>
            <input
              type="color"
              class="color-input"
              .value=${this._config.colors?.objectName ||
              DEFAULT_COLORS.objectName}
              @input=${(e: Event) => {
                this._config.colors = this._config.colors || {};
                this._config.colors.objectName = (
                  e.target as HTMLInputElement
                ).value;
                fireEvent(this, "config-changed", { config: this._config });
              }}
            />
            <button
              class="reset-btn"
              @click=${() => this._resetColor("objectName")}
            >
              ${this._translate("editor.reset")}
            </button>
          </div>

          <div class="color-option">
            <label>${this._translate("editor.objectData")}:</label>
            <input
              type="color"
              class="color-input"
              .value=${this._config.colors?.objectData ||
              DEFAULT_COLORS.objectData}
              @input=${(e: Event) => {
                this._config.colors = this._config.colors || {};
                this._config.colors.objectData = (
                  e.target as HTMLInputElement
                ).value;
                fireEvent(this, "config-changed", { config: this._config });
              }}
            />
            <button
              class="reset-btn"
              @click=${() => this._resetColor("objectData")}
            >
              ${this._translate("editor.reset")}
            </button>
          </div>

          <div class="color-option">
            <label>${this._translate("editor.objectType")}:</label>
            <input
              type="color"
              class="color-input"
              .value=${this._config.colors?.objectType ||
              DEFAULT_COLORS.objectType}
              @input=${(e: Event) => {
                this._config.colors = this._config.colors || {};
                this._config.colors.objectType = (
                  e.target as HTMLInputElement
                ).value;
                fireEvent(this, "config-changed", { config: this._config });
              }}
            />
            <button
              class="reset-btn"
              @click=${() => this._resetColor("objectType")}
            >
              ${this._translate("editor.reset")}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
