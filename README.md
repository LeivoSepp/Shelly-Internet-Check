# Shelly Internet Check

This Shelly script monitors the internet connectivity and performs an off-on cycle on the relay if there is no internet connection for a specified number of checks.

The main purpose of this script is to connect your internet router through the Shelly device and automatically reboot the router if the internet connection is down. 

## Features

- Periodic internet connectivity checks.
- Performs Shelly relay off-on cycle after a specified number of failed internet checks.
- Script automatically starts on boot.

## Installation

1. Copy the contents of `ShellyInternetCheck.js` to your Shelly device's script editor.
2. Configure the following settings:
   - `numberOfFails`: Set the number of cycles to check before Shelly relay performs off-on cycle
   - `pingTime`: Choose the interval beween checking the Shelly time, default 10 minutes.
   - `relayId`: Shelly relayID to control the external device power supply

## Author

Modified by Leivo Sepp, 10.01.2025

[GitHub Repository](https://github.com/LeivoSepp/Shelly-Internet-Check)

Inspired by this project: [ALLTERCO/shelly-script-examples](https://github.com/ALLTERCO/shelly-script-examples/blob/main/router-watchdog.js)

