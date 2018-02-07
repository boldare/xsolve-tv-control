const BraviaRemoteControl = require('sony-bravia-tv-remote');
const commandLineArgs = require('command-line-args');
const clu = require('command-line-usage');
const fs = require('fs');
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

if(cliOptions.poweron || cliOptions.poweroff) {
    if(!cliOptions.tv && !cliOptions.all) {
        console.log('Missing --tv or --all parameter.');
        process.exit(1);
    }

    if(cliOptions.tv) {
        if(!config[cliOptions.tv]) {
            console.log('Incorrect TV name.')
            process.exit(1);
        }

        powerSet(cliOptions.tv, cliOptions.poweron ? true : false).then(function() {
            process.exit(0);
        });
    }

    if(cliOptions.all) {
        powerSetAll(cliOptions.poweron ? true : false);
    }
}

//=======interneal

function powerSet(tvName, powerState) {
    console.log(`powerSet TV ${ tvName } to state: ${ powerState }`);
    var tvConfig = config[tvName];
    return new BraviaRemoteControl(tvConfig.ip, 80, tvConfig.key).sendAction(powerState ? 'PowerOn' : 'PowerOff');
}

function powerSetAll(powerState) {
    console.log(`powerSetAll TV to state: ${ powerState }`);


    return new Promise(function(resolve, reject){
        var tvNames = Object.keys(config);
        let elementsNumber = tvNames.length;
        let promiseArray = [];

        for (i = 0; i < elementsNumber; i++) {
            var tvName = tvNames[i];
            console.log('for tvName: ' + tvName);
            promiseArray.push(powerSet(tvName, powerState));
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
