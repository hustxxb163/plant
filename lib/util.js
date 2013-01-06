var _ = require('underscore');
var jade = require('jade');
var dbop = require('./dbop');

jade.filters.ts = function(d) {
  console.log(typeof d);
  console.log(d);
  return d.getFullYear() + d.getMonth + d.getDay;
};

exports.ts = function() {
  return Math.round(new Date()/1000);
};

// Middleware
// loginRequired middleware
exports.loginRequired = function(req, res, next) {
  var user = req.session.user;
  if (!user) {
    //console.log('auth faild, go to login page');
    res.redirect('/login');
  } else {
    //console.log('auth OK, ' + req.common_var);
    req.auth_data = {userLogined: true, user: user};
    res.nice_render = function(template, data) {
      var d = _.extend({common: req.auth_data}, data?data:{});
      return res.render(template, d);
    }
    next();
  }
};

exports.uidRequired = function(req, res, next) {
  var uid = req.params.uid.toString();
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
  var name = req.params.repo.toString();
  dbop.repo_find({name: name}, function(err, result) {
    if (err)
      return res.send(404, 'not found');
    if (result.length == 0)
      return res.send(404, 'not found');
    if (result[0].owner != req.clean_data.user['_id'])
      return res.send(404, 'not found');
    req.clean_data['repo'] = result[0];
    next();
  });
};

