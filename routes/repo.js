var dbop = require('../lib/dbop');
var conf = require('../lib/config');
var util = require('../lib/util');
var url = require('url');
var send = require('send');

exports.home = function(req, res){
  // if private

  var user = req.clean_data.user;
  var repo = req.clean_data.repo;
  var data = {user: user, repo: repo};

  if (!repo.state || repo.state == 'pending') {
    if (req.session.isLogined && util.hasPermission(repo, req.auth_user)) {
      return res.nice_render('repo/init_guide', data);
    } else {
      return res.nice_render('repo/empty_repo', data);
    }
  }
  return res.nice_render('repo/home', data);
};

exports.create = function(req, res){
  res.nice_render('repo/new');
};

exports.do_create = function(req, res){
  //TODO CSRF?
  var name = req.body.reponame;
  var name_regex = /^[a-z][a-z0-9\-]{3,29}$/i;
  if (!name_regex.test(name))
    return res.send('bad repository name');
  name = name.toLowerCase();

  var description = req.body.repodesc;
  if (description.length > 300)
    return res.send('description to long, (should less than 300 words)');

  dbop.repo_find({name: name, "owner._id": req.auth_user['_id']}, function(err, result) {
    if (err)
      return res.send('Service unavaiable');

    if (result.length > 0)
      return res.send('Respository name is exist, choose another one PLZ');

    // create it
    dbop.repo_create(name,
                     description,
                     {_id: req.auth_user['_id'], uid: req.auth_user['uid']},
                     function(err, result) {
      if (err)
        return res.send('Service unavaiable');

      // redirect to repository main page
      return res.redirect('/' + req.auth_user['uid'] + '/' + name);
    });
  });
};

exports.setting = function(req, res) {
  var repo = req.clean_data.repo;
  return res.redirect(util.gen_repo_home(repo) + '/collaborators');
};

exports.options = function(req, res) {
  var user = req.clean_data.user;
  var repo = req.clean_data.repo;
  var data = {user: user, repo: repo};
  return res.nice_render('repo/setting_options', data);
};

exports.collaborators = function(req, res) {
  var user = req.clean_data.user;
  var repo = req.clean_data.repo;
  var data = {user: user, repo: repo};
  return res.nice_render('repo/setting_collaborators', data);
};

exports.add_collaborator = function(req, res) {
  var repo = req.clean_data.repo;
  var dev_name = req.body.dev_name.toLowerCase();
  if (dev_name == req.auth_user.uid) {
    return res.send('Can not add you self');
  }

  dbop.user_find({uid: dev_name}, function(err, result) {
    if (err)
      return res.send('Server error');
    if (result.length == 0)
      return res.send('User not found');

    if (util.hasPermission(repo, result[0])) {
      return res.send('User is already your collaborators');
    }

    // add into collaborators
    dbop.add_collaborator(repo._id, result[0], function(err, result) {
      if (err)
        return res.send('Server error');

      return res.redirect(util.gen_repo_home(repo) + '/collaborators');
    });
  });
};

exports.del_collaborator = function(req, res) {
  var repo = req.clean_data.repo;
  var dev_id = req.body.dev_id;
  if (dev_id == req.auth_user._id.toString()) {
    return res.send('Can not delete you self');
  }

  dbop.del_collaborator(repo._id, dbop.formatId(dev_id), function(err, result) {
    if (err)
      return res.send('Server error');

    return res.redirect(util.gen_repo_home(repo) + '/collaborators');
  });
};

exports.git_clone = function(req, res) {
  var repo = req.clean_data.repo;
  if (repo.isPrivate) {
    // need auth again?
    return res.send(403, 'Permission denied');
  }
  if (repo.state == 'pending') {
    return res.send('Can not clone from empty repository');
  }

  function error(err) {
    res.statusCode = err.status || 500;
    res.end(err.message);
  }

  send(req, url.parse(req.url).pathname)
  .root(conf.git_repo_dir)
  .on('error', error)
  .pipe(res);
};
