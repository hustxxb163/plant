
exports.store = {
  db : 'aiur',
  host : 'localhost',
  port : 27017
};

exports.key_num_quota = 3;

exports.keydir = process.env.HOME + '/gitolite-admin/keydir';
exports.git_portal = {
  workdir : process.env.HOME + '/gitolite-admin/conf',
  interval : 10 * 1000,
};
