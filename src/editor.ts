import { fireEvent, HomeAssistant, LovelaceCardEditor } from "custom-card-helpers";
import { css, CSSResult, LitElement } from "lit";
import { html, TemplateResult } from "lit-html";
import { customElement, property, state } from 'lit/decorators.js';
import { CARD_EDITOR_NAME } from "./consts";
import { SkyTonightCardConfig, ValueChangedEvent } from "./types/sky-tonight-card-types";

@customElement(CARD_EDITOR_NAME)
export class FormulaOneCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private config?: SkyTonightCardConfig;

  setConfig(config: SkyTonightCardConfig): void {
    this.config = config;
  }

  get _title(): string {
    return this.config?.title;
  }

  get _showSun(): boolean {
    return typeof this.config?.showSun === 'undefined' ? false : this.config?.showSun;
  }

  get _onlyAboveHorizon(): boolean {
    return typeof this.config?.onlyAboveHorizon === 'undefined' ? false : this.config?.onlyAboveHorizon;
  }

  get _weatherEntity(): string {
    return this.config?.weatherEntity;
  }

  protected generateCheckbox(configValue: string, label: string, checked: boolean): TemplateResult {
    return html`
            <ha-formfield label=${label}>
                <ha-switch
                    .checked=${checked}
                    .configValue=${configValue}
                    @change=${this._valueChanged}
                ></ha-switch>
            </ha-formfield>
        `;
  }

  protected render(): TemplateResult {
    if (!this.hass || !this.config) {
      return html``;
    }

    return html`
            <div class="card-config">
              <div class="tabs">
                <div class="tab">
                    <input type="checkbox" id="entity" class="tab-checkbox">
                    <label class="tab-label" for="entity">Basic configuration</label>
                    <div class="tab-content">
                        <paper-input
                            label="Title"
                            .value=${this._title}
                            .placeholder=${this._title}
                            .configValue=${'title'}
                            @value-changed=${this._valueChanged}
                        ></paper-input>
                        <paper-input
                            label="Weather Entity"
                            .value=${this._weatherEntity}
                            .placeholder=${this._weatherEntity}
                            .configValue=${'weatherEntity'}
                            @value-changed=${this._valueChanged}
                        ></paper-input>
                        <div class="side-by-side">                            
                            ${this.generateCheckbox('showSun', 'Show Sun?', this._showSun)}  
                            ${this.generateCheckbox('onlyAboveHorizon', 'Only Above Horizon?', this._onlyAboveHorizon)}
                        </div>
                    </div>
                </div>
              </div>
            </div>
            `;

  }

  private _valueChangedSelect(ev: ValueChangedEvent): void {
    if (!this.config || !this.hass) {
      return;
    }
    //const 
    // if (this[`_${target.configValue}`] === target.value) {
    //     return;
    // }
    const itemValue = ev.detail.value.itemValue;
    const configValue = ev.detail.value.parentElement.configValue;
    if (configValue) {
      if (ev.detail.value.itemValue === '') {
        const tmpConfig = { ...this.config };
        delete tmpConfig[configValue];
        this.config = tmpConfig;
      } else {
        this.config = {
          ...this.config,
          [configValue]: itemValue,
        };
      }
    }
    fireEvent(this, 'config-changed', { config: this.config });
  }

  private _valueChanged(ev: ValueChangedEvent): void {
    if (!this.config || !this.hass) {
      return;
    }
    const target = ev.target;
    //const 
    // if (this[`_${target.configValue}`] === target.value) {
    //     return;
    // }
    if (target.configValue) {
      if (target.value === '') {
        const tmpConfig = { ...this.config };
        delete tmpConfig[target.configValue];
        this.config = tmpConfig;
      } else {
        this.config = {
          ...this.config,
          [target.configValue]: target.checked !== undefined ? target.checked : target.value,
        };
      }
    }
    fireEvent(this, 'config-changed', { config: this.config });
  }

  static get styles(): CSSResult {
    return css`
          ha-switch {
            padding: 16px 6px;
          }
          .side-by-side {
            display: flex;
            flex-flow: row wrap;
          }
          .side-by-side > * {
            padding-right: 8px;
            width: 50%;
            flex-flow: column wrap;
            box-sizing: border-box;
          }
          .side-by-side > *:last-child {
            flex: 1;
            padding-right: 0;
          }
          .suffix {
            margin: 0 8px;
          }
          .group {
            padding: 15px;
            border: 1px solid var(--primary-text-color)
          }
          .tabs {
            overflow: hidden;        
          }
          .tab {
            width: 100%;
            color: var(--primary-text-color);
            overflow: hidden;
          }
          .tab-label {
            display: flex;
            justify-content: space-between;
            padding: 1em 1em 1em 0em;
            border-bottom: 1px solid var(--secondary-text-color);
            font-weight: bold;
            cursor: pointer;
          }
          .tab-label:hover {
            /*background: #1a252f;*/
          }
          .tab-label::after {
            content: "❯";
            width: 1em;
            height: 1em;
            text-align: center;
            transition: all 0.35s;
          }
          .tab-content {
            max-height: 0;
            padding: 0 1em;
            background: var(--secondary-background-color);
            transition: all 0.35s;
          }
          input.tab-checkbox {
            position: absolute;
            opacity: 0;
            z-index: -1;
          }      
          input.tab-checkbox:checked + .tab-label {
            border-color: var(--accent-color);
          }
          input.tab-checkbox:checked + .tab-label::after {
            transform: rotate(90deg);
          }
          input.tab-checkbox:checked ~ .tab-content {
            max-height: 100vh;
            padding: 1em;
          }      
        `;

  }
}