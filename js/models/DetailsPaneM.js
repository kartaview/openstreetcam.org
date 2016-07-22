/*
 * This file is part of the openstreetview.org
 *
 * Copyright ©2016, Telenav, Inc.  All Rights Reserved
 *
 * The code is licensed under the LGPL Version 3 license 
 *  http://www.gnu.org/licenses/lgpl-3.0.en.html.
 */
define(['models/BasicPaneM'], function(BasicPaneModel) {

    return BasicPaneModel.extend({

        defaults: {
            routeId: null,
            markerIndex: null,
            user: null,
            date: null,
            owner: false,
            platform: null,
            totalPhotos: 0,
            photos: [],
            groupedPhotos: [],
            backLabel: false,
        },

        parseResponse: function(data) {
        	var photos = {}; 
        	_.each(data.osv.photos, function(photo){
        		photos[photo.sequence_index] = photo;
        	});
            
        	this.setData({
        		user: data.osv.user,
        		date: data.osv.date_added,
        		owner: data.osv.owner,
        		photos: photos,
                totalPhotos: Object.keys(photos).length,
                platform: data.osv.platform
        	}, true);
        	var markerIndex = this.getLoopedId(this.get('markerIndex'), 'fwd');
            this.setData({
                markerIndex: markerIndex
            }, true);
        	this.trigger('new:photos');
        },

        setData: function(data, silent) {
            this.set(data, {silent: silent});
        },

        getLoopedId: function(index, dir) {
            var nrItems = this.get('totalPhotos');
            if(index > nrItems - 1) {
                index = index - nrItems;
            } else  if(index < 0) {
                index = nrItems + index;
            }
            if (typeof this.get('photos')[index] == 'undefined') {
                if (dir == 'fwd') {
                    index = index + 1;
                } else {
                    index = index - 1;
                }
                return this.getLoopedId(index, dir);
            }
            return index;
        },
        requestData: function() {
            var self = this;
            return $.when($.ajax({
                type: 'POST',
                url: '/details',
                beforeSend: function(jqXHR) {
                    self.xhrPool.push(jqXHR);
                },
                data: { id: self.get('routeId'), platform: 'web' },
                async: true
            })).done(function(data){
                self.parseResponse(data);
            });
        }

    });

});