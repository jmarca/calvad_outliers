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
.default('l',100)
 .alias('l','limit')
 .describe('l','the number of detectors to pull from couchdb for processing')
 .argv
;

var get_all_detectors = require('./get_all_detectors').get_all_detectors



var start_detector = argv.detector
var limit = argv.limit
console.log([start_detector,limit])

function spawn_job(task,done){

    var jobCall = ['lib/calvad_outliers.js'
                  ,'-d',task.detector
                  ,'-l',task.limit
                  ]

    var R  = spawn('node', jobCall)
    R.stderr.setEncoding('utf8')
    R.stdout.setEncoding('utf8')
    var logfile = 'log/'+task.detector+'.log'
    var logstream = fs.createWriteStream(logfile
                                        ,{flags: 'a'
                                         ,encoding: 'utf8'
                                         ,mode: 0666 })
    var errstream = fs.createWriteStream(logfile
                                        ,{flags: 'a'
                                         ,encoding: 'utf8'
                                         ,mode: 0666 })
    R.stdout.pipe(logstream)
    R.stderr.pipe(errstream)
    R.on('exit',function(code){
        console.log('got exit: '+code+', for ',task.detector)
        done()
        return null
    })
    return null
}


function detector_loop(detectors,cb){
    //console.log('detectors are '+JSON.stringify(detectors))
    // move in chunks of limit
    var i=0,j=detectors.length
    var index = []
    for(i=0;i<j;i+=limit) index.push(detectors[i])

    console.log(index)

    async.eachLimit(index,jobs
                   ,function(d,cb){
                        console.log('process next '+limit+'  '+d)
                        spawn_job({detector:d,limit:limit},cb)
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
    async.waterfall([get_all_detectors(start_detector)
                    ,detector_loop]
                   ,function(e,r){
                        console.log('all done')
                    })

}
doit()
