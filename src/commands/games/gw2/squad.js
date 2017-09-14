import Promise from 'bluebird';
import nconf from 'nconf';
import { gw2_bosses } from '../../../data';

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const mongoUri = nconf.get('MONGODB_URI');
const guildId = nconf.get('GUILD_ID');

let raid = {};

// ====================================================
//   Create embed message
// ====================================================

let createEmbed = function() {
  // create embed object
  let embed = {
    title: 'Raid squad (beta)',
    description: 'If you want to participate and reserve place in squad, type `!raid join` in this channel. If squad is already full, you will be added to queue and I will send you direct message on Discord when someone leaves.',
    color: 13132124,
    author: {
      name: raid.commander.name,
      icon_url: 'https://wiki.guildwars2.com/images/5/5a/Commander_tango_icon_200px.png'
    },
    fields: []
  };

  let raidSquadString = '';
  let raidQueueString = '';
  let raidBackupString = '';

  // add people to squad
  if (raid.squad.length > 0) {
    let raidSquadCount = 0;

    raid.squad.forEach(function(raider) {
      if (raider.queue) {
        raidQueueString += raider.name + '\n';
      } else {
        raidSquadString += raider.name + '\n';
        raidSquadCount++;
      }
    });

    // regular squad
    if (raidSquadString !== '') {
      embed.fields.push({
        name: 'Squad (' + raidSquadCount + '/10)',
        value: raidSquadString,
        inline: true
      });
    }

    // queue
    if (raidQueueString !== '') {
      embed.fields.push({
        name: 'In-queue',
        value: raidQueueString,
        inline: true
      });
    }
  }

  // add backup people
  if (raid.backup.length > 0) {
    raid.backup.forEach(function(raider) {
      raidBackupString += raider.name + '\n';
    });

    if (raidBackupString !== '') {
      embed.fields.push({
        name: 'Backup',
        value: raidBackupString,
        inline: true
      });
    }
  }

  // add bosses we will do if specified
  if (raid.bosses.length > 0) {
    let bossesString = '';

    raid.bosses.forEach(function(bossId) {
      if (gw2_bosses.bosses[bossId].guide !== '') {
        // add boss name with link to guide
        bossesString += '[' + gw2_bosses.bosses[bossId].name + '](' + gw2_bosses.bosses[bossId].guide + ')' + '\n';
      } else {
        // add boss name without link
        bossesString += gw2_bosses.bosses[bossId].name + '\n';
      }
    });

    embed.fields.push({
      name: 'Bosses we will practice (check boss guide in link)',
      value: bossesString
    });
  }

  // list available commands
  let commands = [
    '`!raid join` - get yourself place in the squad',
    '`!raid backup` - sign up as backup',
    '`!raid leave` - remove yourself from the squad',
    '`!raid show` - move raid post to the end of channel'
  ];

  let commandsString = commands.join('\n');

  embed.fields.push({
    name: 'Available commands',
    value: commandsString
  });

  if (raidSquadString === '' || raidQueueString === '' || raidBackupString === '') {
    embed.thumbnail = {
      url: 'https://wiki.guildwars2.com/images/1/1f/Spirit_Vale_%28achievements%29.png'
    };
  }

  return embed;
};

// ====================================================
//   Get raid from database
// ====================================================

let getRaid = function(db, callback) {
  let raidInDatabase = db.collection('raids').findOne();

  raidInDatabase.then(function(result, err) {
    if (result) {
      raid = result;
      callback(true);
    } else {
      callback(false);
    }
  });
};

// ====================================================
//   Delete raid post from discord channel
// ====================================================

let removeRaidPost = function(client, db, callback) {
  let discordPost = raid.discordPost;

  let removeRaidPostFromDtb = function() {
    db.collection('raids').updateOne(
      {}, // empty filter means update first (and only) raid
      {
        $set: {
          discordPost: null
        }
      },
      {upsert: true}, function(err, result) {
        assert.equal(err, null);
        client.Messages.deleteMessage(discordPost.id, discordPost.channel);
        console.log('Post ID removed from database record.');
        callback();
      });
  };

  MongoClient.connect(mongoUri, function(err, db) {
    assert.equal(null, err);
    removeRaidPostFromDtb(db, function() {
      db.close();
      return Promise.resolve();
    });
  });
};

// ====================================================
//   Post raid message to Discord server channel
// ====================================================

