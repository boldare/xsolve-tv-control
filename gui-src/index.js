const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow

const actions = require('../actions.js');
const tvlistJson = actions.getTvList();

var tvListElem = document.getElementById('tvList')

function displayDevices() {
    tvListElem.innerHTML = '';

    for (var name in tvlistJson) {
        var powerColorClass = getTvPowerState(name) ? 'power-on': 'power-off';

        tvListElem.innerHTML += `
        <div class="card text-center text-wrap ${powerColorClass}" tv="${ name }">
            <div class="form-check">
                <input class="form-check-input position-static checkbox-big" type="checkbox" value="${ name }">
            </div>
            <div class="card-body col align-self-end">
                    <h4 class="card-title" id="name">${ name }</h4>
                    <p class="card-text">${ tvlistJson[name].ip } <br /> ${ tvlistJson[name].mac }</p>
            </div>
        </div>
        `
    }
}

displayDevices();

function getSelectedDevices() {
    var array = []
    var selectedCheckboxes = document.querySelectorAll('input[type=checkbox]:checked');

    for (var i = 0; i < selectedCheckboxes.length; i++) {
      array.push(selectedCheckboxes[i].value)
    }

    return array;
}

function powerOn() {
    return actions.powerSet(getSelectedDevices(), true);
}

function powerOff() {
    return actions.powerSet(getSelectedDevices(), false);
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
    console.log('app name: ' + appName);

    return actions.killApplication(getSelectedDevices(), appName).then(function() {
        document.getElementById('killApplicationButton').removeAttribute('disabled');
        console.log('Kill button unlocked');
    });
}

//test only

function getTvPowerState(tvName) {
    var y =Math.random();
    return y > 0.5 ? true : false;
}
