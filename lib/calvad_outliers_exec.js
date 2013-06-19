/**
 * calvad_outliers
 *
 * logic:
 *
 * 1. get a list of all of the detectors, all of the years.
 * 2. get the data for that
 *     1. pass to get_time to create the start end
 *     2. pass to get_detector to get the data
 *
 *
 */

var _ = require('lodash')
var async = require('async')

var env = process.env
var _cuser = env.COUCHDB_USER
var _cpass = env.COUCHDB_PASS
var _chost = env.COUCHDB_HOST
var _cport = env.COUCHDB_PORT || 5984

var couch = 'http://'+_chost+':'+_cport;

var tracking_db = env.CALVAD_TRACKING_DB || 'vdsdata%2ftracking'

var viewer = require('couchdb_get_views')

var jobs = process.env.NUM_JOBS || 3

var util  = require('util'),
    spawn = require('child_process').spawn;
var fs = require('fs')


var argv = require('optimist')
.usage('check imputed CalVAD data for outliers.\nUsage: $0')
.alias('d', 'detector')
.describe('d', 'The starting detector to use')
.string('d')
.demand('d')
.default('l',250)
 .alias('l','limit')
 .describe('l','the number of detectors to pull from couchdb for processing')
 .argv
;

var start_detector = argv.detector
var limit = argv.limit
console.log([start_detector,limit])

function spawn_job(task,done){

    var jobCall = ['lib/calvad_outliers.js','-d',task.detector]

    var R  = spawn('node', jobCall)
    R.stderr.setEncoding('utf8')
    R.stdout.setEncoding('utf8')
    var logfile = 'log/'+task.detector+'.log'
    var logstream = fs.createWriteStream(logfile
                                        ,{flags: 'a'
                                         ,encoding: 'utf8'
                                         ,mode: 0666 })
    R.stdout.pipe(logstream)
    R.stderr.pipe(logstream)
    R.on('exit',function(code){
        console.log('got exit: '+code+', for ',task.detector)
        done()
        return null
    })
    return null
}


function get_all_detectors(cb){
    // get all of the detectors

    viewer({'db':tracking_db
           ,'view':'_all_docs'
           ,'include_docs':false
           //,'limit':10000
           ,'startkey':start_detector
           }
          ,function(e,r){
               console.log('done with couch call')
               cb(null,_.map(r.rows
                            ,function(r){
                                 return r.id
                             })
                 )
           })
    return null
}


function detector_loop(detectors,cb){
    //console.log('detectors are '+JSON.stringify(detectors))
    // move in chunks of 250
    var i=0,j=detectors.length
    var index = []
    for(i=0;i<j;i+=100) index.push(detectors[i])

    console.log(index)

    async.eachLimit(index,jobs
                   ,function(d,cb){
                        console.log('process next 100 '+d)
                        spawn_job({detector:d},cb)
                        return null
                    }
                   ,function(e){
                        if(e) throw new Error(e)
                        console.log('done processing up to '+detectors.pop())
                        return cb()
                    })
    return null
}


function doit(){
    async.waterfall([get_all_detectors,
                     detector_loop]
                   ,function(e,r){
                        console.log('all done')
                    })

}
doit()