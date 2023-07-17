import * as packageJson from '../package.json';
import { property, customElement } from 'lit/decorators.js';
import { HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import { SkyTonightCardConfig } from './types/sky-tonight-card-types';
import { CSSResult, html, HTMLTemplateResult, LitElement, PropertyValues } from 'lit';
import { checkConfig, hasConfigOrCardValuesChanged } from './utils';
import { styles } from './styles';
import { BaseCard } from './cards/base-card';
import SkyTonight from './cards/sky-tonight';
import { CARD_EDITOR_NAME, CARD_NAME } from './consts';

console.info(
    `%c ${CARD_NAME.toUpperCase()} %c ${packageJson.version}`,
    'color: cyan; background: black; font-weight: bold;',
    'color: darkblue; background: white; font-weight: bold;'
);

/* eslint-disable @typescript-eslint/no-explicit-any */
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
    type: 'sky-tonight-card',
    name: 'Sky Tonight Card',
    preview: false,
    description: 'Get list of visible planetary bodies in your sky',
});
/* eslint-enable @typescript-eslint/no-explicit-any */

@customElement(CARD_NAME)
export default class FormulaOneCard extends LitElement {
    @property() _hass?: HomeAssistant;
    @property() config?: SkyTonightCardConfig;
    @property() card: BaseCard;
    @property() warning: string;
    @property() set properties(values: Map<string, unknown>) {
        this._cardValues = values;
        this.update(values);
    }
    get properties() {
        return this._cardValues;
    }

    constructor() {
        super();
    }

    private _cardValues?: Map<string, unknown>;

    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        await import("./editor");
        return document.createElement(CARD_EDITOR_NAME) as LovelaceCardEditor;
    }

    setConfig(config: SkyTonightCardConfig) {

        checkConfig(config);

        this.config = { ...config };
    }

    protected shouldUpdate(changedProps: PropertyValues): boolean {
        return hasConfigOrCardValuesChanged(this.config, this, changedProps);
    }

    set hass(hass: HomeAssistant) {
        this._hass = hass;

        this.config.hass = hass;

        this.card = new SkyTonight(this);
    }

    static get styles(): CSSResult {
        return styles;
    }

    render(): HTMLTemplateResult {
        if (!this._hass || !this.config) return html``;

        try {
            return html`
                <ha-card elevation="2">
                    ${this.warning ? html`<hui-warning>${this.warning}</hui-warning>` : ''}
                    ${this.config.title ? html`<h1 class="card-header">${this.config.title}</h1>` : ''}
                    ${this.card.render()}
                </ha-card>
            `;
        } catch (error) {
            return html`<hui-warning>${error.toString()}</hui-warning>`;
        }
    }

    getCardSize() {
        return this.card.cardSize();
    }
}