exports.home = function(req, res){
  var uid = req.params.uid;
  var repo = req.params.repo;
  var data = {uid: uid,
              repo: repo};
  res.nice_render('repo/home', data);
};

exports.create = function(req, res){
  res.nice_render('repo/new');
};

