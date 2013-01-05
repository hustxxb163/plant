exports.home = function(req, res){
  var uid = req.params.uid;
  var repos = [{name: 'leazy',
                description: 'python web framework',
                updated_at: '2013-01-01'}
               ,{name: 'sessd',
                description: 'session server',
                updated_at: '2012-12-01'}
               ,{name: 'cottage',
                description: 'image storage service',
                updated_at: '2013-01-01'}]
  var data = {uid: uid,
              repos: repos};
  res.nice_render('user/home', data);
};

