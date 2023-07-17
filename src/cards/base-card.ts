import { HomeAssistant } from "custom-card-helpers";
import { HTMLTemplateResult } from "lit-html";
import SkyTonightCard from "..";
import { CardProperties, SkyTonightCardConfig, Translation } from "../types/sky-tonight-card-types";

export abstract class BaseCard {
    parent: SkyTonightCard;
    config: SkyTonightCardConfig;
    hass: HomeAssistant;

    constructor(parent: SkyTonightCard) {
        this.config = parent.config;
        this.hass = parent._hass;
        this.parent = parent;
    }

    translation(key: string): string {

        if (!this.config.translations || Object.keys(this.config.translations).indexOf(key) < 0) {
            return this.defaultTranslations[key];
        }

        return this.config.translations[key];
    }

    abstract render(): HTMLTemplateResult;

    abstract cardSize(): number;

    abstract defaultTranslations: Translation;

    protected getProperties() {
        const cardProperties = this.parent.properties?.get('cardValues') as CardProperties;
        return {};
    }

    protected getParentCardValues() {
        const cardValues = this.parent.properties ?? new Map<string, unknown>();
        const properties = cardValues.get('cardValues') as CardProperties ?? {} as CardProperties;
        return { properties, cardValues };
    }
}
