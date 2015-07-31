var PGConnect = module.exports;

PGConnect.getUserInfoById = function(name) {
  return this.dbRequest(
      'SELECT id, token FROM users WHERE id = (\'%s\')',
      name,
      function(result) {
        var user = null;
        if (result.rows[0])
          user = result.rows[0];
        return user;
      })
};
