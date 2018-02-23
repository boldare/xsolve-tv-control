const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow

const actions = require('../actions.js');
const tvList = actions.getTvList();
const tileAutoRefreshTime = 10000;

let tvPowerState = [];
let tvScreenshots = [];
let tvListElem = document.getElementById('tvList')

drawTiles();

function drawTiles() {
    let selectedDevices = getSelectedDevices();
    tvListElem.innerHTML = '';

    for (var name in tvList) {
        tvListElem.innerHTML += `
        <div class="card text-center" tv="${ name }">
            <div class="form-check">
                <input class="form-check-input position-static checkbox-big" type="checkbox" value="${ name }">
            </div>
            <div class="card-body col align-self-center">
                    <h4 class="card-title card-short-name" id="name" title="${ name }">${ name }</h4>
                    <p class="card-text">${ tvList[name].ip } <br /> ${ tvList[name].mac }</p>
                    <span class="dot" tv="${ name }" power="power-unknown"></span>
                    <p>
                    <img class="screen rounded" tv="${ name }" src="../gui-assets/images/screen-not-updated.png"/>
                    </p>
            </div>
        </div>
        `
    }
}

async function refreshTilesState() {
    await getDevicesPowerState();
    var poweredOnList = [];

    for (var name in tvList) {
        console.log(`Refreshing power state: ${ name }`)
        document.querySelector(`span[class="dot"][tv="${ name }"]`)
            .setAttribute("power", `power-${tvPowerState[name]}`);

        if(tvPowerState[name] == 'on') {
            document.querySelector(`img[class*="screen"][tv="${ name }"]`)
                .setAttribute("src", `../gui-assets/images/screen-updating.png`);
            poweredOnList.push(name);
        } else {
            document.querySelector(`img[class*="screen"][tv="${ name }"]`)
                .setAttribute("src", `../gui-assets/images/screen-off.png`);
        }
    }

    await getDevicesScreenshots(poweredOnList);

    for (let i = 0; i <  poweredOnList.length; i++) {
        let name = poweredOnList[i];
        console.log(`Refreshing screenshot state: ${ name }`)
        document.querySelector(`img[class*="screen"][tv="${ name }"]`)
            .setAttribute("src", tvScreenshots[name]);
    }
}

function getDevicesPowerState() {
    console.log('getDevicesPowerState');

    return new Promise(function(resolve, reject) {
        let elementsNumber = Object.keys(tvList).length;
        let promiseArray = [];

        for (let i = 0; i < elementsNumber; i++) {
            let tvName = Object.keys(tvList)[i];
            console.log('for tvName: ' + tvName);
            promiseArray.push(actions.ll_getPowerState(tvName));
        }

        Promise.all(promiseArray).then(function(result) {
            for (let i = 0; i < elementsNumber; i++) {
                let tvName = Object.keys(tvList)[i];
                tvPowerState[tvName] = result[i];
            }

            resolve(true);
        });
    });
}

function getDevicesScreenshots(poweredOnList) {
    console.log('getDevicesScreenshots');

    return new Promise(function(resolve, reject) {
        let elementsNumber = Object.keys(poweredOnList).length;
        let promiseArray = [];

        for (let i = 0; i < elementsNumber; i++) {
            let tvName = poweredOnList[i];
            console.log('for tvName: ' + tvName);
            promiseArray.push(actions.ll_getRawScreenshot(tvName));
        }

        Promise.all(promiseArray).then(function(result) {
            for (let i = 0; i < elementsNumber; i++) {
                let tvName = poweredOnList[i];
                tvScreenshots[tvName] = `data:image/png;charset=utf-8;base64,${ result[i] }`;
            }

            resolve(true);
        });
    });
}

function getSelectedDevices() {
    let array = []
    let selectedCheckboxes = document.querySelectorAll('input[type=checkbox]:checked');

    for (var i = 0; i < selectedCheckboxes.length; i++) {
        array.push(selectedCheckboxes[i].value)
    }

    console.log(`getSelectedDevices: "${ array }"`);
    return array;
}

function selectAll() {
    let checkboxes = document.querySelectorAll('input[type="checkbox"]');

    for (var i = 0; i < checkboxes.length; i++) {
      checkboxes[i].checked = true;
    }
}

function deselectAll() {
    let checkboxes = document.querySelectorAll('input[type=checkbox]');

    for (var i = 0; i < checkboxes.length; i++) {
      checkboxes[i].checked = false;
    }
}

function powerOn() {
    return actions.powerSet(getSelectedDevices(), true).then(function() {
        return refreshTilesState();
    });
}

function powerOff() {
    return actions.powerSet(getSelectedDevices(), false).then(function() {
        return refreshTilesState();
    });
}

function runYoutubeMovie() {
    console.log('runYoutubeMovie');
    let url = document.getElementById('youtube_url').value;
    document.getElementById('runYoutubeButton').setAttribute('disabled', '');
    console.log('Run button locked');

    return actions.runYoutubeMovie(getSelectedDevices(), url).then(function() {
        document.getElementById('runYoutubeButton').removeAttribute('disabled');
        console.log('Run button unlocked');
    });
}

function viewPage() {
    console.log('viewPage');
    let url = document.getElementById('view_pageUrl').value;
    document.getElementById('viewPageButton').setAttribute('disabled', '');
    console.log('View button locked');

    return actions.viewPage(getSelectedDevices(), url).then(function() {
        document.getElementById('viewPageButton').removeAttribute('disabled');
        console.log('View button unlocked');
    });
}

function runApplication() {
    console.log('runApplication');
    let appName = document.getElementById('view_appName').value;
    document.getElementById('runApplicationButton').setAttribute('disabled', '');
    console.log('Run button locked');

    return actions.runApplication(getSelectedDevices(), appName).then(function() {
        document.getElementById('runApplicationButton').removeAttribute('disabled');
        console.log('Run button unlocked');
    });
}

function killApplication() {
    console.log('killApplication');
    let appName = document.getElementById('kill_appName').value;
    document.getElementById('killApplicationButton').setAttribute('disabled', '');
    console.log('Kill button locked');

    return actions.killApplication(getSelectedDevices(), appName).then(function() {
        document.getElementById('killApplicationButton').removeAttribute('disabled');
        console.log('Kill button unlocked');
    });
}

function setVolume() {
    console.log('setVolume');
    let value = document.getElementById('volume_value').value;
    document.getElementById('setVolumeButton').setAttribute('disabled', '');
    console.log('Set button locked');

    return actions.setVolume(getSelectedDevices(), value).then(function() {
        document.getElementById('setVolumeButton').removeAttribute('disabled');
        console.log('Set button unlocked');
    });
}
