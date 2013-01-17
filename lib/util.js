var _ = require('underscore');
var dbop = require('./dbop');
var filter = require('./filter');

//utils
exports.isEmpno = function(d) {
  if (d.length > 10)
    return false;
  return true;
};

exports.isRealname = function(d) {
  if (d.length > 12)
    return false;
  return true;
};

exports.isMobile = function(d) {
  if (d.length > 20)
    return false;
  return true;
};

exports.isURL = function(d) {
  if (d.length > 80)
    return false;
  return true;
};

exports.formatURL = function(d) {
  if (d.search('http://') == 0)
    return d;
  return 'http://' + d;
};

//
exports.gen_repo_home = function(repo) {
  return '/' + repo.owner.uid + '/' + repo.name;
};

exports.hasPermission = function(repo, user) {
  if (user._id.toString() == repo.owner._id.toString())
    return true;
  for (var i=0; i<repo.collaborators.length; i++) {
    if (repo.collaborators[i].person._id.toString() == user._id.toString())
      return true;
  };
  return false;
};

// Middleware
var loginRequired = function(req, res, next) {
  var user = req.session.user;
  if (!user) {
    return res.redirect('/login');
  }

  user['_id'] = dbop.formatId(user['_id']);
  dbop.user_find({uid: user.uid}, function(err, result) {
    if (err)
      return res.send('Server error');
    if (result.length == 0)
      return res.redirect('/login');

    req.auth_user = result[0];
    res.nice_render = function(template, data) {
      var d = _.extend({auth_user: req.auth_user, filter: filter}, data?data:{});
      return res.render(template, d);
    }
    next();
  });
};
exports.loginRequired = loginRequired;

exports.loginPrefer = function(req, res, next) {
  if (!req.session.user) {
    res.nice_render = function(template, data) {
      var d = _.extend({auth_user: null, filter: filter}, data?data:{});
      return res.render(template, d);
    }
    return next();
  }
  return loginRequired(req, res, next);
};

exports.uidRequired = function(req, res, next) {
  var uid = req.params.uid.toString().toLowerCase();
  dbop.user_find({uid: uid}, function(err, result) {
    if (err)
      return res.send(404, 'not found');
    if (result.length == 0)
      return res.send(404, 'not found');
    req.clean_data = {user: result[0]};
    next();
  });
};

exports.repoRequired = function(req, res, next) {
  var name = req.params.repo.toString().toLowerCase();
  dbop.repo_find({name: name,
                  "owner._id": req.clean_data.user['_id']
                 }, function(err, result) {
    if (err)
      return res.send(404, 'not found');
    if (result.length == 0)
      return res.send(404, 'not found');
    req.clean_data['repo'] = result[0];
    next();
  });
};

exports.repoOwnerRequired = function(req, res, next) {
  if (req.clean_data.user._id.toString() == req.auth_user._id.toString()) {
    return next();
  }
  return res.send(403, 'Permission denied');
};

