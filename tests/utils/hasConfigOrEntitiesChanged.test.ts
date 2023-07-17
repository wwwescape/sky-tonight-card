import { PropertyValues } from "lit";
import { createMock } from "ts-auto-mock";
import FormulaOneCard from "../../src";
import { BaseCard } from "../../src/cards/base-card";
import { SkyTonightCardConfig } from "../../src/types/sky-tonight-card-types";
import { hasConfigOrCardValuesChanged } from '../../src/utils';

describe('Testing util file function hasConfigOrEntitiesChanged', () => {
    const config : SkyTonightCardConfig = {
        type: 'sky-tonight-card',
    };    
    const card = createMock<FormulaOneCard>();
    const baseCard = createMock<BaseCard>();

    test('Passing PropertyValues with config should return true', () => {
        const props : PropertyValues = new Map([['config', config]]);

        expect(hasConfigOrCardValuesChanged(config, card, props)).toBe(true);
    }),
    test('Passing PropertyValues empty should return false', () => {
        const props : PropertyValues = new Map();

        expect(hasConfigOrCardValuesChanged(config, card, props)).toBe(false);
    }),
    test('Passing PropertyValues config and card should return true', () => {
        card.properties = new Map([['test', 'test']]);
        const props : PropertyValues = new Map([['card', baseCard]]);

        expect(hasConfigOrCardValuesChanged(config, card, props)).toBe(true);
    }),
    test('Passing PropertyValues config and cardValues should return true', () => {
        const props : PropertyValues = new Map([['cardValues', new Map([['cardValues', 'test']])]]);

        expect(hasConfigOrCardValuesChanged(config, card, props)).toBe(true);
    })
})