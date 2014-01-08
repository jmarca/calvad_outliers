/*global console require __dirname */
var env = process.env
var fs = require('fs')
var csv = require('csv')
var _ = require('lodash')
var async = require('async')

/** one off program to convert couchdb reduce output to csv */

/** output format:
 *
 *  {"rows":[
 *              {"key":["county_ALAMEDA_2007","detector based"],
 *              "value":{"sum":10520221822.059999466,
 *                       "count":365,
 *                       "min":11898823.38000000082,
 *                       "max":43468836.20000000298,
 *                       "sumsqr":313994568815128064.0}
 *                       }
 *             }, ...
 *           ]
 *  }
 *
**/
var csv_header = ['idx','county','year','type','vmt sum','days','vmt min', 'vmt max', 'vmt sumsqr', 'vmt mean']

function process(options,cb){
    var data = JSON.parse(options.filetext)
    var writestream = options.writestream
    function write_record(record,i){
        var dump = [i]
        var c_c_y = record.key[0].split('_')
        dump.push(c_c_y[1]) // county name
        dump.push(c_c_y[2]) // year
        dump.push(record.key[1]) // type
        _.each(['sum','count','min','max','sumsqr']
              ,function(v,i){
                   dump.push(record.value[v])
                   return null
               });
        dump.push (record.value.sum / record.value.count)
        writestream.write(dump)

    }
    writestream.write(csv_header)
    _.each(data.rows,write_record)
    return cb(null,options)
}

function read_file(options,cb){
    fs.readFile(options.filename,'utf8',function(err,data){
        if(err){
            console.log(err)
            return cb(err)
        }
        options.filetext = data
        return cb(null,options)
    })
}

function writer(options,cb){
    var csv_writer = csv()
    csv_writer.pipe(options.output)
    options.writestream=csv_writer
    return cb(null,options)
}

function open_file_pipe(options,cb){
    options.output = fs.createWriteStream(__dirname+'/'+options.out_filename)
    return cb(null,options)
}


async.waterfall([function(cb){
                     var opts = {'filename':'calvad_whpms_dump.json'
                                ,'out_filename':'calvad_whpms_dump.csv'
                                }
                     return cb(null,opts)
                 }
                ,open_file_pipe
                ,writer
                ,read_file
                ,process]
               ,function(e,data){
                    if(e) console.log('died')
                    console.log('done')
                })
