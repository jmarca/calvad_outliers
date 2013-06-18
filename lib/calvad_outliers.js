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
var years = [2007,2008,2009]
var get_time = require('./get_time')
var get_detector = require('./get_detector')

function get_all_detectors(cb){
    // get all of the detectors

}
var header = ["ts","freeway","n","hh","not_hh","o","avg_veh_spd","avg_hh_weight","avg_hh_axles","avg_hh_spd","avg_nh_weight","avg_nh_axles","avg_nh_spd","miles","lane_miles","detector_count","detectors"]

function detector_waterfall(feature,cb){
    async.waterfall([function(cb){
                         // yeah there is probably some sort of apply
                         // I can do, but whatever
                         cb(feature)
                     }
                    ,get_detector
                    ,function(e,data){
                         // make the data good for compute_aadt
                         var task = {'flatdata' : data
                                    ,'features':[feature]
                                    }

                     }
                    ])
}

function detector_loop(detectors,cb){
    var d_y = []
    _.each(detectors
          ,function(d){
               _.each(years
                     ,function(y){
                          var start_end = get_time(y)
                          var feature = {'properties':{'detector_id':d
                                                      ,'ts':   start_end.start.getTime()/1000
                                                      ,'endts':start_end.end.getTime()/1000
                                                      }}
                          d_y.push(feature)
                      })
           });
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
