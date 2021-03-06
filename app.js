
/**
 * Module dependencies.
 */

var express = require('express')
//  , _ = require('underscore')
  , main = require('./routes/main')
  , user = require('./routes/user')
  , setting = require('./routes/setting')
  , repo = require('./routes/repo')
  , util = require('./lib/util')
  , conf = require('./lib/config')
  , http = require('http')
  , path = require('path');
var MongoStore = require('connect-mongo')(express);

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  //app.use(express.session());

  app.use(express.session({
    secret: 'no secret',
    store: new MongoStore({
      db: conf.store.db,
      host: conf.store.host,
      port: conf.store.port
    })
  }));
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));

});

app.configure('development', function(){
  app.use(express.errorHandler());
  app.locals.pretty = true;
});

// common
// param
app.param(function(name, fn){
  if (fn instanceof RegExp) {
    return function(req, res, next, val){
      var captures;
      if (captures = fn.exec(String(val))) {
        req.params[name] = captures;
        next();
      } else {
        next('route');
      }
    }
  }
});

app.param('_id', /^\w{24}$/);
app.param('uid', /^[a-z]\w{0,29}$/i);
app.param('repo', /^[a-z][a-z0-9\-]{3,29}$/i);
app.param('other', /^.+$/i);

// URL mapping
app.get('/blog|help|us', function(req, res){res.send('TBD...');});

app.post('/login', main.do_login);
app.get('/login', main.login);
app.get('/logout', main.logout);

app.get('/', util.loginPrefer, main.index);
app.get('/setting/profile', util.loginRequired, setting.profile);
app.post('/setting/profile', util.loginRequired, setting.profile_post);
app.get('/setting/ssh', util.loginRequired, setting.ssh);
app.post('/setting/ssh', util.loginRequired, setting.key_create);
app.post('/setting/ssh/delete/:_id', util.loginRequired, setting.key_delete);
app.get('/setting/repositories', util.loginRequired, setting.repositories);
app.get('/new', util.loginRequired, repo.create);
app.post('/new', util.loginRequired, repo.do_create);
app.get('/:uid', [util.loginPrefer
                  , util.uidRequired
                 ], user.home);
app.get('/:uid/:repo', [util.loginPrefer
                  , util.uidRequired
                  , util.repoRequired
                 ], repo.home);
app.get('/:uid/:repo/setting', [util.loginRequired
                              , util.uidRequired
                              , util.repoRequired
                              , util.repoOwnerRequired
                             ], repo.setting);
app.get('/:uid/:repo/options', [util.loginRequired
                              , util.uidRequired
                              , util.repoRequired
                              , util.repoOwnerRequired
                             ], repo.options);
app.get('/:uid/:repo/collaborators', [util.loginRequired
                              , util.uidRequired
                              , util.repoRequired
                              , util.repoOwnerRequired
                             ], repo.collaborators);
app.post('/:uid/:repo/collaborators', [util.loginRequired
                              , util.uidRequired
                              , util.repoRequired
                              , util.repoOwnerRequired
                             ], repo.add_collaborator);
app.post('/:uid/:repo/collaborators/delete', [util.loginRequired
                              , util.uidRequired
                              , util.repoRequired
                              , util.repoOwnerRequired
                             ], repo.del_collaborator);
app.get('/:uid/:repo.git/:other', [util.uidRequired
                                  , util.repoRequired
                                  ], repo.git_clone);


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