let postRaidToDiscord = function(client, evt) {
  // send message
  let sendMessage = function(embed) {
    let discordPost = raid.discordPost;
    if (discordPost) {
      // edit existing message
      client.Messages.editMessage('', discordPost.id, discordPost.channel, embed);
    } else {
      // post new message and add its ID to raid record in database
      let raidPost = evt.message.channel.sendMessage('', false, embed);

      raidPost.then(function(message, err) {
        let postId = message.id;
        let postChannel = message.channel_id;

        let insertPostId = function(db, callback) {
          db.collection('raids').updateOne(
            {}, // empty filter means update first (and only) raid
            {
              $set: {
                discordPost: {
                  id: postId,
                  channel: postChannel
                }
              }
            },
            {upsert: true}, function(err, result) {
              assert.equal(err, null);
              console.log('Post ID inserted into database record.');
              callback();
            });
        };

        MongoClient.connect(mongoUri, function(err, db) {
          assert.equal(null, err);
          insertPostId(db, function() {
            db.close();
            return Promise.resolve();
          });
        });
      });
    }
  };

  MongoClient.connect(mongoUri, function(err, db) {
    assert.equal(null, err);
    getRaid(db, function(raidActive) {
      db.close();
      if (raidActive) {
        let embed = createEmbed();
        sendMessage(embed);
      } else {
        evt.message.channel.sendMessage('Raid squad is not opened yet! Please wait');
      }
    });
  });
};

// ====================================================
//   Create raid squad and insert it into database
// ====================================================

export function raidCreate(client, evt, keywords) {
  const guild = client.Guilds.find(g => g.id === guildId); // use guild discord ID
  let member = guild.members.find(m => m.id === evt.message.author.id); // get guild member

  let bosses = [];

  // parse keywords from input
  for (var i = 0; i < keywords.length; i++) {
    // search for bosses
    if (keywords[i] in gw2_bosses.dictionary) {
      let bossId = gw2_bosses.dictionary[keywords[i]];
      // avoid duplicates
      if (bosses.indexOf(bossId) === -1) {
        bosses.push(bossId);
      }
    }
  }

  let insertRaid = function(db, callback) {
    db.collection('raids').insertOne({
      commander: {
        id: member.id,
        name: member.nick || member.username
      },
      discordPost: null,
      squad: [
        {
          id: member.id,
          name: member.nick || member.username,
          queue: false
        }
      ],
      backup: [],
      bosses: bosses
    }, function(err, result) {
      assert.equal(err, null);
      console.log('Success - new raid in database!');
      callback();
    });
  };

  MongoClient.connect(mongoUri, function(err, db) {
    assert.equal(null, err);
    getRaid(db, function(raidExists) {
      if (raidExists) {
        evt.message.channel.sendMessage('There is already active raid! You can have only 1 raid at the time. Please delete previous one with `!raid delete` if you want to make new one (only raid commander or council member can do this).');
      } else {
        insertRaid(db, function() {
          db.close();
          // post message to discord
          postRaidToDiscord(client, evt);
          // evt.message.channel.sendMessage('@Raiders you can sign up for raid!');
          return Promise.resolve();
        });
      }
    });
  });
}

// ====================================================
//   Removes all raid squads from database
// ====================================================

export function raidDelete(client, evt) {
  // send "typing"
  evt.message.channel.sendTyping();

  // function that checks permissions to delete raid (commander or council)
  let canDeleteRaid = function() {
    // check commander
    let isCommander = raid.commander.id === evt.message.author.id;

    // check council
    const guild = client.Guilds.find(g => g.id === guildId); // use guild discord ID
    let member = guild.members.find(m => m.id === evt.message.author.id); // get guild member
    let isCouncil = member.roles.find(r => r.name === 'Lunar Ascended');

    return (isCommander || isCouncil);
  };

  let deleteRaid = function(db, callback) {
    db.collection('raids').deleteMany({},
      function(err, result) {
        assert.equal(err, null);
        callback();
      });
  };


  MongoClient.connect(mongoUri, function(err, db) {
    assert.equal(null, err);
    getRaid(db, function(raidExists) {
      // check if raid exists
      if (raidExists) {
        // check permissions to delete raid
        if (canDeleteRaid()) {
          deleteRaid(db, function() {
            db.close();
            evt.message.channel.sendMessage('Raid was successfully removed!');
            return Promise.resolve();
          });
        } else {
          evt.message.channel.sendMessage('Only raid commander or council member can delete existing raid!');
        }
      } else {
        evt.message.channel.sendMessage('Raid squad is not opened yet! Please wait');
        return Promise.resolve();
      }
    });
  });
}

// ====================================================
//   Join existing raid
// ====================================================

