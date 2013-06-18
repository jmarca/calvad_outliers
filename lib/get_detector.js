var couchCache = require('calvad_couch_cacher').couchCache;
var reducer = require('calvad_reducer').simple_reducer

function get_detector(feature,next){
    var accum = new reducer({});
    var getter = couchCache().get(accum.process_collated_record)
    // build the feature to extract

    // stupid annoying long lived architecture decisions.  I'm still
    // making this stupid feature thing long after I've stopped trying
    // to make geo_json features in my responses!

    getter(feature,function(e,f){
        if(e) return next(e)
        next(null, accum.stash_out())
        // accum.reset()
        // only do that if I actually start reusing the accumulator
        return null
    })
}

module.exports=get_detector