'use strict';

const fs = require('fs');
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

        data.bootstrap[bootstrapVersion] = {
            css: bootstrap.stylesheet,
            cssSri: bootstrap.stylesheetSri,
            js: bootstrap.javascript,
            jsSri: bootstrap.javascriptSri
        };

        if (bootstrap.javascriptBundle) {
            data.bootstrap[bootstrapVersion].jsBundle = bootstrap.javascriptBundle;
            data.bootstrap[bootstrapVersion].jsBundleSri = bootstrap.javascriptBundleSri;
        }
    });

    ['bootswatch3', 'bootswatch4'].forEach((key) => {
        config[key].themes.forEach((theme) => {
            const uri = config[key].bootstrap
                            .replace('SWATCH_NAME', theme.name)
                            .replace('SWATCH_VERSION', config[key].version);

            data[key][theme.name] = {
                uri,
                sri: theme.sri
            };
        });
    });

    config.bootlint.forEach((bootlint) => {
        data.bootlint[bootlint.version] = {
            uri: bootlint.javascript,
            sri: bootlint.javascriptSri
        };
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
