import { html, HTMLTemplateResult } from "lit-html";
import { BaseCard } from "./base-card";
import { HomeAssistant } from "custom-card-helpers";
import SkyTonightCard from "..";
import { binocularsObjects, objects, ObjectTypes } from "../consts";

export default class SkyTonight extends BaseCard {
    hass: HomeAssistant;
    defaultTranslations = {
        'jan': 'Jan',
        'feb': 'Feb',
        'mar': 'Mar',
        'apr': 'Apr',
        'may': 'May',
        'jun': 'Jun',
        'jul': 'Jul',
        'aug': 'Aug',
        'sep': 'Sep',
        'oct': 'Oct',
        'nov': 'Nov',
        'dec': 'Dec',
        'above-horizon': 'Above Horizon',
        'below-horizon': 'Below Horizon',
        'sun': 'Sun',
        'mercury': 'Mercury',
        'venus': 'Venus',
        'moon': 'Moon',
        'mars': 'Mars',
        'jupiter': 'Jupiter',
        'saturn': 'Saturn',
        'uranus': 'Uranus',
        'neptune': 'Neptune',
        'pluto': 'Pluto',
        'star': 'Star',
        'planet': 'Planet',
        'dwarf-planet': 'Dwarf Planet',
        'visible-to-the-naked-eye': 'Visible to the naked eye',
        'visible-with-binoculars': 'Visible with binoculars',
        'visible-with-telescope': 'Visible with telescope',
        'nothing-to-see': 'Nothing to see',
        'no-stargazing-opportunities': 'No stargazing opportunities',
        'enjoy-your-stargazing': 'Enjoy your stargazing',
        'first-quarter': 'First Quarter',
        'full': 'Full Moon',
        'last-quarter': 'Last Quarter',
        'new': 'New Moon',
        'waning-cresent': 'Waning Cresent',
        'waning-gibbous': 'Waning Gibbous',
        'waxing-cresent': 'Waxing Cresent',
        'waxing-gibbous': 'Waxing Gibbous'
    };

    constructor(parent: SkyTonightCard) {
        super(parent);
    }

    cardSize(): number {
        return 1;
    }

    translate(string: string): string {
        return this.translation(this.transformString(string));
    }

    formatDate(date: Date, remove: string[] = []) {
        const givenDate = new Date(date);
        const monthNames = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];

        const month = this.translate(monthNames[givenDate.getMonth()]);
        const day = this.padNumber(givenDate.getDate(), 2);
        const hour = this.padNumber(givenDate.getHours(), 2);
        const minute = this.padNumber(givenDate.getMinutes(), 2);

        const formattedDate = [];

        if (!remove.includes('month')) {
            formattedDate.push(month);
        }

        if (!remove.includes('day')) {
            formattedDate.push(day);
        }

        if (!remove.includes('time')) {
            formattedDate.push(`${hour}:${minute}`);
        }

