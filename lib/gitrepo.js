var exec = require('child_process').exec;
var fs = require('fs');
var _ = require('underscore');

/*
{ repos: 
   [ { _id: '50eb9813abdce60000000001',
       name: 'igor',
       owner_uid: 'bxx',
       devs: ['xxxxxxxxxxxx', 'xxxxxxxxxxxxxx'] },
     { _id: '50eba1b6aa3b620000000002',
       name: 'body-language',
       owner_uid: 'axion',
       devs: [Object] },
       devs: ['xxxxxxxxxxxx', 'xxxxxxxxxxxxxx'] } ],
  keys: 
   [ { _id: '50ec2061c37e5f0000000002',
       owner_id: '50e8f6568605430000000001' },
     { _id: '50eb993fe5fda20000000001',
       owner_id: '50e8f6568605430000000001' } ]
}

==>

@admin = git_aiur
repo gitolite-admin
  RW+ = @admin

@u_xxxxxxx = k_xxxx k_xxxx k_xxxx
@u_xxxxxxx = k_xxxx k_xxxx k_xxxx
@u_all = @u_xxxx @u_xxxx

@r_xxxxxxx = @u_xxxx @u_xxxx
repo uid/repo
    RW+     =   @r_xxxxx
*/
function gen_gitolite_conf(data) {
  var admin_conf = [
"## Automaticly generated, DO NOT modify it by hand",
"",
"## General admin setting",
"@admin = git_aiur",
"repo gitolite-admin",
"  RW+ = @admin",
""];

  var group_conf = [
"",
"## User & Group setting",
];

  var perm_conf = [
"",
"## Repo permission setting",
];

  var all_devs = [];

  // generating perm_conf
  _.each(data.repos, function(repo) {
    var repo_block = [];
    var repo_user = '@r_' + repo._id + ' =';
    _.each(repo.devs, function(dev) {
      all_devs.push(dev);
      repo_user += ' @u_' + dev;
    });

    repo_block.push(repo_user);
    repo_block.push('repo ' + repo.owner_uid + '/' + repo.name);
    repo_block.push('  RW+ = @r_' + repo._id);
    repo_block.push('');

    perm_conf = perm_conf.concat(repo_block);
  });
  all_devs = _.uniq(all_devs);

  // generating group conf
  var all_dev_conf = '@all_devs =';
  _.each(all_devs, function(dev) {
    var devkeys =_.filter(data.keys, function(key) {
      return dev == key.owner_id;
    });

    // user have no keys, just skip his group setting
    if (devkeys.length == 0) {
      return;
    }

    var user_conf = '@u_' + dev + ' =';
    _.each(devkeys, function(key) {
      user_conf += ' k_' + key._id;
    });

    group_conf = group_conf.concat(user_conf);
    all_dev_conf += ' @u_' + dev;
  });
  group_conf = group_conf.concat(all_dev_conf);

  return admin_conf.concat(group_conf).concat(perm_conf).join('\n');
}

exports.update = function(data, callback) {
  var conf_str = gen_gitolite_conf(data);

  var fd = fs.openSync('gitolite.conf', 'w+');
  fs.writeSync(fd, conf_str);
  fs.closeSync(fd);

  var cmd_string = 'git commit -a -m "auto updating" && git push -u origin master';
  var child = exec(cmd_string, function(error, stdout, stderr) {
      if (error != null) {
        return callback(error);
      }

      console.log('Git push success: ' + new Date());
      callback(null, stdout);
  });
};
