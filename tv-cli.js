const commandLineArgs = require('command-line-args');
const clu = require('command-line-usage');

const actions = require('./actions.js');
const constants = require('./constants.js');

const cliOptions = commandLineArgs(constants.cliOptionDefinitions);

if (cliOptions.help) {
    const cluHelp = clu(constants.help);
    console.log(cluHelp);

    process.exit(0);
}

if (cliOptions.list) {
    let tvNames = Object.keys(actions.getTvList());
    console.log(`${ tvNames.length } TV's available.`);
    console.log('TVs list:\n');

    for (let i = 0; i < tvNames.length; i++) {
        console.log(`\t ${ tvNames[i]}`);
    }

    process.exit(0);
}

// tv dependant
if (!cliOptions.tv && !cliOptions.all) {
    console.error('Missing --tv or --all parameter.');
    process.exit(1);
}

let tvList = cliOptions.all ? Object.keys(actions.getTvList()) : cliOptions.tv;

// validate tv
for (let i = 0; i < tvList.length; i++) {
    let tvName = tvList[i];
    console.log(`Selecting "${ tvName }" TV.`);

    if (!actions.getTvList()[tvList[i]]) {
        console.error(`Incorrect TV name "${ tvName }"`);
        process.exit(1);
    }
}

if (cliOptions.state) {
    actions.getPowerState(tvList).then(function() {
        process.exit(0);
    });
}

if (cliOptions.poweron || cliOptions.poweroff) {
    actions.powerSet(tvList, cliOptions.poweron ? true : false).then(function() {
        process.exit(0);
    });
}

if (typeof(cliOptions.volume) !== 'undefined') {
    let volume = cliOptions.volume;

    if (volume < 0 || volume > 100) {
        console.error(`Volume can be set to 0-100 value only.`);
        process.exit(1);
    }

    actions.setVolume(tvList, volume).then(function() {
        process.exit(0);
    });
}

if (cliOptions.run) {
    actions.runApplication(tvList, cliOptions.run).then(function() {
        process.exit(0);
    });
}

if (cliOptions.kill) {
    actions.killApplication(tvList, cliOptions.kill).then(function() {
        process.exit(0);
    });
}

if (cliOptions.viewpage) {
    let browser = cliOptions.browser ? cliOptions.browser : null;

    actions.viewPage(tvList, cliOptions.viewpage, browser).then(function() {
        process.exit(0);
    });
}

if (cliOptions.yt) {
    actions.runYoutubeMovie(tvList, cliOptions.yt).then(function() {
        process.exit(0);
    });
}
