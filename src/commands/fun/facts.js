import Promise from 'bluebird';

const request = Promise.promisify(require('request'));

function fact(client, evt, suffix, lang) {
  evt.message.channel.sendTyping();

  if (suffix === 'cat' || suffix === 'cate' || suffix === 'cats') {
    const options = {
      method: 'GET',
      url: 'http://catfacts-api.appspot.com/api/facts',
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
}

export default {
  fact,
  catfact: fact
};

export const help = {
  fact: {
    parameters: ['text']
  }
};
