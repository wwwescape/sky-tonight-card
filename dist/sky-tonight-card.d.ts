import { LitElement, TemplateResult } from "lit";
import "./sky-tonight-card-editor";
export declare class SkyTonightNativeCard extends LitElement {
    hass: any;
    private config;
    private languageOverride?;
    static get styles(): import("lit").CSSResult;
    private _translate;
    setConfig(config: any): void;
    static getConfigElement(): HTMLElement;
    private getLocale;
    protected render(): TemplateResult;
    private getAltitude;
    private getRiseSet;
    private calculateDuration;
    private getMoonPhase;
    private toKebabCase;
    getCardSize(): number;
}
