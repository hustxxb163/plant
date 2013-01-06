var dbop = require('../lib/dbop');

exports.login_post = function(req, res){
  var uid = req.body.username;
  var password = req.body.password;
  var remember_me = req.body.remember_me;

  function respond_err(error) {
    var error = error ? error : 'Username or Password error';
    return res.render('login', {common: {}, error: error, last_name: uid});
  }

  if (uid.length < 3 || 
      uid.length > 30 ||
      password.length < 3 ||
      password.length > 60) {
    return respond_err();
  }
  uid = uid.toLowerCase();

  //
  if (password != '123') {
    return respond_err();
  }

  function login_success(user) {
    // save uid into session
    req.session.user = user
    res.redirect('/' + user.uid);
  }

  // check user
  dbop.user_find({uid: uid}, function(err, result) {
    if (err)
      return respond_err('Service unavaiable!');

    if (result.length > 0) {
      return login_success(result[0]);
    }
    
    // create new user
    dbop.user_create(uid, function(err, result) {
      if (err)
        return respond_err('Service unavaiable! Cant init user');
      return login_success(result[0]);
    });
  });
};

exports.logout = function(req, res){
  req.session.destroy();
  res.redirect('/');
};

exports.login = function(req, res){
  res.render('login', {common: {}, error: '', last_name: ''});
};

exports.index = function(req, res){
  res.render('index', {common: {}});
};

