/**
 * Created by Alexandr on 11/22/2015.
 */
var normalizeTime = function(date) {
    var seconds = date.getSeconds();
    var minutes = date.getMinutes();
    var hour = date.getHours();
    return hour + ':' + minutes + ':' + seconds;
};
console.log(normalizeTime(new Date()));