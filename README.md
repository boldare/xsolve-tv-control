# About
Simple CLI APP for remote TV (Sony Bravia with Android TV) control.

# Requirements
## Node 8.X
Node 8.X is needed to run script. In case of Ubuntu you can install it using:
`curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -`
`sudo apt-get install -y nodejs`
## TV
### Visibility
TV must be visible (pingable) from the PC.
`ping some_tv_ip`
### Remote control
Remote control must be enabled on the TV and key must be set.
Go to `Settings` -> `Network` -> `Home network setup` -> `IP control`.
Set `Authentication` to `Normal and Pre-Shared Key` and set `Pre-Shared Key`.
Enable `Simple IP control` (not verified if it's needed too).

### ADB debugging
ADB debugging must be enabled.

Open `Settings` -> `About` and click multiple times on `Build informations` in .
Go to `Settings` -> `Developer options` and enable `ADB debugging`.

# Usage

## Help
Help may be displayed using `--help` option.
`node tv-cli.js --help`

## Select TV
It's possible to select specific TV or TVs using `--tv` option.
`node tv-cli.js --tv "tv name 1"`
`node tv-cli.js --tv "tv name 1" "tv name 2"`

To select all TVs `--all` option may be used.
`node tv-cli.js --all"`

## Turn on
You can turn on selected TV/TVs using `--poweron` option.
`node tv-cli.js --tv "tv name 1" --poweron`

## Turn off
You can turn off selected TV/TVs using `--poweroff` option.
`node tv-cli.js --tv "tv name 1" --poweroff`

## Run application
You can run specified application using --run option.
If application is added to `appconfig.js` application name may be used:
`node tv-cli.js --tv "tv name 1" "tv name 4" --run opera`

It's also possible to run applicaiton using package name:
`node tv-cli.js --tv "tv name 1" "tv name 4" --run com.opera.sdk.example`

## Run Youtube URL
You can play youtube url using `--yt` command:
`node tv-cli.js --all --yt "https://www.youtube.com/watch?v=G1IbRujko-A"`
