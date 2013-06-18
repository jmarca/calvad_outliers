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
//var years = [2007,2008,2009]
var years = [2008]
var get_time = require('./get_time')
var get_detector = require('./get_detector')
var compute_aadt = require('calvad_compute_aadt')

var prefix = process.env.COUCH_CACHE_PREFIX || 'imputed%2fcollated'
var env = process.env
var _cuser = env.COUCHDB_USER
var _cpass = env.COUCHDB_PASS
var _chost = env.COUCHDB_HOST
var _cport = env.COUCHDB_PORT || 5984

var couch = 'http://'+_chost+':'+_cport;

var match_district = require('./match_district')

function get_all_detectors(cb){
    // get all of the detectors
    // in development, just get one!
    return cb(null,["wim.31.S","wim.32.N"])
}

var header = ["ts","freeway","n","hh","not_hh","o","avg_veh_spd","avg_hh_weight","avg_hh_axles","avg_hh_spd","avg_nh_weight","avg_nh_axles","avg_nh_spd","miles","lane_miles","detector_count","detectors"]
var setter = require('couch_set_state')


function handle_outliers(task,cb){
    // the bad data is in outliers
    var freeway = _.keys(task.aadt)[0]
    // not expecting more than one freeway for a
    // single detector
    var outliers = task.aadt[freeway].outliers
    var did = task.data.features[0].properties.detector_id
    if(outliers === undefined || outliers.length === 0){
        console.log('no outliers for detector_id='+did)
        return cb(null)
    }
    console.log('have '+outliers.length+' outliers, saving to couchdb')
    var district = match_district(did)
    var year = task.data.features[0].properties.year
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

    async.waterfall([function(cb){
                         // yeah there is probably some sort of apply
                         // I can do, but whatever

                         // load up the waterfall with the feature

                         cb(null,feature)
                     }
                    ,get_detector
                    ,function(detector_data,cb){
                         feature.properties = _.extend(feature.properties,detector_data)
                         // make the data good for compute_aadt

                         var task = {'flatdata' : detector_data.data
                                    ,'data': {'features': [feature] }
                                    ,'header' : detector_data.header
                                    }
                         console.log(_.keys(detector_data))
                         return compute_aadt(task,cb)
                     }
                    ,handle_outliers
                   ],outercb)
}
function detector_loop(detectors,cb){
    console.log('detectors are '+JSON.stringify(detectors))
    var d_y = []
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
    console.log(d_y)
    async.eachLimit(d_y,1,detector_waterfall,cb)
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
