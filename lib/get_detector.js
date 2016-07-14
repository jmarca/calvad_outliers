var couchCache = require('calvad_couch_cacher').couchCache;
var reducer = require('calvad_reducer').simple_reducer

// hack.
var env = process.env
var _cuser = env.COUCHDB_USER
var _cpass = env.COUCHDB_PASS
var _chost = env.COUCHDB_HOST
var _cport = env.COUCHDB_PORT || 5984
// hack

function get_detector(feature,next){
    var accum = new reducer({});
    // hack
    var opts = {
        'auth':{
            'username':_cuser
            ,'password':_cpass
        }
        ,'host':_chost
        ,'port':_cport
        ,'years':[feature.properties.year]
        // hacking more?
        ,'imputeddb':env.COUCH_CACHE_PREFIX
    }
    var getter = couchCache(opts).get(accum.process_collated_record)
    // build the feature to extract

    // stupid annoying long lived architecture decisions.  I'm still
    // making this stupid feature thing long after I've stopped trying
    // to make geo_json features in my responses!

    getter(feature,function(e,f){
        if(e) throw new Error(e)
        next(null, accum.stash_out())
        accum.reset()
        // only do that if I actually start reusing the accumulator
        return null
    })
}

module.exports=get_detector
