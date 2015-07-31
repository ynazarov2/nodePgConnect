var PGConnect = require('../index.js');

var pgConnect = new PGConnect('postgres://postgres:password@yourhost:port/postgres', __dirname + '/methods/');

var queries = [
  pgConnect.getUserIdByToken('-some-token-'),
  pgConnect.f(
    function(userId, callback) {
      callback('user_' + userId);
    }
  ),
  pgConnect.getUserInfoById()
];

pgConnect.execute(
  null,
  queries,
  function(user){
    console.log(user);
  }
);