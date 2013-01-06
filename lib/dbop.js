var dblib = require('./db');

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
                  sshkey: undefined,
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
