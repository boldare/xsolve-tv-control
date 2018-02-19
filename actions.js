const BraviaRemoteControl = require('sony-bravia-tv-remote');
const fs = require('fs');
const SimpleADB = require('simple-adb').SimpleADB;

const config = require('./tvconfig.json');
const appConfig = require('./appconfig.json')


exports.getTvList = function() {
    return config;
}

exports.powerSet = function(tvList, powerState) {
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

exports.setVolume = async function setVolume(tvList, volume) {
    let elementsNumber = tvList.length;

    for (let i = 0; i < elementsNumber; i++) {
        await ll_setVolume(tvList[i], volume);
    }
}

exports.runApplication = async function(tvList, applicationName) {
    let applicationPackageName = appConfig[applicationName].basic ? appConfig[applicationName].basic : applicationName;
    let elementsNumber = tvList.length;

    for (let i = 0; i < elementsNumber; i++) {
        await ll_runApplication(tvList[i], applicationPackageName);
    }
}

exports.killApplication = async function (tvList, applicationName) {
    let applicationPackageName = appConfig[applicationName].basic ? appConfig[applicationName].basic : applicationName;
    let elementsNumber = tvList.length;

    for (let i = 0; i < elementsNumber; i++) {
        await ll_killApplication(tvList[i], applicationPackageName);
    }
}

exports.viewPage = async function (tvList, pageUrl, browser) {
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

exports.runYoutubeMovie = async function (tvList, url) {
    let elementsNumber = tvList.length;

    for (let i = 0; i < elementsNumber; i++) {
        await ll_runYoutubeMovie(tvList[i], url);
    }
}

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
