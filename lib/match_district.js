function pad(n){return n<10 ? '0'+n : n}
function match_district (did){
    if(/wim/.test(did)){
        // WIM data is in the wim district!
        return 'wim';
    }
    var district_regex = /^(\d{1,2})\d{5}$/;
    var match = district_regex.exec(did);
    if (match && match[1] !== undefined){
        return ['d',pad(match[1])].join('');
    }
    // need an hpms check here
    //todo:  hpms pattern check
    return null;
}

module.exports=match_district
