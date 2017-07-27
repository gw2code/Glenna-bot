import Promise from 'bluebird';

import { rob } from '../../data';


function blame(client, evt, suffix, lang) {
  const rand = Math.floor(Math.random() * rob.length);
  return Promise.resolve(`${rob[rand]}`);
}

export default {
  blame
};

export const help = {
  blame: {
    parameters: ['']
  }
};
