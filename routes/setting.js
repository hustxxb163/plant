var util = require('../lib/util');
var dbop = require('../lib/dbop');
var conf = require('../lib/config');
var keyauth = require('../lib/keyauth');

exports.profile = function(req, res) {
  res.nice_render('setting/profile');
};

exports.profile_post = function(req, res) {
  var empno = req.body.empno.toUpperCase();
  var realname = req.body.realname;
  var mobile = req.body.mobile;
  var homepage = req.body.homepage;

  var invalid_result = [];
  if (!util.isEmpno(empno))
    invalid_result.push('Employee Number is invalid');
  if (!util.isRealname(realname))
    invalid_result.push('Realname is invalid');
  if (!util.isMobile(mobile))
    invalid_result.push('Mobile is invalid');
  if (!util.isURL(homepage))
    invalid_result.push('Homepage is invalid');
  if (homepage)
    homepage = util.formatURL(homepage);

  if (invalid_result.length > 0)
    return res.send(invalid_result);

  dbop.user_update(req.auth_user['_id'],
                   {empno: empno,
                    realname: realname,
                    mobile: mobile,
                    realname: realname,
                    homepage: homepage}, function(err, result) {
    if (err)
      return res.send('Server error');
    res.redirect('/setting/profile');
  });
};

exports.ssh = function(req, res) {
  dbop.sshkey_find({"owner._id": req.auth_user['_id']}, function(err, result) {
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
      !key_content || key_content.length > 2048) {
    return res.send('You should specify right Title & Key');
  }

  keyauth.check(key_content, function(err, result) {
    if (err)
      return res.send('not a valid key');
    var key_spec = result;

    dbop.sshkey_find({"owner._id": req.auth_user['_id']}, function(err, result) {
      if (err)
        return res.send('Server Error');

      if (result.length >= conf.key_num_quota)
        return res.send('You can add no more than 3 SSH keys');

      dbop.sshkey_create({_id: req.auth_user['_id'], uid: req.auth_user['uid']},
                         key_title,
                         key_content,
                         key_spec, function(err, result) {
        if (err)
          return res.send('Add key Error');
        return res.redirect('/setting/ssh');
      });
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

