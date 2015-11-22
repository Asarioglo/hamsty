define(['js/hamstertech', 'js/socketio', 'js/graph'], function(HamsterTech, io, graph) {


    var normalizeTime = function(date) {
        var seconds = date.getSeconds();
        var minutes = date.getMinutes();
        var hour = date.getHours();
        return hour + ':' + minutes + ':' + seconds;
    };

    function init() {
        window._app = new HamsterTech();
        window._app.initializeListeners();
        window._app.start_data_requests();
        window._graph = new graph();
        window._graph.draw([{speed: 0, time: normalizeTime(new Date())}]);
    }

    $.ajaxSetup({
        beforeSend: function(xhr) {
            xhr.setRequestHeader('usr-id-uuid', window.localStorage.getItem('guid'));
        },
        cache: false
    });

    return {
        init: init
    };
});
