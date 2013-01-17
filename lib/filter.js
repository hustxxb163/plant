
// utils
exports.ts_simple = function(d) {
  return d.toString().slice(4,15);
}

exports.ts_simple_time = function(d) {
  return d.toString().slice(4,24);
}

exports.repo_home = function(repo) {
  return '/' + repo.owner.uid + '/' + repo.name;
};

