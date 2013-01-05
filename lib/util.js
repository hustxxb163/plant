var _ = require('underscore');

// loginRequired middleware
exports.loginRequired = function(req, res, next){
  var user = req.session.user;
  if (!user) {
    //console.log('auth faild, go to login page');
    res.redirect('/login');
  } else {
    //console.log('auth OK, ' + req.common_var);
    req.common_var = {userLogined: true, user: user};
    res.nice_render = function(template, data) {
      var d = _.extend({common: req.common_var}, data?data:{});
      return res.render(template, d);
    }
    next();
  }
};

