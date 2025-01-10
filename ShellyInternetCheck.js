/*
Created by Leivo Sepp, 2025
Licensed under the MIT License
https://github.com/LeivoSepp/Shelly-Internet-Check

This Shelly script monitors the internet connectivity 
and performs an off-on cycle on the relay if the connection is lost for a specified number of checks.

The main purpose of this script is to connect your internet router through the Shelly device 
and automatically reboot the router if the internet connection is down. 
*/

const checkInterval = 10; //10 minutes between checks
const cyclesBeforeAction = 6; //6 x 10 = 1h to perform Shelly relay off-on
const relayId = 0; //Relay ID to control the external device power supply

const scriptId = Shelly.getCurrentScriptId();
let isShellyTimeOk = false;
let counter = 0;
/* set the script to sart automatically on boot */
function setAutoStart() {
    if (!Shelly.getComponentConfig("script", scriptId).enable) {
        Shelly.call('Script.SetConfig', { id: scriptId, config: { enable: true } },
            function (res, err, msg, data) {
                if (err != 0) {
                    console.log("Internet check autostart is not enabled.", msg, ". After Shelly restart, this script will not check internet connectivity.");
                }
            });
    }
}

//check Shelly time
function checkShellyTime() {
    const shEpochUtc = Shelly.getComponentStatus("sys").unixtime;
    print("Shelly", new Date(shEpochUtc * 1000));
    if (shEpochUtc > 0) {
        isShellyTimeOk = true;
        counter = 0;
    } else {
        counter++;
        print("counter:", counter);
        if (counter >= cyclesBeforeAction) {
            counter = 0;
            actionAfterCycles();
        }
        return;
    }
}

//action after checking Shelly time for a number of cycles
function actionAfterCycles() {
    // perform power off and on
    Shelly.call("Switch.Set", { id: relayId, on: false, toggle_after: 2 });
}

//execute the checkShellyTime when the script starts
setAutoStart();
checkShellyTime();
//start loop-timer to check Shelly time 
Timer.set(1000 * 60 * checkInterval, true, checkShellyTime);