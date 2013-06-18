var _ = require('lodash')

// copied from lodash, modified for my needs here (I want to keep zero values)
/**
* Creates an array with all falsey values of `array` removed. The values
* `false`, `null`, `0`, `""`, `undefined` and `NaN` are all falsey.
*
* @static
* @memberOf _
* @category Arrays
* @param {Array} array The array to compact.
* @returns {Array} Returns a new filtered array.
* @example
*
* _.compact([0, 1, false, 2, '', 3]);
* // => [1, 2, 3]
*/
function compact(array,key) {
    var index = -1,
        length = array ? array.length : 0,
        result = [];

    while (++index < length) {
        var record = array[index];
        var value = record[key]
        if(typeof value === 'number' &&
            !(  Number.isNaN(value) || value === undefined || value === '' )
          ){
            result.push(record);
        }
    }
    return result;
}
function compare(key){
    return function(a,b){
        return a[key] - b[key]
    }
}
// algorithm based on median function in R source, version 3.0.0
//  File src/library/stats/R/median.R
//  Part of the R package, http://www.R-project.org
//
//  Copyright (C) 1995-2012 The R Core Team
//
//  This program is free software; you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation; either version 2 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  A copy of the GNU General Public License is available at
//  http://www.r-project.org/Licenses/

function median(x,key,callback){
    try{
        // filter out null,
        x = compact(x,key)
        var n = x.length
        if(n === 0) return null
        var half = Math.floor(n/2)
        // check for even or odd number of values
        // sort the array
        x.sort(compare(key))
        if(n % 2 == 1){
            // odd number of values, easy
            return callback(null,x[half])
        }
        // else, even numbers, so what?  mean of last two?  round
        // down?  for now, just take x[half].  So for four elements,
        // half=2, so you're taking x[2], which is the higher side of
        // the middle value between the lower median and the higher
        // median.  R averages the two values, but I'm not sure what
        // averaging means in this context
        return callback(null,x[half])

    }catch(err){
        callback(err)
    }
    return null
}

module.exports=median
