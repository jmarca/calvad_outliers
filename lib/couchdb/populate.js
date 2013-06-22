var async = require('async')
var env = process.env;
var cuser = env.COUCHDB_USER ;
var cpass = env.COUCHDB_PASS ;

if(!cuser || !cpass){
    throw new Error('you must specify the correct couchdb '
                    + 'admin user and password as environment variables.  '
                    + 'Sorry, but I do not use passwords on the command line.  '
                    + 'Use COUCHDB_USER for the username, '
                    + 'and COUCHDB_PASS for the password')
}


var argv = require('optimist')
    .usage('push a view into couchdbs \nUsage: $0')
    .demand('p')
    .alias('p', 'prefix')
    .describe('p', 'The prefix needed for databases.  For example, if the databases follow the pattern: \n\t\t\t/imputed%2fcollated%2fdistrict%2fyear, then the prefix option would be -p imputed -p collated.  \n\t\t\tMultiple options are turned into an array, and used to create the proper CouchDB \n\t\t\tdatabase names')
 .demand('d')
           .alias('d','district')
           .describe('d', 'One or more districts for pushing the view.  Specify multiple districts as --district 3 --district 12 --district wim \n\t\t\t(yes, wim is its own district)')
 .demand('year')
 .describe('year', 'One or more years to create dbs.  Specify multiple years as --year 2007 --year 2008')
    .argv
;

var prefix = argv.p

function pad(n){return n<10 ? '0'+n : n}

var _ = require('lodash')

var years = _.flatten([argv.year])

var districts = _.flatten([argv.district])

districts = _.map(districts
                 ,function(d){
                      if (d==='wim') return d
                      return 'd'+pad(d)
                  })
var putter = require('couchdb_put_view')

var outliers = {"_id":"_design/outliers","language":"javascript","views":{"outliers":{"map":"function(doc) {\n  if(doc.outlier !== undefined){\n     emit(doc._id,null);\n  }\n  return null;\n}"},"okay":{"map":"function(doc) {\n  if(doc.outlier === undefined){\n     emit(doc._id,null);\n  }\n  return null;\n}"}}}
var dbs = []
_.each(years
      ,function(y){
           _.each(districts
                 ,function(d){
                      var db = _.flatten([prefix,d,y])
                      dbs.push(db.join('%2f'))
                      return null
                  });
           return null
       });

// for each db, push the view

async.eachLimit(dbs,4
               ,function(db,cb){
                    putter({db:db
                           ,doc:outliers
                           },cb)
                },function(err){
                      if(err) throw new Error(err)
                      console.log('done')
                  });
