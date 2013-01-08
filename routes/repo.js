var dbop = require('../lib/dbop');

exports.home = function(req, res){
  var data = {user: req.clean_data.user,
              repo: req.clean_data.repo};
  res.nice_render('repo/home', data);
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
