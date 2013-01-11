
exports.store = {
  db : 'aiur',
  host : 'localhost',
  port : 27017
};

exports.key_num_quota = 3;

rootdir = process.env.HOME;
exports.git_portal = {
  workdir : rootdir + '/gitolite-admin/conf',
  interval : 10 * 1000,
};

// Store user SSH key file here
exports.keydir = rootdir + '/gitolite-admin/keydir';

// HTTP(git clone) set document root here
exports.git_repo_dir = rootdir + '/repositories';
