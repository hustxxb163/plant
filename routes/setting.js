exports.profile = function(req, res) {
  res.nice_render('setting/profile');
};

exports.ssh = function(req, res) {
  res.nice_render('setting/ssh');
};

exports.repositories = function(req, res) {
  res.nice_render('setting/repositories');
};

