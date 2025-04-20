import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { fireEvent } from "custom-card-helpers";

@customElement("sky-tonight-card-editor")
export class SkyTonightNativeCardEditor extends LitElement {
  @property({ attribute: false }) public hass?: any;
  @state() private _config?: any;

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
  `;

  setConfig(config: any): void {
    this._config = config;
  }

  protected render() {
    if (!this.hass || !this._config) {
      return html``;
    }

    // Set defaults if they don't exist
    if (this._config.showSun === undefined) {
      this._config.showSun = true;
    }
    if (this._config.showBelowHorizon === undefined) {
      this._config.showBelowHorizon = false;
    }

    return html`
      <div class="config-row">
          <label>Latitude (optional):</label>
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
          <label>Longitude (optional):</label>
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
          <label>Elevation (meters, optional):</label>
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
      </div>

      <div class="card-config">
        <div class="config-row">
          <label>Show Sun:</label>
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
              Yes
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
              No
            </label>
          </div>
        </div>

        <div class="config-row">
          <label>Show objects below horizon:</label>
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
              Yes
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
              No
            </label>
          </div>
        </div>
    `;
  }
}
