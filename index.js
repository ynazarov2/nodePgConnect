var pg = require('pg');
var util = require('util');
var async = require('async');
var conflate = require('conflate');
var fs = require('fs');

function PGConnect(conString, methodsFolder) {
  this.conString = conString;
  this.methodsFolder = methodsFolder;

  this.init(this.methodsFolder)
}

PGConnect.prototype.init = function(methodsFolder) {
  var files = fs.readdirSync(methodsFolder);
  for (var i = 0; i < files.length; i++) {
    if (files[i].match(/.*\.js/)) {
      var mod = require(methodsFolder + files[i]);
      conflate(PGConnect.prototype, mod);
    }
  }
};

PGConnect.prototype.execute = function(conString, queries, callback) {
  conString = conString || this.conString;
  var _this = this;

  if (queries.length == 0)
    return false;

  pg.connect(conString, function(err, pgClient, done) {
    var Queue = [startFunc(pgClient, done)];
    Queue = Queue.concat(queries);

    async.waterfall(Queue, function() {
      var result = Array.prototype.slice.call(arguments).splice(3);
      done();
      pg.end();
      callback.apply(this, result);
    })
  });

  function startFunc(pgClient, doneCallback) {
    return function(callback) {
      callback(null, pgClient, doneCallback);
    }
  }
};

PGConnect.prototype.executeOne = function(conString, query, callback) {
  conString = conString || this.conString;

  this.execute(conString, [query], callback);
};

PGConnect.prototype.dbRequest = function() {
  var _this = this;

  var topArgs = Array.prototype.slice.call(arguments);
  var initCallback = topArgs.pop();
  var queryStr = topArgs[0];
  topArgs = topArgs.splice(1);

  return function() {
    var newArgs = Array.prototype.slice.call(arguments);
    var callback = newArgs.pop();
    var pgClient = newArgs[0];
    var doneCallback = newArgs[1];
    newArgs = newArgs.splice(2);

    for (var i in topArgs) {
      if ((typeof topArgs[i] === 'undefined') || (topArgs[i] === null))
        topArgs[i] = newArgs[i];
    }

    var queryArgs = [queryStr];
    queryArgs = queryArgs.concat(topArgs);
    queryStr = util.format.apply(this, queryArgs);

    pgClient.query(queryStr, function(err, result) {
      if (_this.handleError(err, pgClient, doneCallback, _fCallback)) return false;
      _fCallback(result)
    });

    var _fCallback = function(result) {
      result = [initCallback(result)];

      var callbackArgs = [null, pgClient, doneCallback];
      callbackArgs = callbackArgs.concat(result);

      callback.apply(this, callbackArgs);
    };
  }
};

/**
 * this method helps you parse data from previous query and pass to the next
 * Usage:
 * pgConnect.f(function(userId, callback) {
 *       callback('user_' + userId);
 *     }),
 */
PGConnect.prototype.f = function(func) {
  return function() {
    var params = Array.prototype.slice.call(arguments);


    var callback = params.pop();
    var pgClient = params[0];
    var doneCallback = params[1];
    var newArgs = params.splice(2);

    newArgs.push(function cb() {
      var cbArgs = Array.prototype.slice.call(arguments);

      var nextCbArgs = [null, pgClient, doneCallback].concat(cbArgs);
      callback.apply(this, nextCbArgs);
    });

    func.apply(this, newArgs);
  }
};

PGConnect.prototype.handleError = function(err, pgClient, done, callback) {
  // no error occurred, continue with the request
  if (!err) return false;

  done(pgClient);
  callback(err);
  return true;
};

module.exports = PGConnect;

