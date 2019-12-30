# tvController
An http nodejs server to control TV (just webOS is currently supported). It can be used with IFTTT to control the TV with Alexa and Google Assistant

## How to install
You first need to install nodejs (v >= 8.11) and npm. To do this, you can go to the official page of [node](https://nodejs.org/it/)

After the installation, open the shell (powershell on windows) and go to the project folder. Launch the command

```sh
$ npm install --production
```

You installed all the dependencies and are able to start the server.

## How to run
You need to configure two file before starting the app. 

First of all, open with a text editor the file /config/tv.json and set you webOS TV MACAddress (you can find it on the tv network settings or on your router) and if your TV has a static IP you can set it too, otherwise, the app will scan your local subnet to search a webOS TV connected.

The second file is regarding user info, if you wont to add the controller to an external service, you need to make pubblic your server, so I added a basic authentication, and just with username and password in the request body, you will be authorized to contact the server correctly. You can also disable it if not need.

Now, launch the command

```sh
$ node server.js
```

Wait and check your TV. You should see a pop-up that ask you to authorize the app, click on OK.

### Check if the server is up and running
On your browser go to

```sh
http://localhost:3000
```

If you are able to see `TV Controller`, your server is correctly started.

Now you need to make public your service. I mean, you need a public endpoint to be accessibile outside you local network.

Please, read some guides to get it. E.g. [link](https://www.howtogeek.com/66214/how-to-forward-ports-on-your-router/)

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
