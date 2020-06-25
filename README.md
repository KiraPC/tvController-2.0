# tvController
An http nodejs server and client to control TV (just webOS is currently supported). It can be used with IFTTT to control the TV with Alexa and Google Assistant

## How to install
You first need to install nodejs (v >= 8.11) and npm. To do this, you can go to the official page of [node](https://nodejs.org/it/)

After the installation, open the shell (powershell on windows) and go to the project folder. Launch the command

```sh
$ npm install --production
```

You installed all the dependencies and are able to start the server.

## How to setup
You need to configure two file before starting the app. 

First of all, open with a text editor the file /config/index.js and set you webOS TV MACAddress (you can find it on the tv network settings or on your router) and if your TV has a static IP you can set it too, otherwise, the app will scan your local subnet to search a webOS TV connected. You can also configure a very basic auth.

Auth information and device info can be configured in environment variables in the format:
```sh
export DEVICES_USERS=<deviceId>::<user>::<pass>||<anotherDeviceId>::<anotherUser>::<anotherPass>||
export ENDPOINT=http://localhost:3000
export DEVICEID=test-device
export MACADDRESS=your-tv-mac-address
```

## How to test
Launch the command to start the server

```sh
$ node server
```

Launch the command to start the client
```sh
$ node client
```

Wait and check your TV. You should see a pop-up that ask you to authorize the app, click on OK.
If you see the log

```sh
ts: 2020-06-25 11:53:53.074 logLevel: INFO | EventType: NONE | message: Device test-device connected.
```
The client been able to connect correctly yo the server.

### Deploy
My suggestion is to deploy the server on some cloud host with free tier like Heroku (it is simple and fast).

After deploying it on cloud, change the endpoint variable and your client can intercact with your server.

If you configure IFTT, as described in next section, to interact with your server you can control your tv with your virtual assistant.

## How to configure IFTT
Create an account on the service following the [link](https://ifttt.com/join) then start to [create your applet](https://ifttt.com/create). Some examples below (in Italian, you can change in your preferred language):


```sh
Trigger: Google Assistant
Trigger Options:
    - voice_input_1: Metti TV su canale \#
    - voice_input_2: Metti canale \#
    - voice_input_3: 
    - response: OK, metto TV su canale \#
    - languages: it

Action: Webhooks
Action Options:
    - url: http://your-public-host.you/channel/{{NumberField}}
    - body: { "username": "<username>", "password": "<password>" }
    - content_type: application/json
    - method: PUT
```

```sh
Trigger: Google Assistant
Trigger Options:
    - voice_input_1: Metti volume a \# su TV
    - voice_input_2: Metti volume a \#
    - voice_input_3: Volume a \# su TV
    - response: Ok
    - languages: it

Action: Webhooks
Action Options:
    - url: http://your-public-host.you/volume/{{NumberField}}
    - body: { "username": "<username>", "password":"<password>" }
    - content_type: application/json
    - method: PUT
```

```sh
Trigger: Google Assistant
Trigger Options:
    - voice_input_1: Alza il volume della TV
    - voice_input_2: Aumenta il volume della TV
    - voice_input_3: 
    - response: Ok, alzo il volume
    - languages: it

Action: Webhooks
Action Options:
    - url: http://your-public-host.you/volumeUp
    - body: { "username": "<username>", "password": "<password>" }
    - content_type: application/json
    - method: PUT
```

```sh
Trigger: Google Assistant
Trigger Options:
    - voice_input_1: Abbassa il volume della TV
    - voice_input_2: Abbassa volume TV
    - voice_input_3: 
    - response: Ok, abbasso il volume
    - languages: it

Action: Webhooks
Action Options:
    - url: http://your-public-host.you/volumeDown
    - body: { "username": "<username>", "password": "<password>" }
    - content_type: application/json
    - method: PUT
```

```sh
Trigger: Google Assistant
Trigger Options:
    - voice_input_1: Apri lista canali su TV
    - voice_input_2: Metti lista canali su TV
    - voice_input_3: Metti TV su lista canali
    - response: Ok, apro lista canali
    - languages: it

Action: Webhooks
Action Options:
    - url: http://your-public-host.you/channelList
    - body: { "username": "<username>", "password": "<password>" }
    - content_type: application/json
    - method: PUT
```
