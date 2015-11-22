/**
 * Created by Alexandr on 11/20/2015.
 */
define(['js/waterbottles'], function(bottles) {
    var HamsterTech = function () {
        this._water_level = 0;
        this._temperature = 0;
        this._humidity = 0;
        this._status = 1;
        this.change_water_level(1);
    };

    /**
     *
     */
    HamsterTech.prototype.bottle_level_test = function () {
        var i = 1;
        this.change_water_level(i++);
        setInterval(function () {
            this.change_water_level(i++);
            if (i === 6) i = 1;
        }.bind(this), 2000)
    };

    /**
     *
     */
    HamsterTech.prototype.change_water_level = function (l) {
        if (l !== null || l !== undefined) {
            var water_bottle = $('#water-bottle-image');
            water_bottle.attr('src', bottles[l]);
            this._water_level = l;
        }
    };

    /**
     *
     */
    HamsterTech.prototype.change_temp_humidity = function (temperature, humidity) {
        if (temperature) {
            this._temperature = temperature;
            $('.room-temperature-span').html(temperature);
        }
        if (humidity) {
            this._humidity = humidity;
            $('.room-humidity-span').html(humidity);
        }
    };

    /**
     *
     */
    HamsterTech.prototype.change_hamster_status = function (status) {
        var status_field = $('.hamster-status-span');
        switch (status) {
            case 0:
                status_field.html('Active');
                this._status = status;
                break;
            case 1:
                status_field.html('Running');
                this._status = status;
                break;
            case 2:
                status_field.html('Sleeping');
                this._status = status;
                break;
            default:
                return;
        }
    };

    HamsterTech.prototype.change_distance = function(d) {
        $('.distance-span').html(d);
    };

    /**
     *
     */
    HamsterTech.prototype.start_data_requests = function () {
        setInterval(function () {
            var url = 'api/v1/getGeneralData';
            $.ajax(url, {
                success: function(data) {
                    this.process_data(data);
                }.bind(this),
                error: function(e) {
                    console.log(e);
                }
            })
        }.bind(this), 1000);
    };

    /**
     *
     */
    HamsterTech.prototype.process_data = function (data) {
        this.change_temp_humidity(data.temperature, data.humidity);
        //this.change_water_level(data.water_level);
        this.change_hamster_status(data.status);
        this.change_speed(data.speed, data.current_speed);
        this.change_water_level(data.waterlevel);
        this.change_distance(data.distance);
        this.change_calories(data.calories);
        this.changebuttons(data.fanon, data.lightson);
    };

    HamsterTech.prototype.changebuttons = function(f, l) {
        var fan = $('#button-fan');
        var light = $('#button-light');
        if(f == 1) {
            if(fan.hasClass('btn-success'))
                fan.removeClass('btn-success');
            fan.addClass('btn-danger');
        } else {
            if(fan.hasClass('btn-danger'))
                fan.removeClass('btn-danger');
            fan.addClass('btn-success');
        }
        if(l == 1) {
            if(light.hasClass('btn-success'))
                light.removeClass('btn-success');
            light.addClass('btn-danger');
        } else {
            if(light.hasClass('btn-danger'))
                light.removeClass('btn-danger');
            light.addClass('btn-success');
        }
    };

    HamsterTech.prototype.change_calories = function(c) {
        $('.calories-span').html(c);
    };

    HamsterTech.prototype.change_speed = function(s, cs) {
        window._graph.draw(s);
        $('.speed-span').html(cs);
    };

    HamsterTech.prototype.initializeListeners = function() {
        $('#button-feed').on('click', function() {
            this.feedHamster();
        }.bind(this));
        $('#button-fan').on('click', function() {
            this.toggleFan();
        }.bind(this));
        $('#button-light').on('click', function() {
            this.toggleLights();
        }.bind(this));
    };

    HamsterTech.prototype.feedHamster = function(e) {
        //e.preventDefault();
        $.ajax('feedhamster', {
            method: 'POST',
            success: function() {
                this.sendSuccessEvent('Hamster was fed successfully');
            }.bind(this),
            error: function(e) {
                this.sendErrorEvent(e);
            }
        })
    };
    HamsterTech.prototype.toggleFan = function(e) {
        //e.preventDefault();
        $.ajax('togglefan', {
            method: 'POST',
            success: function() {
                this.sendSuccessEvent('Hamster was fed successfully');
            }.bind(this),
            error: function(e) {
                this.sendErrorEvent(e);
            }
        })
    };

    HamsterTech.prototype.sendSuccessEvent = function() {

    };

    HamsterTech.prototype.toggleLights = function(e) {
        //e.preventDefault();
        $.ajax('togglelights', {
            method: 'POST',
            success: function() {
                this.sendSuccessEvent('Hamster was fed successfully');
            }.bind(this),
            error: function(e) {
                this.sendErrorEvent(e);
            }
        })
    };
    return HamsterTech;
});