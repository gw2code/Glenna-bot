import Promise from 'bluebird';

import { drama as _drama, emoji as _emoji, quotes, what as _what } from '../../data';


function drama(client, evt, suffix) {
  const rand = Math.floor(Math.random() * _drama.length);
  if (suffix && suffix >= 0 && suffix <= (_drama.length - 1)) return Promise.resolve(_drama[suffix]);
  return Promise.resolve(_drama[rand]);
}

function emoji(client, evt, suffix) {
  const rand = Math.floor(Math.random() * _emoji.length);
  if (suffix && suffix >= 0 && suffix <= (_emoji.length - 1)) return Promise.resolve(_emoji[suffix]);
  return Promise.resolve(_emoji[rand]);
}

function quote(client, evt, suffix) {
  const rand = Math.floor(Math.random() * quotes.length);
  if (suffix && suffix >= 0 && suffix <= (quotes.length - 1)) return Promise.resolve(quotes[suffix]);
  return Promise.resolve(quotes[rand]);
}

function what(client, evt, suffix) {
  const rand = Math.floor(Math.random() * _what.length);
  if (suffix && suffix >= 0 && suffix <= (_what.length - 1)) return Promise.resolve(_what[suffix]);
  return Promise.resolve(_what[rand]);
}

export default {
  drama,
  emoji,
  emojis: emoji,
  quote,
  what,
  wut: what,
  wtf: what
};

export const help = {
  drama: {parameters: 'number'},
  emoji: {parameters: 'number'},
  quote: {parameters: 'number'},
  what: {parameters: 'number'}
};
