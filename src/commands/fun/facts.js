import Promise from 'bluebird';

const request = Promise.promisify(require('request'));

function fact(client, evt, suffix, lang) {
  evt.message.channel.sendTyping();

  let apiUrl = '';

  switch (suffix) {
    case 'cat':
    case 'cate':
    case 'cats':
      apiUrl = 'http://catfacts-api.appspot.com/api/facts';
      break;
    case 'dog':
    case 'dogo':
    case 'doge':
    case 'pug':
    case 'dogs':
      apiUrl = 'https://dog-api.kinduff.com/api/facts';
      break;
    default:
      return Promise.resolve('Sorry, I don\'t know any facts about ' + suffix + ' :neutral_face');
  }

  const options = {
    method: 'GET',
    url: apiUrl,
    json: true,
    qs: {
      format: 'json'
    }
  };

  return request(options)
    .then(response => {
      return Promise.resolve(response.body.facts);
    });
}

export default {
  fact
};

export const help = {
  fact: {
    parameters: ['text']
  }
};
