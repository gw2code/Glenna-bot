import Promise from 'bluebird';

const request = Promise.promisify(require('request'));
const achievsUrl = 'https://api.guildwars2.com/v2/achievements?ids=';

// ================
//  Daily Fractals
// ================

export function fractals() {
  const options = {
    method: 'GET',
    url: 'https://api.guildwars2.com/v2/achievements/categories/88',
    json: true,
    qs: {
      format: 'json'
    }
  };

  return request(options)
    .then(response => {
        // get names of achievements
      let achievs = '';
      for (var achievement in response.body.achievements) {
        achievs += response.body.achievements[achievement] + ',';
      }

      const opt = {
        method: 'GET',
        url: achievsUrl + achievs,
        json: true,
        qs: {
          format: 'json'
        }
      };

      return request(opt)
        .then(response => {
          let msg = '';

          for (var fractal in response.body) {
            msg += response.body[fractal].name + '\n';
          }

          return Promise.resolve('Here are daily fractals for today: ```' + msg + '```');
        });
    });
}

// ================
//  Daily PvE
// ================

export function pve() {
  const options = {
    method: 'GET',
    url: 'https://api.guildwars2.com/v2/achievements/daily',
    json: true,
    qs: {
      format: 'json'
    }
  };

  return request(options)
    .then(response => {
      // get names of achievements
      let achievs = '';

      for (var achiev in response.body.pve) {
        achievs += response.body.pve[achiev].id + ',';
      }

      const opt = {
        method: 'GET',
        url: achievsUrl + achievs,
        json: true,
        qs: {
          format: 'json'
        }
      };

      return request(opt)
        .then(response => {
          let msg = '';

          for (var fractal in response.body) {
            msg += response.body[fractal].name + '\n';
          }

          return Promise.resolve('Here are PvE daily for today: ```' + msg + '```');
        });
    });
}

// ================
//  Daily WvW
// ================

export function wvw() {
  const options = {
    method: 'GET',
    url: 'https://api.guildwars2.com/v2/achievements/daily',
    json: true,
    qs: {
      format: 'json'
    }
  };

  return request(options)
    .then(response => {
      // get names of achievements
      let achievs = '';

      for (var achiev in response.body.wvw) {
        achievs += response.body.wvw[achiev].id + ',';
      }

      const opt = {
        method: 'GET',
        url: achievsUrl + achievs,
        json: true,
        qs: {
          format: 'json'
        }
      };

      return request(opt)
        .then(response => {
          let msg = '';

          for (var fractal in response.body) {
            msg += response.body[fractal].name + '\n';
          }

          return Promise.resolve('Here are WvW daily for today: ```' + msg + '```');
        });
    });
}

// ================
//  Daily PvP
// ================

export function pvp() {
  const options = {
    method: 'GET',
    url: 'https://api.guildwars2.com/v2/achievements/daily',
    json: true,
    qs: {
      format: 'json'
    }
  };

  return request(options)
    .then(response => {
      // get names of achievements
      let achievs = '';

      for (var achiev in response.body.pvp) {
        achievs += response.body.pvp[achiev].id + ',';
      }

      const opt = {
        method: 'GET',
        url: achievsUrl + achievs,
        json: true,
        qs: {
          format: 'json'
        }
      };

      return request(opt)
        .then(response => {
          let msg = '';

          for (var fractal in response.body) {
            msg += response.body[fractal].name + '\n';
          }

          return Promise.resolve('Here are PvP daily for today: ```' + msg + '```');
        });
    });
}

export default {
  fractals,
  pvp,
  pve,
  wvw,
  dailyfractals: fractals,
  fracs: fractals
};

export const help = {
  fractals: {},
  pve: {},
  wvw: {},
  pvp: {}
};
