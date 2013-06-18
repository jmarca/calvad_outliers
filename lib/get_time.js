/*global exports */
// small utility to get a date range from a passed in year, year&month


function get_time(year,month){
    var startend={}
    var start;
    var end;
    var yr = +year
    if(yr && month){
        // new Date(year, month, day, hours, minutes, seconds, ms)
        start = new Date(yr,+month - 1,1,0,0,0);
        end   = new Date(yr,+month,1,0,0,0);
    }else{
        // get a whole year
        start = new Date(yr  ,0,1,0,0,0);
        end   = new Date(yr+1,0,1,0,0,0);
    }
    startend.start=start;
    startend.end=end;
    return startend;
}
module.exports = get_time
