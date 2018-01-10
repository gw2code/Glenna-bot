import Promise from 'bluebird';
import nconf from 'nconf';

const request = Promise.promisify(require('request'));
const raidBossUrl = 'https://api.guildwars2.com/v2/account/raids?access_token=';
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const ObjectId = require('mongodb').ObjectID;
const mongoUri = nconf.get('MONGODB_URI');

let apiKey = null;

// ==============================
//  Weekly raid boss kill status
// ==============================

export function raidBossStatus(evt) {
  // send "typing"
  evt.message.channel.sendTyping();

  // =======================
  //  Get API key function
  // =======================

  let getKey = function(db, callback) {
    let user = db.collection('users').find({discord_id: evt.message.author.id});

    user.each(function(err, doc) {
      assert.equal(err, null);

      if (doc != null) {
        if (doc.apikey != null) {
          apiKey = doc.apikey;
          callback();
        } else {
          evt.message.channel.sendMessage('I don\'t have your API key stored yet. Please use `!apikey add [your-API-key]` first!');
        }
      }
    });
  };

  // =======================
  //  Get bosses from API
  // =======================

  let getBosses = function() {
    const opt = {
      method: 'GET',
      url: raidBossUrl + apiKey,
      json: true,
      qs: {
        format: 'json'
      }
    };

    return request(opt)
      .then(response => {
        let bossesKilled = response.body;
        let spiritVale = '';
        let salvationPass = '';
        let stronghold = '';
        let bastion = '';
        let hallOfChains = '';

        // spiritvale
        if (bossesKilled.includes('vale_guardian')) {
          spiritVale += '~~Vale Guardian~~\n';
        } else {
          spiritVale += 'Vale Guardian\n';
        }

        if (bossesKilled.includes('spirit_woods')) {
          spiritVale += '~~Spirit Woods~~\n';
        } else {
          spiritVale += 'Spirit Woods\n';
        }

        if (bossesKilled.includes('gorseval')) {
          spiritVale += '~~Gorseval~~\n';
        } else {
          spiritVale += 'Gorseval\n';
        }

        if (bossesKilled.includes('sabetha')) {
          spiritVale += '~~Sabetha~~';
        } else {
          spiritVale += 'Sabetha';
        }

        // Salvation Pass
        if (bossesKilled.includes('slothasor')) {
          salvationPass += '~~Slothasor~~\n';
        } else {
          salvationPass += 'Slothasor\n';
        }

        if (bossesKilled.includes('bandit_trio')) {
          salvationPass += '~~Bandit Trio~~\n';
        } else {
          salvationPass += 'Bandit Trio\n';
        }

        if (bossesKilled.includes('matthias')) {
          salvationPass += '~~Matthias Gabrel~~';
        } else {
          salvationPass += 'Matthias Gabrel';
        }

        // Stronghold
        if (bossesKilled.includes('escort')) {
          stronghold += '~~Escort~~\n';
        } else {
          stronghold += 'Escort\n';
        }

        if (bossesKilled.includes('keep_construct')) {
          stronghold += '~~Keep Construct~~\n';
        } else {
          stronghold += 'Keep Construct\n';
        }

        if (bossesKilled.includes('twisted_castle')) {
          stronghold += '~~Twisted Castle~~\n';
        } else {
          stronghold += 'Twisted Castle\n';
        }

        if (bossesKilled.includes('xera')) {
          stronghold += '~~Xera~~';
        } else {
          stronghold += 'Xera';
        }

        // Bastion
        if (bossesKilled.includes('cairn')) {
          bastion += '~~Cairn the Indomitable~~\n';
        } else {
          bastion += 'Cairn the Indomitable\n';
        }

        if (bossesKilled.includes('mursaat_overseer')) {
          bastion += '~~Mursaat Overseer~~\n';
        } else {
          bastion += 'Mursaat Overseer\n';
        }

        if (bossesKilled.includes('samarog')) {
          bastion += '~~Samarog~~\n';
        } else {
          bastion += 'Samarog\n';
        }

        if (bossesKilled.includes('deimos')) {
          bastion += '~~Deimos~~';
        } else {
          bastion += 'Deimos';
        }

        // Hall of Chains
        if (bossesKilled.includes('soulless_horror')) {
          hallOfChains += '~~Soulless Horror~~\n';
        } else {
          hallOfChains += 'Soulless Horror\n';
        }

        if (bossesKilled.includes('river_of_souls')) {
          hallOfChains += '~~River of Souls~~\n';
        } else {
          hallOfChains += 'River of Souls\n';
        }

        if (bossesKilled.includes('statues_of_grenth')) {
          hallOfChains += '~~Statues of Grenth~~\n';
        } else {
          hallOfChains += 'Statues of Grenth\n';
        }

        if (bossesKilled.includes('voice_in_the_void')) {
          hallOfChains += '~~Voice in the Void (Dhuum)~~';
        } else {
          hallOfChains += 'Voice in the Void (Dhuum)';
        }



        // Create embed object with message
        let embed = {
          description: 'Here you can see all the bosses and encounters you have completed this week. If you killed the boss, his name will appear ~~strikethrough~~',
          color: 15948331,
          timestamp: new Date(),
          footer: {
            icon_url: 'https://blogs-images.forbes.com/carolpinchefsky/files/2012/09/GuildWars2.jpg',
            text: 'Generated using GW2 API'
          },
          thumbnail: {
            url: 'https://wiki.guildwars2.com/images/5/5e/Legendary_Insight.png'
          },
          author: {
            name: 'Weekly boss kill status',
            url: 'https://discordapp.com',
            icon_url: 'https://wiki.guildwars2.com/images/5/5e/Legendary_Insight.png'
          },
          fields: [
            {
              name: 'Spirit Vale',
              value: spiritVale,
              inline: true
            },
            {
              name: 'Salvation Pass',
              value: salvationPass,
              inline: true
            },
            {
              name: 'Stronghold of the Faithful',
              value: stronghold,
              inline: true
            },
            {
              name: 'Bastion of the Penitent',
              value: bastion,
              inline: true
            },
            {
              name: 'Hall of Chains',
              value: hallOfChains,
              inline: true
            }
          ]
        };

        evt.message.channel.sendMessage('', false, embed);
        return Promise.resolve();
      });
  };

  MongoClient.connect(mongoUri, function(err, db) {
    assert.equal(null, err);
    getKey(db, function() {
      db.close();

      if (apiKey != null) {
        getBosses();
      }
    });
  });
}


export default {
  raidBossStatus
};

export const help = {
  boss: {}
};
