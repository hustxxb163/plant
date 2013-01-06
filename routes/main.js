var dbop = require('../lib/dbop');

exports.login_post = function(req, res){
  var uid = req.body.username;
  var password = req.body.password;
  var remember_me = req.body.remember_me;
  console.log('name='+uid+', password='+password+', remember_me='+remember_me);

  function respond_err(error) {
    var error = error ? error : 'Username or Password error';
    return res.render('login', {error: error, last_name: uid});
  }

  if (uid.length < 3 || 
      uid.length > 30 ||
      password.length < 3 ||
      password.length > 60) {
    return respond_err();
  }

  //
  if (password != '123') {
    return respond_err();
  }

  //
  dbop.user_find({uid: uid}, function(err, result) {
    if (err)
      return respond_err('Service unavaiable!');
    if (result.length > 0) {
      return respond_err('go to next page');
    }
    
    // create new user
    dbop.user_create(uid);
  });
  
//  var user = db.user.findOne({uid: uid})
//  if (!user) {
//    return res.render('login', {common: {error:'Username or Password error'}, last_name: uid});
//  }

  // save uid into session
  req.session.user = {uid: uid}
  res.redirect('/' + uid);
};

exports.logout = function(req, res){
  req.session.destroy();
  res.redirect('/');
};

exports.login = function(req, res){
  res.render('login', {common: {}, last_name: ''});
};

exports.index = function(req, res){
  res.render('index', {common: {}});
};

