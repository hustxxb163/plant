var dbop = require('../lib/dbop');

exports.home = function(req, res){
  dbop.repo_find({"owner._id": req.clean_data.user['_id']}, function(err, result) {
    var data = {user: req.clean_data.user,
                repos: result};
    res.nice_render('user/home', data);
  });
};

