var dbop = require('../lib/dbop');
var conf = require('../lib/config');

exports.profile = function(req, res) {
  res.nice_render('setting/profile');
};

exports.ssh = function(req, res) {
  dbop.sshkey_find({owner: req.auth_user['_id']}, function(err, result) {
    if (err)
      return res.send('Server Error');

    var data = {sshkeys: result,
                key_num_quota: conf.key_num_quota};
    res.nice_render('setting/ssh', data);
  });
};

exports.key_create = function(req, res) {
  var key_title = req.body.key_title;
  var key_content = req.body.key_content;
  if (!key_title || key_title.length > 60 ||
      !key_content || key_content.length > 1024) {
    return res.send('You should specify right Title & Key');
  }

  dbop.sshkey_find({owner: req.auth_user['_id']}, function(err, result) {
    if (err)
      return res.send('Server Error');

    if (result.length >= conf.key_num_quota)
      return res.send('You can add no more than 3 SSH keys');

    dbop.sshkey_create(req.auth_user['_id'],
                       key_title,
                       key_content, function(err, result) {
      if (err)
        return res.send('Add key Error');
      return res.redirect('/setting/ssh');
    });
  });
}

exports.key_delete = function(req, res) {
  dbop.sshkey_delete(req.auth_user['_id'],
                     dbop.formatId(req.params._id.toString()),
                     function(err, result) {
    if (err)
      return res.send('Server Error');

    return res.redirect('/setting/ssh');
  });
};

exports.repositories = function(req, res) {
  res.nice_render('setting/repositories');
};

exports.notification = function(req, res) {
  res.nice_render('setting/notification');
};

