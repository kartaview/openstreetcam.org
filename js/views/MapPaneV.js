/*
 * This file is part of the openstreetview.org
 *
 * Copyright ©2016, Telenav, Inc.  All Rights Reserved
 *
 * The code is licensed under the LGPL Version 3 license 
 *  http://www.gnu.org/licenses/lgpl-3.0.en.html.
 */
define([
    'views/BasicPaneV'
], function(
    BasicPaneView
    ) {

    return BasicPaneView.extend({

		el: $('#MAP_SECTION'),
        template: _.template($('#tpl_map').html()),
        galleryThumb: _.template($('#tpl_galleryThumb').html()),
        nearSequences:_.template($('#tpl_nearsequences').html()),
        galleryM: false, // Gallery Model
        action: false,
        canvas: false,

        initialize: function(options) {
            BasicPaneView.prototype.initialize.call(this);
            
            this.mapEvents = true;
            this.galleryM = this.options.galleryM;
            this.polylineSelected = false;
            this.polylineSelectedId = false;
            this.marker = false;
            this.markerIndex = false;
            // this.matched = false;

            this.listenTo(this.model, 'new:tracks', this.render);
            this.listenTo(this.model, 'new:near', this.renderCurrentPosition);
            // this.listenTo(this.model, 'delete:tracks', this.deleteTracks);
            this.listenTo(this.model, 'new:photos', this.renderGallery);
            this.listenTo(this.model, 'select:track', this.afterSelectTrack);

            // this.listenTo(this.galleryM, 'gallery:toggle', this.galleryToggle);
            // this.listenTo(this.galleryM, 'change:marker', this.getPhotoLatlng);

            this.$el.html(this.template(this.model.toJSON()));
            var matched = location.href.match(/@-?\d+.\d+,-?\d+.\d+,\d+z?,?[a-z]+/gi);
            this.action = false;
            var currentLocation = {
                latLng:  [37.72863798965106,-122.38460540771483],
                zoom: 11,
            };
            if (matched) {
                this.matched = true;
                var params = matched[0].split(',');
                currentLocation.latLng = [parseFloat(params[0].substring(1)), parseFloat(params[1])];
                currentLocation.zoom = parseInt(params[2]);
                this.action = typeof params[3] !== 'undefined'?params[3]:false;
            }
            this.map = L.skobbler.map('map',{
                worldCopyJump: true,
                apiKey: 'bc7b4da77e971c12cb0e069bffcf2771',
                mapStyle: 'lite',           // day / lite / night / bike / outdoor
                bicycleLanes: false,        // true / false
                onewayArrows: true,         // true / false
                pois: 'all',                // all / none / important
                primaryLanguage: 'en',      // en / de / fr / it / es / ru / tr
                fallbackLanguage: 'en',     // en / de / fr / it / es / ru / tr
                mapLabels: 'localNaming',   // localNaming / transliterationOnly / noTransliteration / nativeLocalized / transliterationNative
                retinaDisplay: 'auto',      // auto / yes / no
                
                zoomControl: true,                  // true / false
                zoomControlPosition: 'top-left',    // top-left / top-right / bottom-right / bottom-left
                            
                center: currentLocation.latLng,
                zoom: currentLocation.zoom,
                fullscreen: true
            });
            this.polylines = new L.layerGroup();
            this.polylines.addTo(this.map);
            L.CanvasOverlay = L.Class.extend({
                initialize: function (userDrawFunc, options) {
                    this._userDrawFunc = userDrawFunc;
                    L.setOptions(this, options);
                },

                drawing: function (userDrawFunc) {
                    this._userDrawFunc = userDrawFunc;
                    return this;
                },

                params:function(options){
                    L.setOptions(this, options);
                    return this;
                },
                
                canvas: function () {
                    return this._canvas;
                },

                redraw: function () {
                    if (!this._frame) {
                        this._frame = L.Util.requestAnimFrame(this._redraw, this);
                    }
                    return this;
                },

                reset: function () {
                    var topLeft = this._map.containerPointToLayerPoint([0, 0]);
                    L.DomUtil.setPosition(this._canvas, topLeft);
                },
              
                onAdd: function (map) {
                    this._map = map;
                    this._canvas = L.DomUtil.create('canvas', 'leaflet-heatmap-layer');

                    var size = this._map.getSize();
                    this._canvas.width = size.x;
                    this._canvas.height = size.y;

                    var animated = this._map.options.zoomAnimation && L.Browser.any3d;
                    L.DomUtil.addClass(this._canvas, 'leaflet-zoom-' + (animated ? 'animated' : 'hide'));


                    map._panes.overlayPane.appendChild(this._canvas);

                    map.on('moveend', this._reset, this);
                    map.on('resize',  this._resize, this);

                    if (map.options.zoomAnimation && L.Browser.any3d) {
                        map.on('zoomanim', this._animateZoom, this);
                    }

                    this._reset();
                },

                onRemove: function (map) {
                    map.getPanes().overlayPane.removeChild(this._canvas);
             
                    map.off('moveend', this._reset, this);
                    map.off('resize', this._resize, this);

                    if (map.options.zoomAnimation) {
                        map.off('zoomanim', this._animateZoom, this);
                    }
                    this_canvas = null;

                },
                getParams: function () {
                    var size     = this._map.getSize();
                    var bounds   = this._map.getBounds();
                    var zoomScale = (size.x * 180) / (20037508.34  * (bounds.getEast() - bounds.getWest())); // resolution = 1/zoomScale
                    var zoom = this._map.getZoom();
                    return {
                        canvas   :this._canvas,
                        bounds   : bounds,
                        size     : size,
                        zoomScale: zoomScale,
                        zoom : zoom,
                        options: this.options
                    };
                },
                addTo: function (map) {
                    map.addLayer(this);
                    return this;
                },

                _resize: function (resizeEvent) {
                    this._canvas.width  = resizeEvent.newSize.x;
                    this._canvas.height = resizeEvent.newSize.y;
                },
                _reset: function () {
                    this._redraw();
                },

                _redraw: function () {
                    var size     = this._map.getSize();
                    var bounds   = this._map.getBounds();
                    var zoomScale = (size.x * 180) / (20037508.34  * (bounds.getEast() - bounds.getWest())); // resolution = 1/zoomScale
                    var zoom = this._map.getZoom();
                    
                    // console.time('process');

                    if (this._userDrawFunc) {
                        this._userDrawFunc(this,
                        {
                            canvas   :this._canvas,
                            bounds   : bounds,
                            size     : size,
                            zoomScale: zoomScale,
                            zoom : zoom,
                            options: this.options
                       });
                    }
                   
                    this._frame = null;
                },

                _animateZoom: function (e) {
                    var scale = this._map.getZoomScale(e.zoom),
                        offset = this._map._getCenterOffset(e.center)._multiplyBy(-scale).subtract(this._map._getMapPanePos());
                    this._canvas.style[L.DomUtil.TRANSFORM] = L.DomUtil.getTranslateString(offset) + ' scale(' + scale + ')';
                }
            });

            L.canvasOverlay = function (userDrawFunc, options) {
                return new L.CanvasOverlay(userDrawFunc, options);
            };

            this.canvas = L.canvasOverlay().addTo(this.map);
            this.canvas.initialize(this.loadData, {view:this});
            this.model.setData({map: this.map});
        },
        prepareData: function() {
            var self = this;
            if(self.map.getZoom() >= 8) self.requestTracks();
            this.map.on("dragstart zoomstart", function(){
                self.$el.find('#currentPosition').hide();
                self.$el.find('#nearSequences').removeClass('opened').addClass('closed');
            });
            this.map.off('click').on('dragend zoomend', function(){
                if(!self.mapEvents) return;
                var url = "/map/@"+self.map.getCenter().lat + "," + self.map.getCenter().lng + "," + self.map.getZoom() + "z";
                if (self.action) {
                    url += ","+self.action;
                }
                var bbox = self.map.getBounds();
                var bboxKey = bbox._northEast.lat + '_' + bbox._southWest.lng +'_'+ bbox._southWest.lat + '_' + bbox._northEast.lng;
                history.pushState({}, '', url); 
            if(self.map.getZoom() >= 8) self.requestTracks();
            }).on('click', function(e){
                var radius = 50/self.map._zoom;
                self.model.requestNear(e.latlng.lat, e.latlng.lng, radius);
            });
            
            if(navigator.geolocation) {
                var onResponse = _.bind(this.locationFind, this),
                    onError = _.bind(this.locationError, this);
                navigator.geolocation.getCurrentPosition(onResponse, onError, {maximumAge: 50000, timeout: 20000, enableHighAccuracy: true});
            } else {
                if(user_ip) {
                    if(!this.matched) this.map.setView([user_ip.lat, user_ip.lng], 9);
                }
            }
        },
        clearCanvas: function()
        {
            var ctx = this.canvas.canvas().getContext('2d');
            ctx.clearRect(0, 0, this.canvas.canvas().width, this.canvas.canvas().height);
        },
        loadData: function(canvasOverlay, params)
        {
            var self = params.options.view;
            self.$el.find(".leaflet-container").addClass('loading');
            self.model.clearSelectedPosition();
        },
        render: function() {
            var self = this;
            var canvasOverlay = this.canvas;
            var params = canvasOverlay.getParams();
            canvasOverlay.reset();
            var ctx = params.canvas.getContext('2d');
            ctx.clearRect(0, 0, params.canvas.width, params.canvas.height);
            // for(var key in self.model.get('tracks')){
            //     self.drawPolyline(canvasOverlay, params, ctx, self.model.get('tracks')[key]);
            // }
            self.drawPolyline(canvasOverlay, params, ctx, self.model.get('tracks'));
            if (Object.keys(self.model.get('tracks')).length == self.model.get('total')) {
                self.model.setData({tracks:{}});
            }
            // self.drawChessBoard(ctx, params);
            self.$el.find(".leaflet-container").removeClass('loading');
        },
        drawChessBoard: function(ctx, params) {
            var startX = 0;
            var startY = 0;
            var color = 'white';
            var size = 16;
            var width = params.canvas.width/size;
            var height = params.canvas.height/size;
            for(var i = 0; i < height; i++) {
                startX = 0;
                for(var j = 0; j < width; j++) {
                    ctx.beginPath();
                    if ((i+j) % 2 == 0) {
                        color = "black";
                    } else {
                        color = "white";
                    }
                    ctx.fillStyle = color;
                    ctx.fillRect(startX,startY,size,size);
                    // ctx.arc(dot.x,dot.y,50,0,2*Math.PI);
                    // ctx.moveTo(prev.x,prev.y);
                    // ctx.lineTo(dot.x,dot.y);
                    ctx.stroke();
                    startX = startX + size;
                }
                startY = startY + size;
            }
        },
        drawPolyline: function(canvasOverlay, params, ctx, tracks)
        {
            var self = this;
            _.each(tracks, function(track, key) {
                if(typeof track.track != 'undefined' && track.track.length >= 1) {
                    for (var i = 0; i < track.track.length; i++) {
                        if(track.track[i][0] == null || track.track[i][1] == null || isNaN(track.track[i][0]) || isNaN(track.track[i][1])) continue;
                        var latlng = new L.LatLng(track.track[i][0], track.track[i][1]);
                        if (i == 0) {
                            var prev = latlng;
                            continue;
                        } else {
                            var prev = new L.LatLng(track.track[i - 1][0], track.track[i - 1][1]);
                        }
                        
                        if (params.bounds.contains(latlng)) {
                            ctx.beginPath();
                            var dot = canvasOverlay._map.latLngToContainerPoint(latlng);
                            var prev = canvasOverlay._map.latLngToContainerPoint(prev);
                            ctx.strokeStyle="rgb(189,16,224)";
                            ctx.lineWidth = 2;
                            // ctx.fillRect(dot.x,dot.y,1,1);
                            // ctx.arc(dot.x,dot.y,50,0,2*Math.PI);
                            ctx.moveTo(prev.x,prev.y);
                            ctx.lineTo(dot.x,dot.y);
                            ctx.stroke();
                            ctx.closePath();
                        }
                    }
                }
            });
        },
        initSequenceGallery: function()
        {
            var self = this;
            var wWidth = $(window).width();
            var nrPhotosPage = Math.floor(parseFloat(wWidth)/325);
            var nrPhotos = self.$el.find('#nearSequences .photo').size();
            var totalPages =  Math.round(nrPhotos/nrPhotosPage);
            var currentPage = 0;
            self.showPhotos(nrPhotosPage, currentPage);
            self.$el.find('#nearSequences .next').unbind('click').on('click', function(){
                self.$el.find('#nearSequences .previous').removeClass('disable');
                if (currentPage < totalPages - 1) {
                    currentPage++;
                    self.showPhotos(nrPhotosPage, currentPage);
                } else {
                    $(this).addClass('disable');
                }
            });
            self.$el.find('#nearSequences .previous').unbind('click').on('click', function(){
                self.$el.find('#nearSequences .next').removeClass('disable');
                if (currentPage > 0) {
                    currentPage--;
                    self.showPhotos(nrPhotosPage, currentPage);
                } else {
                    $(this).addClass('disable');
                }
            });
        },
        showPhotos: function(nrPhotosPage, page) {
            var self = this;
            self.$el.find('#nearSequences .photo').hide();
            var currentPosition = page*nrPhotosPage;
            self.$el.find('#nearSequences .photo').slice(currentPosition, currentPosition+nrPhotosPage).show();
        },
        renderCurrentPosition: function()
        {
            var self = this;
            var canvasOverlay = this.canvas;
            var params = canvasOverlay.getParams();
            canvasOverlay.reset();
            var ctx = params.canvas.getContext('2d');
            if (self.model.get('selectedPosition')) {
                var position = self.model.get('selectedPosition');
                var latlng = new L.LatLng(position.lat, position.lng);
                var dot = canvasOverlay._map.latLngToContainerPoint(latlng);
                self.$el.find('#currentPosition').show().css({top:dot.y-10, left: dot.x-10});
                self.$el.find('#nearSequences').removeClass('closed').addClass('opened').html(self.nearSequences({sequences: self.model.get('nearSequences')}));
                self.initSequenceGallery();
                self.$el.find('#nearSequences .photo').unbind("click").on('click', function(){
                    var sequenceId = $(this).data('sequence-id') || false;
                    var sequenceIndex = $(this).data('sequence-index') || 0;
                    var point = {
                        index: sequenceIndex,
                        latlng: latlng
                    }
                    self.selectTrack(sequenceId, point);
                });
                self.$el.find('#nearSequences .close-btn').unbind("click").on('click', function(){
                    self.$el.find('#currentPosition').hide();
                    self.$el.find('#nearSequences').removeClass('opened').addClass('closed');
                });
            } else {
                self.$el.find('#currentPosition').hide();
                self.$el.find('#nearSequences').removeClass('opened').addClass('closed');
            }
        },
	   
		deleteTracks: function(tracks) {
			var self = this;
			
			_.each(tracks, function(id){
				if(self.polylineSelectedId != id) self.polylines.removeLayer(id);
			});
		},
        
        requestTracks: function() {
            this.model.abortAll();
            this.model.setData({bbox: this.map.getBounds(), action: this.action, tracks:{}}, true);
            this.model.requestData();
        },
        
        requestDetails: function(routeId) {
        	this.model.setData({id: routeId}, true);
			this.model.requestTrackDetails();
        },
        
        selectTrack: function(routeId, point) {
        	this.model.trigger('go:details', {id: routeId, point: point});
        },
        
        afterSelectTrack: function() {
        	var trackId = this.model.get('id');
        	
        	if(typeof this.model.get('drawTracks')[trackId] != 'undefined') {
        		var layerId = this.model.get('drawTracks')[trackId],
        			layer = this.polylines.getLayer(layerId);
        			
        		if(this.polylineSelected) this.polylineSelected.setStyle({color: 'red'});
    			this.polylineSelected = layer;
    			this.polylineSelected.bringToFront();
    			layer.setStyle({color: 'green'});
    			this.polylineSelectedId = layer._leaflet_id;
    			
    			this.markerIcon(L.latLng(this.model.get('photos')[0].lat, this.model.get('photos')[0].lng));
        	}
        	
        	this.renderGallery();
        	this.addMapEvents();
        },
        
        renderGallery: function() {
            var self = this,
                galleryImages = [];
                
            _.each(this.model.get('photos'), function(photo){
                galleryImages.push(photo.lth_name);
            });
            this.galleryM.setData({items: galleryImages, trackInfo: { id: this.model.get('id'), user: this.model.get('info').user, date: this.model.get('info').date }}, true);
            
            this.galleryM.setData({item: self.markerIndex});
        },
        
        closeGallery: function() {
        	this.polylineSelected.setStyle({color: this.polylineSelected.options.className});
        	this.map.removeLayer(this.marker);
        	this.polylineSelected = false;
        	this.polylineSelectedId = false;
        	this.marker = false;
        	this.markerIndex = false;
        	this.model.clearData();
        	this.galleryM.clearData();
        },
        
        initMarker: function(latlnt) {
        	return L.circleMarker(latlnt, {
    			color: 'green',
    			stroke: false,
    			fillOpacity: 1
    		});
        },
        
		markerIcon: function(latlng, point, polyline) {
        	if(latlng) {
        		this.markerIndex = 0;
        	} else {
        		var point = this.getNearestPoint(point, polyline);
        		this.markerIndex = point.index;
        	}
        	
        	if(!this.marker)
        		this.marker = this.initMarker(latlng ? latlng : point.latlng).addTo(this.map);
        	else
        		this.changeMarkerPosition(latlng ? latlng : point.latlng);
        },
        
        changeMarkerPosition: function(latlng) {
        	if(!this.marker) return;
        	
        	this.marker.setLatLng(latlng);
        },
        
        getPhotoLatlng: function(point) {
        	var photo = this.model.get('photos')[point];
        	
        	this.changeMarkerPosition(L.latLng(photo.lat, photo.lng));
        },
        
        getNearestPoint: function(point, polyline) {
			var points = polyline._originalPoints;
				
			for (var i = 0; i < points.length; i++) {
				if (i < points.length - 1) {
					if(typeof distance == 'undefined') {
						var distance = L.LineUtil.pointToSegmentDistance(point, points[i], points[i + 1]),
							index = i;
					}
					if (distance > L.LineUtil.pointToSegmentDistance(point, points[i], points[i + 1])) {
						distance = L.LineUtil.pointToSegmentDistance(point, points[i], points[i + 1]),
						index = i;
					}
				}
			}
			
			return {
				index: index,
				latlng: this.map.layerPointToLatLng(points[index])
			};
        },
        resetNear: function()
        {
            this.model.clearSelectedPosition();
            this.$el.find('#nearSequences').removeClass('opened').addClass('closed');
        },
        galleryToggle: function(toggle) {
        	if(!toggle) {
        		this.map.keyboard.enable();
        		this.closeGallery();
        	} else this.map.keyboard.disable();
        },
        
        addMapEvents: function() {
        	this.mapEvents = true;
        },
        
        removeMapEvents: function() {
        	this.mapEvents = false;
        },
        
        locationFind: function(position) {
        	if(!this.matched) this.map.setView([position.coords.latitude, position.coords.longitude], 11);
        },
        
        locationError: function(error) {
			if(user_ip) {
				if(!this.matched) this.map.setView([user_ip.lat, user_ip.lng], 9);
			}
        },
        
        show: function() {
        	this.$el.parent().addClass('mapSection');
            this.$el.parent().show();
            $('#MENU_SECTION').removeClass().addClass('topbar');
        	$('#MENU_SECTION').find('div:first-child').removeClass('hidden').find('.breadcrumb').addClass('hidden');
        	$('#MENU_SECTION').find('div:last-child').addClass('hidden');
        },
        
        hide: function() {
            this.$el.parent().removeClass('mapSection');
            this.$el.parent().hide();
            this.resetNear();
        }
        
    });

});