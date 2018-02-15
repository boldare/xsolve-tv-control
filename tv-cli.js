const BraviaRemoteControl = require('sony-bravia-tv-remote');
const commandLineArgs = require('command-line-args');
const clu = require('command-line-usage');
const fs = require('fs');
const SimpleADB = require('simple-adb').SimpleADB;

const config = JSON.parse(fs.readFileSync('tvconfig.json', 'utf8'));
const appConfig = JSON.parse(fs.readFileSync('appconfig.json', 'utf8'));

const help = [
    {
        header: 'XSolve TV Control',
        content: 'Help.',
    },
    {
        header: 'Options',
        optionList: [
            {
                name: 'help, -h',
                description: 'Displays this help.',
            },
            {
                name: 'poweron',
                description: 'Turns TV on.',
            },
            {
                name: 'poweroff',
                description: 'Turns TV off.',
            },
            {
                name: 'volume',
                description: 'Sets volume. Allowed range: 0-100.',
            },
            {
                name: 'list',
                description: 'Displays available TVs',
            },
            {
                name: 'tv',
                description: 'Selects specific TV. All may be selected using --all option',
            },
            {
                name: 'all',
                description: 'Selects all TVs.',
            },
            {
                name: 'run',
                description: 'Runs application. Example: --run opera',
            },
            {
                name: 'kill',
                description: 'Kills application. Example: --kill opera',
            },
            {
                name: 'viewpage',
                description: 'Runs youtube movie. Example --viewpage "https://www.google.com"',
            },
            {
                name: 'browser',
                description: 'additional parameter for --viewpage. Specific browser may be specified (for example "chrome"). Browser must be defined in "appconfig.json" file.',
            },
            {
                name: 'yt',
                description: 'Runs youtube movie. Example --yt "https://www.youtube.com/watch?v=G1IbRujko-A"',
            },
        ],
    },
];

const cluHelp = clu(help);

const cliOptionDefinitions = [
    {name: 'help', alias: 'h', type: Boolean},
    {name: 'poweron', type: Boolean},
    {name: 'poweroff', type: Boolean},
    {name: 'volume', type: Number},
    {name: 'list', type: Boolean},
    {name: 'tv', type: String, multiple: true},
    {name: 'all', type: Boolean},
    {name: 'run', type: String, multiple: false},
    {name: 'kill', type: String, multiple: false},
    {name: 'viewpage', type: String, multiple: false},
    {name: 'browser', type: String, multiple: false},
    {name: 'yt', type: String, multiple: false},
];
const cliOptions = commandLineArgs(cliOptionDefinitions);

if (cliOptions.help) {
    console.log(cluHelp);
    process.exit(0);
}

