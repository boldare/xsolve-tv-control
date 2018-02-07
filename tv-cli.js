const BraviaRemoteControl = require('sony-bravia-tv-remote');
const commandLineArgs = require('command-line-args');
const clu = require('command-line-usage');
const fs = require('fs');
var SimpleADB = require('simple-adb').SimpleADB;

var sadb = new SimpleADB();
const config = JSON.parse(fs.readFileSync('tvconfig.json', 'utf8'));

const help = [
    {
        header: 'XSolve TV control',
        content: 'Help.'
    },
    {
        header: 'Options',
        optionList: [
            {
                name: 'help, -h',
                description: 'Displays this help.'
            },
            {
                name: 'poweron',
                description: 'Turns TV on.'
            },
            {
                name: 'poweroff',
                description: 'Turns TV off.'
            },
            {
                name: 'list',
                description: 'Displays available TVs'
            },
            {
                name: 'tv',
                description: 'Selects specific TV. All may be selected using --all option'
            },
            {
                name: 'all',
                description: 'Selects all TVs.'
            },
        ]
    }
]

const clu_help = clu(help);

const cliOptionDefinitions = [
    { name: 'help', alias: 'h', type: Boolean },
    { name: 'poweron', type: Boolean },
    { name: 'poweroff', type: Boolean },
    { name: 'list', type: Boolean },
    { name: 'tv', type: String, multiple: true },
    { name: 'all', type: Boolean }
]
const cliOptions = commandLineArgs(cliOptionDefinitions);

if(cliOptions.help) {
    console.log(clu_help);
    process.exit(0);
}

if(cliOptions.list) {
    var tvNames = Object.keys(config);
    console.log(`${ tvNames.length } TV's available.`);
    console.log('TVs list:\n');

    for (i = 0; i < tvNames.length; i++) {
        console.log(`\t ${ tvNames[i]}`);
    }

    process.exit(0);
}

//tv dependant
if(!cliOptions.tv && !cliOptions.all) {
    console.log('Missing --tv or --all parameter.');
    process.exit(1);
}

var tvList = cliOptions.all ? Object.keys(config) : cliOptions.tv;

//validate tv
for (i = 0; i < tvList.length; i++) {
    var tvName = tvList[i];
    console.log(`Selecting "${ tvName }" TV.`);

    if(!config[tvList[i]]) {
        console.log(`Incorrect TV name "${ tvName }"`);
        process.exit(1);
    }
}

if(cliOptions.poweron || cliOptions.poweroff) {
    return powerSet(tvList, cliOptions.poweron ? true : false).then(function() {
        process.exit(0);
    });
}

//=======methods

function powerSet(tvList, powerState) {
    console.log(`powerSetAll TV to state: ${ powerState }`);

    return new Promise(function(resolve, reject){
        let elementsNumber = tvList.length;
        let promiseArray = [];

        for (i = 0; i < elementsNumber; i++) {
            var tvName = tvList[i];
            console.log('for tvName: ' + tvName);
            promiseArray.push(ll_powerSet(tvName, powerState));
        }

        Promise.all(promiseArray).then(function(result) {
            for(i = 0; i < elementsNumber; i++) {
                if(!result[i]) {
                    resolve(false);
                    return;
                }
            }

            resolve(true);
        });
    });
}

//=======internal

function ll_powerSet(tvName, powerState) {
    console.log(`powerSet TV ${ tvName } to state: ${ powerState }`);
    var tvConfig = config[tvName];

    return new BraviaRemoteControl(tvConfig.ip, 80, tvConfig.key).sendAction(powerState ? 'PowerOn' : 'PowerOff');
}
