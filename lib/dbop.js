var dblib = require('./db');

var host = 'debian6';
var port = 27017;
var collection = new dblib.CollectionProvider(new dblib.DBProvider(host, port));

var formatId = function(id) {
   return collection.user.db.bson_serializer.ObjectID.createFromHexString(id);
};

var cb = function(err, result, callback) {
  if (!callback)
    return;
  if (err)
    callback(err);
  else
    callback(null, result);
};

var user_create = function(uid, callback) {
  var now = new Date();
  collection.user.insert({uid: uid,
                  empno: undefined,
                  realname: undefined,
                  email: uid + '@corp.netease.com',
                  mobile: undefined,
                  sshkey: undefined,
                  created_at: now,
                  updated_at: now}, cb(callback));
};

var user_update = function(_id, info, callback) {
  info.updated_at = new Date();
  collection.user.update({_id: formatId(_id)}, {$set: info}, cb(callback));
};

var user_findOne = function(_id, callback) {
  collection.user.findOne({_id: formatId(_id)}, cb(callback));
};

var user_find = function(cond, callback) {
  collection.user.find(cond).toArray(cb(callback));
};

exports.collection = collection;
exports.user_create = user_create;
exports.user_update = user_update;
exports.user_findOne = user_findOne;
exports.user_find = user_find;
