# MMM-Rugby

A [MagicMirror²](https://magicmirror.builders) module to display Rugby data.

[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](LICENSE)

## About Module

This module will get the current World Rugby Rankings. A selection of Rugby Leaqgues can be configures to be dispalyed as a second table. This is past matches and results and upcoming matches.

## Examples

THe module will always return the World Rankings by default and the selected Rugby League data on the second table
### World Rankings
![Example](images/screenshot.png)

### World Rugby Union
![Example](images/screenshot-2.png)

### Woman's Seven Series
![Example](images/screenshot-3.png)

### Men's Seven Series
![Example](images/screenshot-4.png)

### Junior Rugby Series
![Example](images/screenshot-5.png)

## Dependencies
- "luxon": "^3.4.4",
- "node-fetch": "^2.6.1"
## Installation

In your terminal, go to your MagicMirror's Module folder:
````
cd ~/MagicMirror/modules
````

Clone this repository:
````
git clone https://github.com/mumblebaj/MMM-Rugby.git
````
````
cd MMM-Rugby
npm install
````

Add the module to the modules array in the `config/config.js` file:
````javascript
    {
        module: "MMM-Rugby",
        position: "top_right",
        disabled: false,
                config: {
                        updateInterval: 1000*60*60*24,
                        rotateInterval: 60000,
                        sport: "mru",
                        rankingLimit: 10,
                        matchesLimit: 10,
                        matchesOlderThan: 7
                }
    },
````
## Configuration Option

The following properties can be configured:


| Option                       | Description
| ---------------------------- | -----------
| `updateInterval`             | Intrval to refresh Data <br> **Default value:** `1000*60*60*24`. One Day <br> Best to set to a Weekly refresh rate.
| `rotateInterval`             | The Interval to rotate between the tables <br> **Default Value:** `60000` 1 minute
| `sport`                      | The Rugby League to get data for <br> **Possible values:** <br> `wrs`: Woman's Sevens Series 2024 <br> `mrs`: Mens Sevens Series 2024 <br> `jmu`: U20 Six Nations 2024 <br> `mru`: Includes a number of leagues <br> - Six Nations 2024 <br> - Rugby Europe International Chamionship 2024 <br> - Men's Internationals 2024 <br> - Rugby Europe Trophy 2024 <br> - Rugby Europe Conference 2024 <br> - Autumn Nations Series 2024 <br> - The Rugby Championship 2024
| `rankingLimit`               | The Number of Rankings to return for the World Rankings <br> **Default value:** `10`
| `matchesLimit`               | The number of matches to return. <br> **Default value:** `10`
| `matchesOlderThan`           | Will return only matches New than this specified number of days, i.e. if set to 7 will return matches older than current date - 7 and fill the number of matchesLimit with upcoming matches. <br> **Default value:** `7`

## Updating

To update the module do the following:

````
cd MMM-Rugby
git pull
npm install
````

## Changes

## Future Enhancements
- Option to select specific MRU Leagues only
- Enhance Display of the Matches table.

