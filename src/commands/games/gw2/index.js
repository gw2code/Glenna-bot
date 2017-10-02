import { subCommands as helpText } from '../../help';
import { fractals, pvp, pve, wvw } from './daily';
import { agonyResistance, gear } from './guide';
import { apikeyAdd, apikeyShow, apikeyDelete } from './apikey';
import { raidBossStatus } from './raid';
import { raidCreate, raidJoin, raidLeave, raidDelete, raidShow } from './squad';

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

    if (command === 'agony' || command === 'ar') return agonyResistance();
    if (command === 'gear' || command === 'equip') return gear();

    return helpText(client, evt, 'gw2', lang);
  },
  apikey: (client, evt, suffix, lang) => {
    const command = suffix.toLowerCase().split(' ')[0];
    const key = suffix.toLowerCase().split(' ')[1];

    if (command === 'add') return apikeyAdd(client, evt, key);
    if (command === 'show') return apikeyShow(evt);
    if (command === 'delete') return apikeyDelete(evt);

    return helpText(client, evt, 'gw2', lang);
  },
  raid: (client, evt, suffix, lang) => {
    const keywords = suffix.toLowerCase().split(' ');
    const command = keywords[0];
    keywords.shift(); // remove first array item, because it's command, not keyword

    if (command === 'boss') return raidBossStatus(evt);
    if (command === 'create') return raidCreate(client, evt, keywords);
    if (command === 'join') return raidJoin(client, evt, keywords);
    if (command === 'backup') {
      keywords.push('backup');
      return raidJoin(client, evt, keywords);
    }
    if (command === 'leave') return raidLeave(client, evt);
    if (command === 'delete') return raidDelete(client, evt);
    if (command === 'show' || command === 'list') return raidShow(client, evt);

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
