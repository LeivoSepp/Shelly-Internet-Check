/*
Modified by Leivo Sepp, 2025
Inspired by this script: https://github.com/ALLTERCO/shelly-script-examples/blob/main/router-watchdog.js 
https://github.com/LeivoSepp/Shelly-Internet-Check

This Shelly script monitors the internet connectivity 
and performs an off-on cycle on the relay if there is no connection for a specified number of checks.

The main purpose of this script is to connect your internet router through the Shelly device 
and automatically reboot the router if the internet connection is down. 
*/

const CONFIG = {
    endpoints: [
        "https://global.gcping.com/ping",
        "https://us-central1-5tkroniexa-uc.a.run.app/ping",
    ],
    //number of failures that trigger the reset
    numberOfFails: 3,
    //time in seconds to retry a "ping"
    pingTime: 300, // 300s = 5mins 
    relayId: 0, //Relay ID to control the external device power supply

    //time in seconds after which the http request is considered failed
    httpTimeout: 10,
    //time in seconds for the relay to be off
    toggleTime: 5,
};

let endpointIdx = 0;
let failCounter = 0;
let pingTimer = null;

const scriptId = Shelly.getCurrentScriptId();

function setAutoStart() {
    if (!Shelly.getComponentConfig("script", scriptId).enable) {
        Shelly.call('Script.SetConfig', { id: scriptId, config: { enable: true } });
    }
}

function restartRelay() {
    // Toggle Shelly relay
    Shelly.call("Switch.Set", { id: CONFIG.relayId, on: false, toggle_after: CONFIG.toggleTime });
}

function pingEndpoints() {
    Shelly.call(
        "http.get",
        { url: CONFIG.endpoints[endpointIdx], timeout: CONFIG.httpTimeout },
        function (response, error_code, error_message) {
            //http timeout, magic number, not yet documented
            if (error_code === -114 || error_code === -104) {
                print("Failed to fetch ", CONFIG.endpoints[endpointIdx]);
                failCounter++;
                print("Rotating through endpoints");
                endpointIdx++;
                endpointIdx = endpointIdx % CONFIG.endpoints.length;
            } else {
                failCounter = 0;
                print("Ping success");
            }
            if (failCounter >= CONFIG.numberOfFails) {
                print("Too many fails, resetting...");
                failCounter = 0;
                Timer.clear(pingTimer);
                restartRelay();
                return;
            }
        }
    );
}

print("Start watchdog timer");
setAutoStart();
pingTimer = Timer.set(CONFIG.pingTime * 1000, true, pingEndpoints);

Shelly.addStatusHandler(function (status) {
    //is the component a switch
    if (status.name !== "switch") return;
    //is it the one with id 0
    if (status.id !== CONFIG.relayId) return;
    //does it have a delta.source property
    if (typeof status.delta.source === "undefined") return;
    //is the source a timer
    if (status.delta.source !== "timer") return;
    //is it turned on
    if (status.delta.output !== true) return;
    //start the loop to ping the endpoints again
    pingTimer = Timer.set(CONFIG.pingTime * 1000, true, pingEndpoints);
});