export function raidJoin(client, evt, keywords) {
  const guild = client.Guilds.find(g => g.id === guildId); // use guild discord ID
  let member = guild.members.find(m => m.id === evt.message.author.id); // get guild member

  let isBackup = keywords.includes('backup');

  let addRaiderToSquad = function(db, callback) {
    // decide where to put raider
    let msg = '';
    let isQueue = false;
    let request = {};

    if (isBackup) {
      request = {
        $addToSet: {
          backup: {
            id: member.id,
            name: member.nick || member.username,
            queue: isQueue
          }
        }
      };
    } else {
      if (raid.squad.length >= 10) {
        isQueue = true;
        msg = 'Sorry, raid squad is already full so I added you into queue. When there will be free spot in squad I will send you direct message on Discord!';
      }
      request = {
        $addToSet: {
          squad: {
            id: member.id,
            name: member.nick || member.username,
            queue: isQueue
          }
        }
      };
    }

    db.collection('raids').updateOne(
      {}, // empty filter means update first (and only) raid  $addToSet
      request,
      {upsert: true}, function(err, result) {
        assert.equal(err, null);
        callback(msg);
      });
  };

  MongoClient.connect(mongoUri, function(err, db) {
    assert.equal(null, err);

    getRaid(db, function(raidExists) {
      if (raidExists) {
        let raiderInSquad = raid.squad.find(squadRaider => squadRaider.id === member.id);
        let raiderInBackup = raid.backup.find(backupRaider => backupRaider.id === member.id);

        if (raiderInSquad || raiderInBackup) {
          evt.message.channel.sendMessage(evt.message.author.mention + ' You are already in squad... :expressionless:');
        } else {
          addRaiderToSquad(db, function(msg) {
            db.close();
            postRaidToDiscord(client, evt);
            if (msg !== '') {
              // evt.message.channel.sendMessage(evt.message.author.mention + ' ' + msg);
              client.Users.get(member.id).openDM().then(dm => dm.sendMessage(msg));
            }
            evt.message.addReaction('\uD83D\uDC4C'); // add :ok_hand: reaction as comfirmation
            return Promise.resolve();
          });
        }
      } else {
        db.close();
        evt.message.channel.sendMessage('Raid squad is not opened yet! Please wait');
      }
    });
  });
}

// ====================================================
//   Leave existing raid
// ====================================================

export function raidLeave(client, evt) {
  // send "typing"
  evt.message.channel.sendTyping();
  let msg;

  let removeRaiderFromSquad = function(db, callback) {
    // function to remove raider in dtb
    let removeRaider = function(group) {
      msg = 'You have been unlisted from raid. Pfff... filthy casual :rolling_eyes:';

      if (group === 'squad') {
        db.collection('raids').updateOne(
        {}, // empty filter means update first (and only) raid
          {
            $pull: {
              squad: {
                id: evt.message.author.id
              }
            }
          },
        {multi: true}, function(err, result) {
          assert.equal(err, null);
          console.log('Raider removed from the squad');
          callback(msg);
        });
      } else {
        db.collection('raids').updateOne(
        {}, // empty filter means update first (and only) raid
          {
            $pull: {
              backup: {
                id: evt.message.author.id
              }
            }
          },
        {multi: true}, function(err, result) {
          assert.equal(err, null);
          console.log('Raider removed from the squad');
          callback(msg);
        });
      }
    };

    // promote raider from queue to regular squad
    let promoteRaider = function(db, raider, call) {
      db.collection('raids').updateOne(
        {
          'squad.id': raider.id
        },
        {
          $set: {
            'squad.$.queue': false
          }
        },
        {multi: true}, function(err, result) {
          assert.equal(err, null);
          client.Users.get(raider.id).openDM().then(dm => dm.sendMessage('There was free spot in raid squad so you are no longer in queue! Congratz!'));
          call();
        });
    };

    // check if raider is in squad
    let raiderInSquad = raid.squad.find(squadRaider => squadRaider.id === evt.message.author.id);
    let raiderInBackup = raid.backup.find(backupRaider => backupRaider.id === evt.message.author.id);

    if (raiderInSquad) {
      // make room for possible raider in queue
      let promotedRaider = raid.squad.find(squadRaider => squadRaider.queue === true);

      if (!raiderInSquad.queue && promotedRaider) {
        promoteRaider(db, promotedRaider, function() {
          removeRaider();
        });
      } else {
        // just remove raider from queue squad
        removeRaider('squad');
      }
    } else if (raiderInBackup) {
      removeRaider('backup');
    } else {
      msg = 'You are not even in squad.... how can I remove you? :laughing:';
      callback(msg);
    }
  };

  MongoClient.connect(mongoUri, function(err, db) {
    assert.equal(null, err);

    getRaid(db, function(raidExists) {
      if (raidExists) {
        removeRaiderFromSquad(db, function(msg) {
          db.close();
          postRaidToDiscord(client, evt);
          evt.message.channel.sendMessage(evt.message.author.mention + ' ' + msg);
          return Promise.resolve();
        });
      } else {
        db.close();
        evt.message.channel.sendMessage('Raid squad is not opened yet! Please wait');
      }
    });
  });
}

// ====================================================
//   Show current raid squad
// ====================================================

export function raidShow(client, evt) {
  // send "typing"
  evt.message.channel.sendTyping();

  MongoClient.connect(mongoUri, function(err, db) {
    assert.equal(null, err);

    getRaid(db, function(raidExists) {
      if (raidExists) {
        // remove previous post
        removeRaidPost(client, db, function() {
          db.close();
          // make new post
          postRaidToDiscord(client, evt);
          return Promise.resolve();
        });
      } else {
        evt.message.channel.sendMessage('Raid squad is not opened yet! Please wait');
        return Promise.resolve();
      }
    });
  });
}

export default {
  raidCreate,
  raidDelete,
  raidJoin,
  raidLeave,
  raidShow
};

export const help = {
  raid: {}
};
