import Promise from 'bluebird';

// const request = Promise.promisify(require('request'));

// ================
//  Agony Resistance
// ================

export function agonyResistance() {
  return Promise.resolve('Wanna do some high fractals, huh? You will need Agony Resistance (AR) to survive! This is an example how to get 150 AR efficiently: http://i.imgur.com/7PaJF9X.png');
}

export default {
  agonyResistance,
  agony: agonyResistance,
  ar: agonyResistance
};

export const help = {
  agonyResistance: {}
};
