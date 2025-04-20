import { LitElement, TemplateResult } from "lit";
import "./sky-tonight-card-editor";
export declare class SkyTonightNativeCard extends LitElement {
    hass: any;
    private config;
    static styles: import("lit").CSSResult;
    setConfig(config: any): void;
    static getConfigElement(): HTMLElement;
    protected render(): TemplateResult;
    private getAltitude;
    private getRiseSet;
    private calculateDuration;
    private getMoonPhase;
    private toKebabCase;
    getCardSize(): number;
}
