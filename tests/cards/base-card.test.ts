// Mocks
import { createMock } from "ts-auto-mock";
import SkyTonightCard from "../../src";

// Models
import { SkyTonightCardConfig } from "../../src/types/sky-tonight-card-types";

// Importing test data
import SkyTonight from "../../src/cards/sky-tonight";

describe('Testing base-card file', () => {
    const parent = createMock<SkyTonightCard>({ 
        config: createMock<SkyTonightCardConfig>()
    });

    test.each`
    key | expected
    ${'days'}, ${'दिन'}
    `('Calling translation should return correct translation', ({ key, expected }) => { 
        // Arrange
        parent.config.translations = {  
            "days" : "दिन"
        };

        // Act
        const card = new SkyTonight(parent);

        // Assert
        expect(card.translation(key)).toBe(expected);
    })
});