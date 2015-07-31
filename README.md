# nodePgConnect
This lib is built with the assumption that postgreSQL queries are running much faster if wrapped under one pg.connect()

It helps you to avoid callback hell while making several waterfall queries to the DB.

##How to use it:
1) Put your query methods in the special folder 

3) create pgConnect object. 

2) Use pgConnect.exec(conString, [queries], finalcallback() {}) to run all the queries under one connection. 

Usage example: 

     var pgConnect = require('./pgConnect/index.js');
     var pgConnect = new pgConnect('postgres://postgres:password@yourhost:port/postgres', __dirname + '/methods/'); 
    
     var queries = [ 
     pgConnect.getUserIdByToken('-some-token'),
        pgConnect.f( 
            function(userId, callback) { 
                callback(userId); 
            } 
        ), 
        pgConnect.getUserInfoById() 
     ]; 
    
     pgConnect.execute(null, queries, function(user){ console.log(user); });