        return formattedDate.join(' ');
    }

    padNumber(number: number, length: number): string {
        return String(number).padStart(length, '0');
    }

    isToday(date: Date): boolean {
        const givenDate = new Date(date);
        const today = new Date(); // Current date
        return (
            givenDate.getDate() === today.getDate() &&
            givenDate.getMonth() === today.getMonth() &&
            givenDate.getFullYear() === today.getFullYear()
        );
    }

    transformString(string: string): string {
        // Remove special characters using regular expression
        const stringWithoutSpecialChars = string.replace(/[^\w\s]/gi, '');

        // Replace spaces with hyphens
        const stringWithHyphens = stringWithoutSpecialChars.replace(/\s+/g, '-');

        // Convert the string to lowercase
        const lowercaseString = stringWithHyphens.toLowerCase();

        return lowercaseString;
    }

    render(): HTMLTemplateResult {

        const sensors = Object.values(this.hass.states).filter(
            (state) => {
                if (this.config.onlyAboveHorizon) {
                    return state.entity_id.startsWith("sensor.sky_tonight_") && state.state === "above_horizon";
                } else {
                    return state.entity_id.startsWith("sensor.sky_tonight_");
                }
            }).sort((a, b) => {
                const indexA = objects.indexOf(a.entity_id.split('_')[2]);
                const indexB = objects.indexOf(b.entity_id.split('_')[2]);
                return indexA - indexB;
            });

        let riseDateTime: Date | undefined;
        let setDateTime: Date | undefined;
        let moonPhase;

        const objectsHTML: HTMLTemplateResult = html`${sensors
            .map((sensor) => {
                const objectName = sensor.attributes.friendly_name.replace(/^Sky Tonight /, '');
                const objectType = ObjectTypes[objectName];
                const objectPosition = sensor.state === 'above_horizon' ? 'Above Horizon' : 'Below Horizon';
                const eyeIcon = sensor.state === 'above_horizon' && sensor.attributes.nakedEyeObject ? 'eye.png' : 'eye_disabled.png';
                const binocularsIcon = sensor.state === 'above_horizon' && binocularsObjects.includes(objectName) ? 'binoculars.png' : 'binoculars_disabled.png';
                const telescopeIcon = sensor.state === 'above_horizon' ? 'telescope.png' : 'telescope_disabled.png';

                if (this.isToday(sensor.attributes.rise) && (!riseDateTime || sensor.attributes.rise < riseDateTime)) {
                    riseDateTime = sensor.attributes.rise;
                }

                if (this.isToday(sensor.attributes.set) && (!setDateTime || sensor.attributes.set > setDateTime)) {
                    setDateTime = sensor.attributes.set;
                }

                if (objectName === "Moon") {
                    moonPhase = sensor.attributes.phaseName;
                }

                return html`
                    <div class="objects-container" id="${sensor.entity_id}">
                        <div class="image-container">
                            <img src="/local/sky-tonight-card/images/objects/${this.translate(objectName)}.png" alt="${this.translate(objectName)}" />
                        </div>
                        <div class="info-container">
                            <div class="type-container">
                                <span class="object-type ${this.transformString(objectType)}">${this.translate(objectType)}</span>
                            </div>
                            <div class="name-container">
                                <span class="object-name">${this.translate(objectName)}</span>
                            </div>
                            <!-- <div class="position-container">
                                <span class="object-position">${this.translate(objectPosition)}</span>
                            </div> -->
                            <div class="position-container">
                                <span class="object-position">${this.formatDate(sensor.attributes.rise)} to ${this.formatDate(sensor.attributes.set)}</span>
                            </div>
                        </div>
                        <div class="icon-container">
                            <img src="/local/sky-tonight-card/images/${eyeIcon}" alt="${this.translate('Visible to the naked eye')}" />
                            <img src="/local/sky-tonight-card/images/${binocularsIcon}" alt="${this.translate('Visible with binoculars')}" />
                            <img src="/local/sky-tonight-card/images/${telescopeIcon}" alt="${this.translate('Visible with telescope')}" />
                        </div>
                    </div>`;
            })}`;

        const weatherEntity = this.config.weatherEntity
            ? this.hass.states[this.config.weatherEntity]
            : null;

        const weatherClear = weatherEntity?.state == "clear";

        let risetSetDateTime;

        if (riseDateTime && setDateTime) {
            risetSetDateTime = `${this.formatDate(riseDateTime, ['month', 'day'])} to ${this.formatDate(setDateTime, ['month', 'day'])}`;
        } else {
            risetSetDateTime = this.translate('Nothing to see');
        }

        const summaryHTML: HTMLTemplateResult = html`
            <div class="summary-container">
                <div class="text-container">
                    <span class="${!weatherClear ? "error-text" : ""}">${!weatherClear ? this.translate('No stargazing opportunities') : this.translate('Enjoy your stargazing')}</span>
                </div>
                <div class="icon-container">
                    <div>
                        <img src="/local/sky-tonight-card/images/clock.png" alt="${this.translate('Visible Times')}" />
                        <span class="icon-text">${risetSetDateTime}</span>
                    </div>
                    <div>
                        <img src="/local/sky-tonight-card/images/moon-phases/moon-${this.transformString(moonPhase)}.png" alt="${this.translate(moonPhase)}" />
                        <span class="icon-text">${this.translate(moonPhase)}</span>
                    </div>
                </div>
            </div>`;

        return html`${summaryHTML}${objectsHTML}`;
    }
}
