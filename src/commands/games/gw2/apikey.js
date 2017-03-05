import Promise from 'bluebird';
import nconf from 'nconf';

// const request = Promise.promisify(require('request'));

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const ObjectId = require('mongodb').ObjectID;
const mongoUri = nconf.get('MONGODB_URI');

// ====================================================
//   Add key to database (create user if doesnt exist)
// ====================================================

export function apikeyAdd(client, evt, key) {
  let insertKey = function(db, callback) {
    db.collection('users').updateOne({
      discord_id: evt.message.author.id // select by message author discord ID
    },
      {
        $set: {
          discord_name: evt.message.author.username,
          discord_id: evt.message.author.id,
          apikey: key
        }
      },
      {upsert: true}, function(err, result) {
        assert.equal(err, null);
        console.log('Inserted a document into the users collection.');
        callback();
      });
  };

  MongoClient.connect(mongoUri, function(err, db) {
    assert.equal(null, err);
    insertKey(db, function() {
      db.close();
      evt.message.channel.sendMessage('API key successfully added! Your new API key is: ' + key);
      return Promise.resolve();
    });
  });
}

// ===================================
//   Show your API key from database
// ===================================

export function apikeyShow(evt) {
  // send "typing"
  evt.message.channel.sendTyping();

  let getKey = function(db, callback) {
    let user = db.collection('users').find({discord_id: evt.message.author.id});
    let msg = 'I don\'t have your API key stored yet. Please use `!apikey add [your-API-key]` first!';

    user.each(function(err, doc) {
      assert.equal(err, null);

      if (doc != null) {
        if (doc.apikey != null) {
          msg = 'Your API key is: ' + doc.apikey;
        }
        callback(msg);
      }
    });
  };

  return MongoClient.connect(mongoUri, function(err, db) {
    assert.equal(null, err);
    return getKey(db, function(msg) {
      db.close();
      evt.message.channel.sendMessage(msg);
      return Promise.resolve();
    });
  });
}

// =====================================
//   Delete your API key from database
// =====================================

export function apikeyDelete(evt) {
  // send "typing"
  evt.message.channel.sendTyping();

  let deleteKey = function(db, callback) {
    db.collection('users').updateOne({
      discord_id: evt.message.author.id // select by message author discord ID
    },
      {
        $unset: {
          apikey: ''
        }
      },
      function(err, result) {
        assert.equal(err, null);
        callback();
      });
  };

  MongoClient.connect(mongoUri, function(err, db) {
    assert.equal(null, err);
    deleteKey(db, function() {
      db.close();
      evt.message.channel.sendMessage('Your API key was successfully removed!');
      return Promise.resolve();
    });
  });
}

export default {
  apikeyAdd,
  apikeyShow,
  apikeyDelete
};

export const help = {
  apikey: {}
};
