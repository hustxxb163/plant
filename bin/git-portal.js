var dbop = require('../lib/dbop');
var gitrepo = require('../lib/gitrepo');
var sysutil = require('util');
var hash = require('crypto').createHash;
var _ = require('underscore');

var interval = 5 * 1000;
var intervalId = setInterval(function() {
  run();
}, interval);

var cache = {repos: [],
             repo_fingerprint: null,
             keys: [],
             key_fingerprint: null,
             updated_at: new Date(),
             to_be_updating: false};

function gen_fingerprint(j) {
  return hash('md5').update(sysutil.format('%j', j)).digest('hex');
}

var run = function() {
  console.log('Job start: ' + new Date());

  // check repositories developers change
  dbop.get_all_repo_devs(function(err, result) {
    if (err) {
      console.log('[Err] get repo devs: ' + err);
    } else {
      // check fingerprint
      var repo_fingerprint = gen_fingerprint(result);
      if (cache.repo_fingerprint != repo_fingerprint) {
        // update cache, set to_be_updating flag
        cache.repos = result;
        cache.repo_fingerprint = repo_fingerprint;
        cache.to_be_updating = true;
      }
    }

    // check ssh keys change
    dbop.sshkey_find({}, function(err, result) {
      if (err) {
        console.log('[Err] get ssh keys: ' + err);
      } else {
        // check fingerprint
        var key_fingerprint = gen_fingerprint(result);
        if (cache.key_fingerprint != key_fingerprint) {
          // update cache, set to_be_updating flag
          cache.keys = _.map(result, function(i) {
            return {owner: i.owner};
          });
          cache.key_fingerprint = key_fingerprint;
          cache.to_be_updating = true;
        }
      }

      // no updating, just skip
      if (!cache.to_be_updating)
        return;

      // do updating
      gitrepo.update(cache);
      cache.to_be_updating = false;

      console.log('Updating Done: ' + new Date());
    });
  });
};

