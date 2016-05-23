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

//process.env.COUCH_CACHE_PREFIX='imputed%2fcombined'
var start_detector = argv.detector
var limit = argv.limit
console.log([start_detector,limit])

var _ = require('lodash')
var async = require('async')
//var years = [2007,2008,2009]
//var years = [2008]
var years = [2012]
var get_time = require('./get_time')
var get_detector = require('./get_detector')
var compute_aadt = require('calvad_compute_aadt')

var prefix = process.env.COUCH_CACHE_PREFIX || 'imputed%2fc2'
var env = process.env
var _cuser = env.COUCHDB_USER
var _cpass = env.COUCHDB_PASS
var _chost = env.COUCHDB_HOST
var _cport = env.COUCHDB_PORT || 5984

var couch = 'http://'+_chost+':'+_cport;

var match_district = require('./match_district')


var header = ["ts","freeway","n","hh","not_hh","o","avg_veh_spd"
             ,"avg_hh_weight","avg_hh_axles","avg_hh_spd"
             ,"avg_nh_weight","avg_nh_axles","avg_nh_spd"
             ,"miles","lane_miles","detector_count","detectors"]
var setter = require('couch_set_state')

var get_all_detectors = require('./get_all_detectors').get_all_detectors

function handle_outliers(task,cb){
    // the bad data is in outliers
    var freeway = _.keys(task.aadt)[0]
    // not expecting more than one freeway for a
    // single detector
    var outliers = task.aadt[freeway].outliers
    var did = task.data.features[0].properties.detector_id
    var year = task.data.features[0].properties.year
    if(outliers === undefined || outliers.length === 0){
        console.log('no outliers for detector_id='+did +', '+ year)
        return cb(null)
    }
    console.log('have '+outliers.length+' outliers for detector_id='+did +', '+ year+', saving to couchdb')
    var district = match_district(did)
    var couch_database = [prefix,district,year].join('%2f')
    async.eachLimit(outliers,1,function(outlier,each_cb){
        var doc_id = [did // the detector id
                     ,outlier[0] // the timestamp
                     ].join('-')
        setter({'db':couch_database
               ,'doc':doc_id
               ,'state':'outlier'
               ,'value':{n:task.aadt[freeway].n
                        ,hh:task.aadt[freeway].hh
                        ,not_hh:task.aadt[freeway].not_hh
                        }
               }
              ,function(e,r){

                   if(e){
                       console.log('problem saving to '+couch_database + '  '+doc_id)
                       return each_cb(e)
                   }
                   console.log('done with '+doc_id)
                   return each_cb()
               });
        return null
    },cb)
    return null
}


function detector_waterfall(feature,outercb){
    console.log('handling '+feature.properties.detector_id+ ', '+feature.properties.year)

    async.waterfall([function(cb){
                         // yeah there is probably some sort of apply
                         // I can do, but whatever

                         // load up the waterfall with the feature

                         cb(null,feature)
                     }
                    ,get_detector
                    ,function(detector_data,cb){

                         if(!detector_data.data.length){
                             console.log('no data for '+feature.properties.detector_id+ ', '+feature.properties.year)
                             return cb('no data')
                         }
                         feature.properties = _.extend(feature.properties,detector_data)
                         // make the data good for compute_aadt

                         var task = {'flatdata' : detector_data.data
                                    ,'data': {'features': [feature] }
                                    ,'header' : detector_data.header
                                    }
                         return compute_aadt(task,cb)
                     }
                    ,handle_outliers
                   ]
                   ,function(err){
                        console.log(err)
                        if(err && err !== 'no data'){ return outercb(err)}
                        return outercb()
                    })
}
function detector_loop(detectors,cb){
    console.log('detectors are '+JSON.stringify(detectors))
    var d_y = async.queue(detector_waterfall,1)//[]
    _.each(detectors
          ,function(d){
               _.each(years
                     ,function(y){
                          var start_end = get_time(y)
                          var feature = {'properties':{'detector_id':d
                                                      ,'ts':   start_end.start.getTime()/1000
                                                      ,'endts':start_end.end.getTime()/1000
                                                      ,'year':y
                                                      }}
                          d_y.push(feature)
                      })
           });
    console.log('acting on '+d_y.length())
    //async.eachLimit(d_y,1,detector_waterfall,cb)
    // assign a callback
    d_y.drain = function() {
        console.log('all items have been processed');
        return cb()
    }
    return null
}


function doit(){
    async.waterfall([get_all_detectors(start_detector,limit),
                     detector_loop]
                   ,function(e,r){
                        console.log('all done')
                    })

}
doit()
