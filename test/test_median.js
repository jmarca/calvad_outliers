/* global require console process describe it */

var should = require('should')

var _ = require('lodash')

var median = require('../lib/median')

var reducer = require('calvad_reducer').simple_reducer
var cacher = require('calvad_couch_cacher').couchCache()

// got some actual couchdb values and use the median operator on them
var test = { header:
             [ 'ts', undefined, 'n', 'hh', 'not_hh', 'o', 'avg_veh_spd', 'avg_hh_weight', 'avg_hh_axles', 'avg_hh_spd', 'avg_nh_weight', 'avg_nh_axles', 'avg_nh_spd', 'miles', 'lane_miles', 'detector_count', 'detectors' ],
  data:
   [ [ '2008-07-25 13:00', 205, 3580.5, 140.33, 59.6, 0.1, 69.09, 53.33, 4.58, 56.82, 13.12, 2.3, 78.42, 0.06, 0.18, 1, '1013410' ],
     [ '2008-07-25 14:00', 205, 3760.41, 140.04, 46.75, 0.2, 64.78, 47.76, 5.71, 65.39, 12.55, 2.49, 73.73, 0.06, 0.18, 1, '1013410' ],
     [ '2008-07-25 15:00', 205, 3652.72, 130.35, 63.55, 0.28, 68.19, 51.09, 4.24, 56.22, 11.31, 2.03, 70.6, 0.06, 0.18, 1, '1013410' ] ] }

var test2 = _.clone(test,true)
test2.data.push( [ '2008-07-25 16:00', 205, 4223.46, 127.69, 44.3, 0.14, 73.29, 50.44, 5.48, 65.79, 13.18, 2.24, 65.2, 0.06, 0.18, 1, '1013410' ])

describe('compute median for an array of arrays based on one element',function(){
    it('works properly for odd length array',function(done){
        median(test.data,2
              ,function(e,r){
                   should.not.exist(e)
                   should.exist(r)
                   // should have picked the correct record, based on 'n'
                   // which is the second highest n-value in the array
                   r.should.eql(['2008-07-25 15:00', 205, 3652.72, 130.35, 63.55, 0.28, 68.19, 51.09, 4.24, 56.22, 11.31, 2.03, 70.6, 0.06, 0.18, 1, '1013410' ])
                   return done()
               })

    })
    it('works properly for even length array',function(done){
        median(test2.data,2
              ,function(e,r){
                   should.not.exist(e)
                   should.exist(r)
                   // should have picked the correct record, based on 'n'
                   // which is the third highest n-value in the even-sized array
                   r.should.eql(['2008-07-25 14:00', 205, 3760.41, 140.04, 46.75, 0.2, 64.78, 47.76, 5.71, 65.39, 12.55, 2.49, 73.73, 0.06, 0.18, 1, '1013410' ])
                   return done()
               })

    })
})
