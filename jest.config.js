module.exports = {
    transform: {
        '^.+\\.ts?$': ['ts-jest', { "compiler": "ttypescript" }],
        '^.+\\.(js|jsx)$': [
            'babel-jest', {
                'presets': ['@babel/preset-env'],
                "plugins": [
                    ["@babel/plugin-transform-runtime"]
                ]
            }]
    },
    testEnvironment: 'jsdom',
    testRegex: '/tests/.*\\.(test|spec)?\\.(ts|tsx)$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    setupFiles: ["<rootDir>/tests/config.ts"],
    collectCoverageFrom: ["**/src/**/*.{js,jsx,ts}", "!**/node_modules/**", "!**/vendor/**", "!**/src/styles.ts", "!**/src/fonts.ts", "!**/src/editor.ts"],
    transformIgnorePatterns: ["node_modules\/(?!(lit|lit-element|lit-html|@lit)\/)"],
    testPathIgnorePatterns: [
        "tests/cards/sky-tonight.test.ts",
        "tests/utils/checkConfig.test.ts"
    ],
    coveragePathIgnorePatterns: [
        "tests/cards/sky-tonight.test.ts",
        "tests/cards/checkConfig.test.ts"
    ]
};