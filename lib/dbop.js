var dblib = require('./db');
var _ = require('underscore');

var host = 'debian6';
var port = 27017;
var collection = new dblib.CollectionProvider(new dblib.DBProvider(host, port));

var formatId = function(id) {
   return collection.user.db.bson_serializer.ObjectID.createFromHexString(id);
};

// user
var user_create = function(uid, callback) {
  var now = new Date();
  collection.user.insert({uid: uid,
                  avatar: undefined,
                  empno: undefined,
                  realname: undefined,
                  email: uid + '@corp.netease.com',
                  mobile: undefined,
                  homepage: undefined,
                  state: 'actived',
                  created_at: now,
                  updated_at: now}, callback);
};

var user_update = function(_id, info, callback) {
  info.updated_at = new Date();
  collection.user.update({_id: _id}, {$set: info}, callback);
};

var user_findOne = function(_id, callback) {
  collection.user.findOne({_id: _id}, function(err, result) {
    if (err) callback(err);
    else callback(null, result);
  });
};

var user_find = function(cond, callback) {
  collection.user.find(cond).sort({_id:-1}).toArray(function(err, result) {
    if (err) callback(err);
    else callback(null, result);
  });
};

// repos
var repo_create = function(name, description, owner, callback) {
  var now = new Date();
  collection.repos.insert({name: name,
                  description: description,
                  isPrivate: false,
                  owner: owner,
                  state: 'pending',
                  collaborators: [],
                  created_at: now,
                  updated_at: now}, callback);
};

var repo_update = function(_id, info, callback) {
  info.updated_at = new Date();
  collection.repos.update({_id: _id}, {$set: info}, callback);
};

var repo_findOne = function(_id, callback) {
  collection.repos.findOne({_id: _id}, function(err, result) {
    if (err) callback(err);
    else callback(null, result);
  });
};

var repo_find = function(cond, callback) {
  collection.repos.find(cond).sort({_id:-1}).toArray(function(err, result) {
    if (err) callback(err);
    else callback(null, result);
  });
};

// sshkeys
var sshkey_create = function(owner, title, key, spec, callback) {
  collection.sshkey.insert({owner: owner,
                             title: title,
                             key: key,
                             spec: spec,
                             created_at: new Date()}, callback);
};

var sshkey_delete = function(owner_id, _id, callback) {
  collection.sshkey.remove({_id: _id, "owner._id": owner_id}, callback);
};

var sshkey_findOne = function(_id, callback) {
  collection.sshkey.findOne({_id: _id}, function(err, result) {
    if (err) callback(err);
    else callback(null, result);
  });
};

var sshkey_find = function(cond, callback) {
  collection.sshkey.find(cond).sort({_id:-1}).toArray(function(err, result) {
    if (err) callback(err);
    else callback(null, result);
  });
};

// recent
var user_findRecent = function(count, callback) {
  collection.user.find().sort({_id:-1}).limit(count).toArray(function(err, result) {
    if (err) callback(err);
    else callback(null, result);
  });
};

var repo_findRecent = function(count, callback) {
  collection.repos.find().sort({_id:-1}).limit(count).toArray(function(err, result) {
    if (err) callback(err);
    else callback(null, result);
  });
};

// count
var user_count = function(callback) {
  collection.user.find().count(function(err, result) {
    if (err) callback(err);
    else callback(null, result);
  });
};

var repo_count = function(callback) {
  collection.repos.find().count(function(err, result) {
    if (err) callback(err);
    else callback(null, result);
  });
};

//
var get_all_repo_devs = function(callback) {
  collection.repos.find({}, {name: 1,
                             owner: 1,
                             'collaborators.person': 1}
                       ).sort({_id:-1}).toArray(function(err, result) {
    if (err) return callback(err);

    var data = _.map(result, function(i) {
      var d = {_id: i._id.toString(),
               name: i.name,
               owner_uid: i.owner.uid,
               devs:[i.owner._id.toString()]};
      _.each(i.collaborators, function(j) {
        d.devs.push(j.person._id.toString());
      });
      return d;
    });
    callback(null, data);
  });
};

//
exports.formatId = formatId;
exports.collection = collection;
exports.user_create = user_create;
exports.user_update = user_update;
exports.user_findOne = user_findOne;
exports.user_find = user_find;

exports.repo_create = repo_create;
exports.repo_update = repo_update;
exports.repo_findOne = repo_findOne;
exports.repo_find = repo_find;

exports.sshkey_create = sshkey_create;
exports.sshkey_delete = sshkey_delete;
exports.sshkey_findOne = sshkey_findOne;
exports.sshkey_find = sshkey_find;

exports.repo_findRecent = repo_findRecent;
exports.user_findRecent = user_findRecent;
exports.repo_count = repo_count;
exports.user_count = user_count;

exports.get_all_repo_devs = get_all_repo_devs;
