// Mocks
import { createMock } from "ts-auto-mock";
import fetchMock from "jest-fetch-mock";
import LocalStorageMock from '../testdata/localStorageMock';

// Models
import SkyTonight from "../../src/cards/sky-tonight";
import { SkyTonightCardConfig } from "../../src/types/sky-tonight-card-types";
import { getRenderStringAsync } from "../utils";
import { HTMLTemplateResult } from "lit";
import { HomeAssistant, NumberFormat, TimeFormat } from "custom-card-helpers";
import FormulaOneCard from "../../src";
import * as customCardHelper from "custom-card-helpers";

describe('Testing sky-tonight file', () => {
        
    const parent = createMock<FormulaOneCard>({ 
        config: createMock<SkyTonightCardConfig>(),
    });
    const hass = createMock<HomeAssistant>();
    hass.locale = {
        language: 'NL', 
        number_format: NumberFormat.comma_decimal,
        time_format: TimeFormat.language
    }
    parent._hass = hass;
    
    const config = createMock<SkyTonightCardConfig>();
    const card = new SkyTonight(parent);
    
    const localStorageMock = new LocalStorageMock();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    beforeEach(() => {
        localStorageMock.clear();     
        fetchMock.resetMocks();
        jest.useFakeTimers();
    });

    beforeAll(() => {

    }); 

    afterEach (() => {        
        jest.useRealTimers();  
    });

    
});

async function getHtmlResultAndDate(card: SkyTonight) {
    const result = card.render();

    const promise = (result.values[0] as HTMLTemplateResult).values[0] as Promise<HTMLTemplateResult>;
    const promiseResult = await promise;

    const iterator = (promiseResult.values[8] as HTMLTemplateResult).values[0] as AsyncIterableIterator<HTMLTemplateResult>;
    // eslint-disable-next-line @typescript-eslint/ban-types
    const handleAction = promiseResult.values[0] as Function;

    const date = await iterator.next();
    
    const htmlResult = await getRenderStringAsync(promiseResult);
    return { htmlResult, date, handleAction };
}
