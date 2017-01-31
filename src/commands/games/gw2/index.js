import { subCommands as helpText } from '../../help';
import { fractals, pvp, pve, wvw } from './daily';

export default {
  daily: (client, evt, suffix, lang) => {
    const command = suffix.toLowerCase().split(' ')[0];

    if (command === 'fractals') return fractals();
    if (command === 'pve') return pve();
    if (command === 'wvw') return wvw();
    if (command === 'pvp') return pvp();

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
  }
};
