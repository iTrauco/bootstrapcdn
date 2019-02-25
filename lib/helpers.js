'use strict';

const fs = require('fs');
const semver = require('semver');
const sri = require('sri-toolbox');

const config = require('../config');

function generateSri(file, fromString) {
    file = fromString ? file : fs.readFileSync(file);

    return sri.generate({
        algorithms: ['sha384']
    }, file);
}

function selectedTheme(selected) {
    if (typeof selected === 'undefined' || selected === '') {
        return config.theme;
    }

    return parseInt(selected, 10) === 0 || parseInt(selected, 10) ?
        parseInt(selected, 10) :
        config.theme;
}

function getTheme(selected) {
    const { themes } = config.bootswatch4;

    selected = selectedTheme(selected);

    return {
        uri: config.bootswatch4.bootstrap
                .replace('SWATCH_VERSION', config.bootswatch4.version)
                .replace('SWATCH_NAME', themes[selected].name),
        sri: themes[selected].sri
    };
}

function generateDataJson() {
    const data = {
        timestamp: new Date().toISOString(),
        bootstrap: {},
        bootswatch4: {},
        bootswatch3: {},
        bootlint: {},
        fontawesome: {}
    };

    config.bootstrap.forEach((bootstrap) => {
        const bootstrapVersion = bootstrap.version;

        if (semver.satisfies(semver.coerce(bootstrapVersion), '<4')) {
            data.bootstrap[bootstrapVersion] = {
                css: bootstrap.stylesheet,
                js: bootstrap.javascript
            };
        }
    });

    config.bootswatch3.themes.forEach((theme) => {
        data.bootswatch3[theme.name] = config.bootswatch3.bootstrap
                                        .replace('SWATCH_NAME', theme.name)
                                        .replace('SWATCH_VERSION', config.bootswatch3.version);
    });

    config.bootswatch4.themes.forEach((theme) => {
        data.bootswatch4[theme.name] = config.bootswatch4.bootstrap
                                        .replace('SWATCH_NAME', theme.name)
                                        .replace('SWATCH_VERSION', config.bootswatch4.version);
    });

    config.bootlint.forEach((bootlint) => {
        data.bootlint[bootlint.version] = bootlint.javascript;
    });

    config.fontawesome.forEach((fontawesome) => {
        data.fontawesome[fontawesome.version] = fontawesome.stylesheet;
    });

    return data;
}

module.exports = {
    generateDataJson,
    theme: {
        get: getTheme,
        selected: selectedTheme
    },
    generateSri
};

// vim: ft=javascript sw=4 sts=4 et:
