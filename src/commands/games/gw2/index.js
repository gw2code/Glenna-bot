import { subCommands as helpText } from '../../help';
import { fractals, pvp, pve, wvw } from './daily';
import { agonyResistance } from './guide';
import { apikeyAdd, apikeyShow, apikeyDelete } from './apikey';

export default {
  daily: (client, evt, suffix, lang) => {
    const command = suffix.toLowerCase().split(' ')[0];

    if (command === 'fractals') return fractals();
    if (command === 'pve') return pve();
    if (command === 'wvw') return wvw();
    if (command === 'pvp') return pvp();

    return helpText(client, evt, 'gw2', lang);
  },
  guide: (client, evt, suffix, lang) => {
    const command = suffix.toLowerCase().split(' ')[0];

    if (command === 'agony') return agonyResistance();
    if (command === 'ar') return agonyResistance();

    return helpText(client, evt, 'gw2', lang);
  },
  apikey: (client, evt, suffix, lang) => {
    const command = suffix.toLowerCase().split(' ')[0];
    const key = suffix.toLowerCase().split(' ')[1];

    if (command === 'add') return apikeyAdd(client, evt, key);
    if (command === 'show') return apikeyShow(evt);
    if (command === 'delete') return apikeyDelete(evt);

    return helpText(client, evt, 'gw2', lang);
  }
};

export const help = {
  daily: {
    category: 'games',
    header_text: 'gw2_header_text',
    subcommands: [
      {name: 'fractals'},
      {name: 'pve'},
      {name: 'wvw'},
      {name: 'pvp'}
    ]
  },
  guide: {
    category: 'games',
    header_text: 'gw2_header_text',
    subcommands: [
      {name: 'agony'}
    ]
  },
  apikey: {
    category: 'games',
    header_text: 'gw2_header_text',
    subcommands: [
      {name: 'add'},
      {name: 'show'},
      {name: 'delete'}
    ]
  }
};
