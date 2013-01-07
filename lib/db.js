var Db = require('mongodb').Db;
var Server = require('mongodb').Server;
var conf = require('./config');
//var ObjectID = require('mongodb').ObjectID;

DBProvider = function(host, port) {
  this.db = new Db(conf.store.db,
                   new Server(conf.store.host,
                              conf.store.port,
                              {auto_reconnect: true},
                              {}
                  ));
  this.db.open(function(){});
};

//getCollection
DBProvider.prototype.getCollection = function(collection) {
  return this.db.collection(collection);
};

CollectionProvider = function(db) {
  this.user = db.getCollection('user');
  this.repos = db.getCollection('repos');
  this.sshkey = db.getCollection('sshkey');
  this.test = db.getCollection('test');
};

exports.DBProvider = DBProvider;
exports.CollectionProvider = CollectionProvider;

/*
//findAll
UserProvider.prototype.findAll = function(callback) {
    this.getCollection(function(error, user_collection) {
      if( error ) callback(error)
      else {
        user_collection.find().toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};

//findById
UserProvider.prototype.findById = function(id, callback) {
    this.getCollection(function(error, user_collection) {
      if( error ) callback(error)
      else {
        user_collection.findOne({_id: user_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
          if( error ) callback(error)
          else callback(null, result)
        });
      }
    });
};

//update
UserProvider.prototype.update = function(user, callback) {
    this.getCollection(function(error, user_collection) {
      if( error ) callback(error)
      else {
        user_collection.update(user, function() {
          callback(null, users);
        });
      }
    });
};

//save
UserProvider.prototype.create = function(user, callback) {
    this.getCollection(function(error, user_collection) {
      if( error ) callback(error)
      else {
        user.created_at = new Date();
        user.updated_at = user.created_at;

        user_collection.insert(user, function() {
          callback(null, users);
        });
      }
    });
};

exports.UserProvider = UserProvider;
*/
