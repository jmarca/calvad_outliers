var viewer = require('couchdb_get_views')
var tracking_db = process.env.CALVAD_TRACKING_DB || 'vdsdata%2ftracking'

function get_all_detectors(start_detector,limit){
    return function(cb){
        // get all of the detectors
        var vdsid_pattern = /^\d{6,7}$/;
        var wim_pattern = /^wim\.\d{1,3}\.(N|S|E|W)$/;
        var opts = {'db':tracking_db
                   ,'view':'_all_docs'
                   ,'include_docs':false}
        if(start_detector) opts.startkey=start_detector
        if(limit) opts.limit = limit
        viewer(opts
              ,function(e,r){
                   var idlist = _.map(r.rows
                                     ,function(r){
                                          if(vdsid_pattern.test(r.id)
                                           || wim_pattern.test(r.id))
                                              return r.id
                                          return null
                                      })
                   return cb(null,_.compact(idlist))
               })
        return null
    }

}

module.exports=get_all_detectors