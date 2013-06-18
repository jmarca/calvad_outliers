/* global require console process describe it */

var should = require('should')

var _ = require('lodash')

var get_time = require('../lib/get_time')

describe('get time',function(){
    it('should get 2007 start and end times',function(done){
        var start_end = get_time(2007)
        start_end.should.have.property('start')
        start_end.should.have.property('end')
        start_end.start.getFullYear().should.eql(2007)
        start_end.end.getFullYear().should.eql(2008)
        return done()
    })
})
