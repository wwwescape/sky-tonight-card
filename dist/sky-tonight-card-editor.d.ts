import { LitElement } from "lit";
export declare class SkyTonightNativeCardEditor extends LitElement {
    hass?: any;
    private _config?;
    private _translate;
    private _resetColor;
    static styles: import("lit").CSSResult;
    setConfig(config: any): void;
    protected render(): import("lit-html").TemplateResult<1>;
}
