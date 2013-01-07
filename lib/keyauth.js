var exec = require('child_process').exec;
var fs = require('fs');

var check = function(data, callback) {
  var tmpfile = '/tmp/.sshkey-' + Math.random() + '.tmp';
  var fd = fs.openSync(tmpfile, 'w+');
  fs.writeSync(fd, data);
  fs.closeSync(fd);

  var child = exec('ssh-keygen -lf ' + tmpfile,
    function (error, stdout, stderr) {
      fs.unlink(tmpfile);
      if (error !== null) {
        return callback(error);
      }

      var info = stdout.split(' ');
      var key_info = [info[0], info[1], info[3].slice(1,4)];
      callback(null, key_info);
  });
};

exports.check = check;

