var _ = require('underscore');
var dbop = require('./dbop');
var filter = require('./filter');

// Middleware
exports.loginRequired = function(req, res, next) {
  var user = req.session.user;
  if (!user) {
    return res.redirect('/login');
  }

  user['_id'] = dbop.formatId(user['_id']);
  req.auth_user = user;
  res.nice_render = function(template, data) {
    var d = _.extend({auth_user: req.auth_user, filter: filter}, data?data:{});
    return res.render(template, d);
  }
  next();
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
                  owner: req.clean_data.user['_id']
                 }, function(err, result) {
    if (err)
      return res.send(404, 'not found');
    if (result.length == 0)
      return res.send(404, 'not found');
    req.clean_data['repo'] = result[0];
    next();
  });
};

