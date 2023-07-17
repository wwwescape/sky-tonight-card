import { HomeAssistant, LovelaceCardConfig } from 'custom-card-helpers';

export interface SkyTonightCardConfig extends LovelaceCardConfig {
    title?: string;
    showSun?: boolean;
    onlyAboveHorizon?: boolean;
    weatherEntity?: string;
    hass?: HomeAssistant;
}

export interface ValueChangedEvent {
    detail: {
        value: {
            itemValue: string;
            parentElement: {
                configValue: string;
            };
        }
    };
    target: {
        value: string;
        configValue: string;
        checked?: boolean;
    };

}

export interface Translation {
    [key: string]: string;
}

export interface LocalStorageItem {
    data: string,
    created: Date
}

export interface CardProperties {
    [key: string]: unknown;
}

export interface SelectChangeEvent {
    target: {
        value: string;
    }
}