if (cliOptions.list) {
    let tvNames = Object.keys(config);
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

let tvList = cliOptions.all ? Object.keys(config) : cliOptions.tv;

// validate tv
for (let i = 0; i < tvList.length; i++) {
    let tvName = tvList[i];
    console.log(`Selecting "${ tvName }" TV.`);

    if (!config[tvList[i]]) {
        console.error(`Incorrect TV name "${ tvName }"`);
        process.exit(1);
    }
}

if (cliOptions.poweron || cliOptions.poweroff) {
    powerSet(tvList, cliOptions.poweron ? true : false).then(function() {
        process.exit(0);
    });
}

if (typeof(cliOptions.volume) !== 'undefined') {
    let volume = cliOptions.volume;

    if (volume < 0 || volume > 100) {
        console.error(`Volume can be set to 0-100 value only.`);
        process.exit(1);
    }

    setVolume(tvList, volume).then(function() {
        process.exit(0);
    });
}

if (cliOptions.run) {
    runApplication(tvList, cliOptions.run).then(function() {
        process.exit(0);
    });
}

if (cliOptions.kill) {
    killApplication(tvList, cliOptions.kill).then(function() {
        process.exit(0);
    });
}

if (cliOptions.viewpage) {
    let browser = cliOptions.browser ? cliOptions.browser : null;

    viewPage(tvList, cliOptions.viewpage, browser).then(function() {
        process.exit(0);
    });
}

if (cliOptions.yt) {
    runYoutubeMovie(tvList, cliOptions.yt).then(function() {
        process.exit(0);
    });
}

// methods
function powerSet(tvList, powerState) {
    return new Promise(function(resolve, reject) {
        let elementsNumber = tvList.length;
        let promiseArray = [];

        for (let i = 0; i < elementsNumber; i++) {
            let tvName = tvList[i];
            console.log('for tvName: ' + tvName);
            promiseArray.push(ll_powerSet(tvName, powerState));
        }

        Promise.all(promiseArray).then(function(result) {
            for (let i = 0; i < elementsNumber; i++) {
                if (!result[i]) {
                    resolve(false);
                    return;
                }
            }

            resolve(true);
        });
    });
}

async function setVolume(tvList, volume) {
    let elementsNumber = tvList.length;

    for (let i = 0; i < elementsNumber; i++) {
        await ll_setVolume(tvList[i], volume);
    }
}

async function runApplication(tvList, applicationName) {
    let applicationPackageName = appConfig[applicationName].basic ? appConfig[applicationName].basic : applicationName;
    let elementsNumber = tvList.length;

    for (let i = 0; i < elementsNumber; i++) {
        await ll_runApplication(tvList[i], applicationPackageName);
    }
}

async function killApplication(tvList, applicationName) {
    let applicationPackageName = appConfig[applicationName].basic ? appConfig[applicationName].basic : applicationName;
    let elementsNumber = tvList.length;

    for (let i = 0; i < elementsNumber; i++) {
        await ll_killApplication(tvList[i], applicationPackageName);
    }
}

async function viewPage(tvList, pageUrl, browser) {
    let elementsNumber = tvList.length;
    let customBrowserPackage = false;

    if (browser) {
        if (appConfig[browser].full) {
            customBrowserPackage = appConfig[browser].full;
        } else {
            console.log(`Browser "${ browser }" full package name is not set in appconfig.json file. ` +
            `You may run default browser by omitting "--browser" option.`);
            process.exit(1);
        }
    }

    for (let i = 0; i < elementsNumber; i++) {
        await ll_viewPage(tvList[i], pageUrl, customBrowserPackage);
    }
}

async function runYoutubeMovie(tvList, url) {
    let elementsNumber = tvList.length;

    for (let i = 0; i < elementsNumber; i++) {
        await ll_runYoutubeMovie(tvList[i], url);
    }
}

// internal

function ll_powerSet(tvName, powerState) {
    console.log(`powerSet TV ${ tvName } to state: ${ powerState }`);

    let tvConfig = config[tvName];

    return new BraviaRemoteControl(tvConfig.ip, 80, tvConfig.key).sendAction(powerState ? 'PowerOn' : 'PowerOff');
}

function ll_setVolume(tvName, volume) {
    let sadb = new SimpleADB();
    let ipAddress = config[tvName].ip;

    console.log(`Setting volume "${ volume }" on "${ tvName }" TV (${ ipAddress }).`);

    return sadb
        .connect(ipAddress)
        .then(function() {
            return sadb.execAdbShellCommand(`service call audio 3 i32 3 i32 ${ volume } i32 1`); // audio output 3
        })
        .catch((e) => {
            console.log('ll_setVolume failed - retrying');
            return ll_setVolume(tvName, volume);
        });
}

function ll_viewPage(tvName, pageUrl, customBrowserPackage) {
    let sadb = new SimpleADB();
    let ipAddress = config[tvName].ip;

    console.log(`Viewing "${ pageUrl }" page on "${ tvName }" TV (${ ipAddress }).`);

    return sadb
        .connect(ipAddress)
        .then(function() {
            if (customBrowserPackage) {
                return sadb.execAdbShellCommand(`am start -n ${ customBrowserPackage } -d "${ pageUrl }"`);
            }

            return sadb.execAdbShellCommand(`am start -a android.intent.action.VIEW "${ pageUrl }"`);// default browser
        })
        .catch((e) => {
            console.log('ll_viewPage failed - retrying');
            return ll_viewPage(tvName, pageUrl, customBrowserPackage);
        });
}

function ll_runApplication(tvName, applicationPackageName) {
    let sadb = new SimpleADB();
    let ipAddress = config[tvName].ip;

    console.log(`Running "${ applicationPackageName }" on "${ tvName }" TV (${ ipAddress }).`);

    return sadb
        .connect(ipAddress)
        .then(function() {
            return sadb.execAdbShellCommand(`monkey -p ${ applicationPackageName } -c android.intent.category.LAUNCHER 1`);
        })
        .catch((e) => {
            console.log('ll_runApplication failed - retrying');
            return ll_runApplication(tvName, applicationPackageName);
        });
}

function ll_killApplication(tvName, applicationPackageName) {
    let sadb = new SimpleADB();
    let ipAddress = config[tvName].ip;

    console.log(`Killing "${ applicationPackageName }" on "${ tvName }" TV (${ ipAddress }).`);

    return sadb
        .connect(ipAddress)
        .then(function() {
            return sadb.execAdbShellCommand(`am force-stop ${ applicationPackageName }`);
        })
        .catch((e) => {
            console.log('ll_killApplication failed - retrying');
            return ll_killApplication(tvName, applicationPackageName);
        });
}

function ll_runYoutubeMovie(tvName, url) {
    let sadb = new SimpleADB();
    let ipAddress = config[tvName].ip;

    console.log(`Running Youtube url "${ url }" on "${ tvName }" TV (${ ipAddress }).`);

    return sadb
        .connect(ipAddress)
        .then(function() {
            return sadb.execAdbShellCommand(`am start -a android.intent.action.VIEW "${ url }"`);
        })
        .catch((e) => {
            console.log('ll_runYoutubeMovie failed - retrying');
            return ll_runYoutubeMovie(tvName, url);
        });
}
