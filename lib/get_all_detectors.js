var viewer = require('couchdb_get_views')
var tracking_db = process.env.CALVAD_TRACKING_DB || 'vdsdata%2ftracking'
var _ = require('lodash')

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


function known_outliers(){
    return function(cb){
        return cb(null,['1000110',
                        '1010110',
                        '1205452',
                        '1209043',
                        '1210574',
                        '1211471',
                        '1212265',
                        '314821',
                        '316605',
                        '317044',
                        '400060',
                        '400201',
                        '400338',
                        '400480',
                        '400628',
                        '400754',
                        '400905',
                        '401075',
                        '401209',
                        '401365',
                        '401485',
                        '401613',
                        '401736',
                        '401870',
                        '402157',
                        '402481',
                        '716047',
                        '716167',
                        '716399',
                        '716856',
                        '716972',
                        '717216',
                        '717357',
                        '717481',
                        '717825',
                        '717953',
                        '718094',
                        '718229',
                        '718384',
                        '759280',
                        '763429',
                        '763802',
                        '764206',
                        '764698',
                        '766585',
                        '768056',
                        '768530',
                        '769043',
                        '816084',
                        'wim.104.N',
                        'wim.61.E']
                 )
    }

}

//module.exports=get_all_detectors
module.exports=known_outliers