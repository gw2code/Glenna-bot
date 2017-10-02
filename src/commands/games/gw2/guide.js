import Promise from 'bluebird';

// const request = Promise.promisify(require('request'));

// ================
//  Agony Resistance
// ================

export function agonyResistance() {
  return Promise.resolve('Wanna do some high fractals, huh? You will need Agony Resistance (AR) to survive! This is an example how to get 150 AR efficiently: http://i.imgur.com/7PaJF9X.png');
}

// ================
//  Gear
// ================

export function gear() {
  return Promise.resolve('Here you can find all info about gearing your character -> https://wiki.guildwars2.com/wiki/User:Tanetris/So_You_Want_To_Gear_a_Character');
}

export default {
  agonyResistance,
  agony: agonyResistance,
  ar: agonyResistance,
  gear,
  equip: gear,
  gearing: gear
};

export const help = {
  agonyResistance: {}
};
