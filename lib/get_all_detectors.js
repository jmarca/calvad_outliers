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
        return cb(null,[ // '1008510',
                         // '1015510',
                         // '1208945',
                         // '1209531',
                         // '1210716',
                         // '1211515',
                         // '1211528',
                         // '1212348',
                         // '1212347',
                         // '315060',
                         // '316856',
                         // '316862',
                         // '316916',
                         // '316928',
                         // '316922',
                         // '317042',
                         // '317146',
                         // '400096',
                         // '400128',
                         // '400287',
                         // '400320',
                         // '400382',
                         // '400551',
                         // '400563',
                         // '400666',
                         // '400776',
                         // '400870',
                         // '400926',
                         // '401048',
                         // '401073',
                         // '401085',
                         // '401139',
                         // '401137',
                         // '401154',
                         // '401247',
                         // '401284',
                         // '401405',
                         // '401438',
                         // '401492',
                         // '401507',
                         // '401623',
                         // '401625',
                         // '401633',
                         // '401708',
                         // '401728',
                         // '401792',
                         // '401802',
                         // '401937',
                         // '402013',
                         // '402205',
                         // '500013',
                         // '716050',
                         // '716271',
                         // '716441',
                         // '716939',
                         // '716940',
                         // '716942',
                         // '716941',
                         // '716943',
                         // '716944',
                         // '716975',
                         // '717016',
                         // '717232',
                         // '717229',
                         // '717339',
                         // '717387',
                         // '717399',
                         // '717560',
                         // '717859',
                         // '717929',
                         // '717970',
                         // '717983',
                         // '718102',
                         // '718376',
                         // '718499',
                         // '759289',
                         // '763539',
                         // '763970',
                         // '764125',
                         // '764206',
                         // '764891',
                         // '766875',
                         // '768238',
                         // '768598',
                         // '769405',
                         // '816150',
                         'wim.22.E',
                         'wim.22.W',
            'wim.23.E',
            'wim.23.W'// ,
                         // 'wim.31.S',
                         // 'wim.64.W',
                         // 'wim.64.E',
                         // 'wim.80.W'
        ]
                 )
    }

}

//module.exports=get_all_detectors
module.exports=known_outliers