var PGConnect = module.exports;

PGConnect.getUserIdByToken = function(token) {
  return this.dbRequest(
      'SELECT id, token FROM users WHERE token= (\'%s\')',
      token,
      function(result) {
        var userId = null;
        if (result.rows[0])
          userId = result.rows[0].id;
        return userId;
      })
};
