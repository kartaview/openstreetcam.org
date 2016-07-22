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
            id: null,
            bbox: null,
            prevBbox: null,
            tracks: {},
            drawTracks: {},
            prevTracks: {},
            photos: [],
            info: {},
            total: {},
            action: false,
            selectedPosition: false,
            nearSequences: [],
            bboxHistory:[],
            map: {}
        },

        parseResponse: function(data) {
            var self = this;
         //    var bbox = this.get('map').getBounds();
         //    var self = this,
         //        bboxKey = bbox._northEast.lat + '_' + bbox._southWest.lng +'_'+ bbox._southWest.lat + '_' + bbox._northEast.lng;

         //    var tracks = self.get('tracks');
         //    if (typeof tracks[bboxKey] == 'undefined') {
         //        tracks[bboxKey] = {};
         //    }
        	// _.each(data.currentPageItems, function(track){
        	// 	tracks[bboxKey][track.element_id] = track;
        	// });
            var tracks = self.get('tracks');
            _.each(data.currentPageItems, function(track){
                tracks[track.element_id] = track;
            });
            this.set({
                tracks: tracks
            },{silent: true});
            // if (Object.keys(this.get('tracks')[bboxKey]).length == this.get('totals')[bboxKey]) {
                // self.removeTracks(bboxKey);
            // }
        	this.trigger('new:tracks');
        },
        
        parseTrackResponse: function(data, silent) {
        	var silent = silent || false;
        	
        	if(typeof data.osv.photos == 'undefined' || data.osv.photos.length == 0) return;
        	
        	this.set({
        		photos: data.osv.photos,
        		info: {
        			date: data.osv.date_added,
        			user: data.osv.user
        		}
        	},{silent: true});
        	
        	if(!silent) this.trigger('new:photos');
        },
        clearSelectedPosition: function() {
            this.set({
                selectedPosition : false,
                nearSequences : []
            } , {silent: true});
        },
        parseNearResponse: function(data, silent) {
            var silent = silent || false;
            if(typeof data.osv.lat == 'undefined') {
                this.clearSelectedPosition();
            } else {
                this.set({
                    selectedPosition : {lat:data.osv.lat, lng:data.osv.lng},
                    nearSequences : data.osv.sequences
                } , {silent: true});
            }
            this.trigger('new:near');
        },
        setData: function(data, silent) {
            this.set(data, {silent: silent});
        },
        
        setTracks: function(tracks) {
        	var tmp = this.get('drawTracks');
        	if(_.size(tracks) > 0) tmp = $.extend({}, tmp, tracks);
        	
        	this.set({drawTracks: tmp}, {silent: true});
        },
        
        getTracks: function() {
        	var tmp = [],
        		tracks = this.get('drawTracks');
        		
        	_.each(tracks, function(track, key){
        		tmp.push(key);
        	});
        	
        	return tmp.join(',');
        },

        getAction: function() {
            return this.get('action');
        },
        
        removeTracks: function(bboxKey) {
        	var self = this;
        	var tracks = self.get('tracks');
            for(var key in tracks){
                if (key != bboxKey) {
                    var bbox = key.split('_');
                    if (self.alreadyLoaded(bbox) === false) {
                        delete tracks[key];
                    }
                }    
        	}
            // self.setData('tracks', tracks);
        },

        requestData: function() {
            var self = this,
                bbTopLeft = this.get('bbox')._northEast.lat + ',' + this.get('bbox')._southWest.lng,
                bbBottomRight = this.get('bbox')._southWest.lat + ',' + this.get('bbox')._northEast.lng,
                bboxKey = this.get('bbox')._northEast.lat + '_' + this.get('bbox')._southWest.lng +'_'+ this.get('bbox')._southWest.lat + '_' + this.get('bbox')._northEast.lng;
            var page = 1;
            var ipp = 3000;
            var excludeBbTopLeft, excludeBbBottomRight, prevBbox = null;
            if(prevBbox = this.get('prevBbox')) {
                excludeBbTopLeft = prevBbox.bbTopLeft;
                excludeBbBottomRight = prevBbox.bbBottomRight;
            }
            $.when(self.requestDataAjax(bbTopLeft, bbBottomRight, self, page, ipp, excludeBbTopLeft, excludeBbBottomRight)).done(function(data){
                var currentTotal = data.currentPageItems.length;
                var total = parseInt(data.totalFilteredItems[0]); 
                self.setData({prevBbox:{bbTopLeft: bbTopLeft, bbBottomRight:bbBottomRight}, total: total}, true);
                self.parseResponse(data);
                if (currentTotal < total) {
                    page = page + 1;
                    self.loadPaginated(page, ipp, currentTotal, total);
                }
            });
        },

        loadPaginated: function(page, ipp, currentTotal, total) {
            var self = this,
                bbTopLeft = this.get('bbox')._northEast.lat + ',' + this.get('bbox')._southWest.lng,
                bbBottomRight = this.get('bbox')._southWest.lat + ',' + this.get('bbox')._northEast.lng;
            for(var i = page; i <= Math.ceil(total/ipp); i++) {
                $.when(self.requestDataAjax(bbTopLeft, bbBottomRight, self, i, ipp)).done(function(data){
                    self.parseResponse(data);
                });
            }
            var bboxHistory = self.get('bboxHistory');
            bboxHistory.push(self.get('bbox'));
            self.set({
                bboxHistory: bboxHistory
            },{silent: true});
        },
        
        requestDataAjax: function(bbTopLeft, bbBottomRight, self, page, ipp, excludeBbTopLeft, excludeBbBottomRight) {
            var self = this;
            
        	return $.ajax({
				type: 'POST',
				url: '/tracks',
                beforeSend: function(jqXHR) {
                    self.xhrPool.push(jqXHR);
                },
				data: { bbTopLeft: bbTopLeft, bbBottomRight: bbBottomRight, drawTracks: self.getTracks(), platform: 'web', page: page, ipp: ipp, action: self.getAction() },
				async: true
        	});
        },
        
        requestTrackDetails: function() {
            var self = this;
            
        	$.when(self.requestTrackDetailsAjax(self)).done(function(data) {
                self.parseTrackResponse(data);
            });
        },
        requestNear: function(lat, lng, distance) {
            var self = this;
            $.when(self.requestNearAjax(lat, lng, distance)).done(function(data) {
                self.parseNearResponse(data);
            });
        },
        requestNearAjax: function(lat,lng, distance) {
            var self = this;
            return $.ajax({
                type: 'POST',
                url: '/nearby-tracks',
                beforeSend: function(jqXHR) {
                    self.xhrPool.push(jqXHR);
                },
                data: { lat: lat, lng:lng, distance:distance },
                async: true
            });
            // return $.post('/nearby-tracks', { lat: lat, lng:lng, distance:distance });
        },
        
        requestTrackDetailsAjax: function(self) {
        	return $.post('/details', { id: self.get('id') });
        	
        	/*return $.ajax({
				type: 'POST',
				url: '/details',
				data: { id: self.get('id') },
				async: false
        	});*/
        },
        
        requestInOrder: function() {
        	var self = this,
            	bbTopLeft = this.get('bbox')._northEast.lat + ',' + this.get('bbox')._southWest.lng,
            	bbBottomRight = this.get('bbox')._southWest.lat + ',' + this.get('bbox')._northEast.lng;
            	
            $.when(self.requestDataAjax(bbTopLeft, bbBottomRight, self)).done(function(data){
            	self.parseResponse(data);
            	
            	$.when(self.requestTrackDetailsAjax(self)).done(function(data){
            		self.parseTrackResponse(data, true);
            	
            		self.trigger('select:track');
            	});
            });
        },
        
        clearData: function() {
        	this.set({
        		id: null,
	            photos: [],
	            info: {}
        	}, {silent: true});
        },

        alreadyLoaded: function(bbox) { 
            var currentBbox = this.get('map').getBounds();  
            console.log((parseFloat(bbox[0]) <= currentBbox._northEast.lat && parseFloat(bbox[0]) >= currentBbox._southWest.lat
                && parseFloat(bbox[3]) <= currentBbox._northEast.lng && parseFloat(bbox[3]) >= currentBbox._southWest.lng
                ));
            console.log((parseFloat(bbox[2]) <= currentBbox._northEast.lat && parseFloat(bbox[2]) >= currentBbox._southWest.lat
                && parseFloat(bbox[1]) <= currentBbox._northEast.lng && parseFloat(bbox[1]) >= currentBbox._southWest.lng
            ));
            console.log(currentBbox);
            console.log(bbox);
            if ((parseFloat(bbox[0]) <= currentBbox._northEast.lat && parseFloat(bbox[0]) >= currentBbox._southWest.lat
                && parseFloat(bbox[3]) <= currentBbox._northEast.lng && parseFloat(bbox[3]) >= currentBbox._southWest.lng
                ) || 
                (parseFloat(bbox[2]) <= currentBbox._northEast.lat && parseFloat(bbox[2]) >= currentBbox._southWest.lat
                && parseFloat(bbox[1]) <= currentBbox._northEast.lng && parseFloat(bbox[1]) >= currentBbox._southWest.lng
            )) {
                console.log("intersects");
                return true;
            }
            console.log("doesn't intersects");
            return false;
        },

    });

});