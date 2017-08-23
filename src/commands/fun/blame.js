import Promise from 'bluebird';

import { rob } from '../../data';


function blame(client, evt, suffix, lang) {
  const rand = Math.floor(Math.random() * rob.length);
  let robQuote = `${rob[rand]}`;
  let selfQuote = robQuote.replace(/Rob/gi, evt.message.author.username);
  return Promise.resolve(selfQuote);
}

export default {
  blame
};

export const help = {
  blame: {
    parameters: ['']
  }
};
