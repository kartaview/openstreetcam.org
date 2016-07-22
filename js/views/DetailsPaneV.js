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

		el: $('#DETAILS_SECTION'),
        template: _.template($('#tpl_dnearSequencesetails').html()),
        gallery: false,
        images: {},
        canvas: false,
        canvasContext: false,
        rotation: 0,
        fps: 100,
        alpha: 1.0,
        rotationAngles:[0, 90, 180, 270],
        rotationIndex:0,

        initialize: function(options) {
            BasicPaneView.prototype.initialize.call(this);
            
            this.map = false;
            this.marker = false,
            this.polyline = false;
            this.listenTo(this.model, 'new:photos', this.render);
            this.listenTo(this.model, 'change:markerIndex', this.changePhoto);
        },
        
        render: function() {
        	this.$el.html(this.template(this.model.toJSON()));
	$('#trackId').text(this.model.toJSON().routeId);
            this.$el.find('[data-toggle="tooltip"]').tooltip();
            console.log(this.model.get('backLabel'));
            if (this.model.get('backLabel') == true) {
                $('.details-back').show();
                $('.details-back a').unbind('click').on('click', function(){
                    self.trigger('backtomap');
                });
            } else {
                $('.details-back').hide();
            }
            $('.close-details').unbind('click').on('click', function(){
                self.trigger('backtomap');
            });

        	$('[data-toggle="popover"]').popover();
        	
        	var self = this,
        		latlngs = [],
        		pointDetails = this.model.get('photos')[this.model.get('markerIndex')];
        	
        	// this.$el.find('.full-image-container').css('background-image', "url('/" + pointDetails.lth_name + "?v="+Date.now()+"')");

	    	// map
    		this.map = L.skobbler.map('mini-map',{
				apiKey: 'bc7b4da77e971c12cb0e069bffcf2771',
				
				mapStyle: 'lite',			// day / lite / night / bike / outdoor
				bicycleLanes: true, 		// true / false
				onewayArrows: true, 		// true / false
				pois: 'all', 				// all / none / important
				primaryLanguage: 'en',		// en / de / fr / it / es / ru / tr
				fallbackLanguage: 'en',		// en / de / fr / it / es / ru / tr
				mapLabels: 'localNaming',	// localNaming / transliterationOnly / noTransliteration / nativeLocalized / transliterationNative
				retinaDisplay: 'auto',		// auto / yes / no
				
				zoomControl: true,					// true / false
				zoomControlPosition: 'top-left',	// top-left / top-right / bottom-right / bottom-left
							
				center: [pointDetails.lat, pointDetails.lng],
				zoom: 18,
	            fullscreen: true
			});
            var photos = this.model.get('photos');
            _.each(photos, function(photo, key){
                var latlng = new L.LatLng(photo.lat, photo.lng);
                latlngs.push(latlng);
            });
                
            //if(this.polyline) this.map.removeLayer(this.polyline);
            this.polyline = L.polyline(latlngs, {color: 'blue', weight: 4}).addTo(this.map);
            this.marker = this.initMarker(new L.LatLng(pointDetails.lat, pointDetails.lng)).addTo(this.map);
        	// gallery
        	$(document).unbind('keydown.telenav').bind('keydown.telenav', function(e){
            	if(e.keyCode === 38 || e.keyCode === 39) {
            		self.model.setData({markerIndex: self.model.getLoopedId(self.model.get('markerIndex') + 1, 'fwd')});
            	} else if(e.keyCode === 37 || e.keyCode === 40) {
            		self.model.setData({markerIndex: self.model.getLoopedId(self.model.get('markerIndex') - 1, 'bkwd')});
            	}
            });
            this.initProgress();
            this.$el.find('.move .fa-step-forward').unbind('click').on('click', function(){
            	self.model.setData({markerIndex: self.model.getLoopedId(self.model.get('markerIndex') + 1, 'fwd')});
            	return false;
            });
            
            this.$el.find('.move .fa-step-backward').unbind('click').on('click', function(){
            	self.model.setData({markerIndex: self.model.getLoopedId(self.model.get('markerIndex') - 1, 'bkwd')});
            	return false;
            });
            
            $('#save-delete-photo').unbind('click').on('click', function(){
            	$(this).find('i').addClass('fa-refresh fa-spin');
            	$.post('/1.0/photo/remove/', { 'photoId': pointDetails.id, 'externalUserId': osm_user_id, 'userType': osm_user_type }, function(data){
            		if(data.status.apiCode == 600) location.reload();
            	});
            	return false;
            });
		
        	 this.$el.find('.josm').unbind('click').on('click', function(){
        		$(this).find('i').removeClass('fa-pencil').addClass('fa-refresh fa-spin');
        		$.get($(this).attr('href'), { }, function(data){
        			window.setTimeout(function(){self.$el.find('.josm').find('i').removeClass('fa-refresh fa-spin').addClass('fa-pencil');}, 1000);
                    	}).fail(function() {
        			self.$el.find('.josm').find('i').removeClass('fa-refresh fa-spin').addClass('fa-pencil');
        			$('#JOSM_MODAL').modal('show');
        		});
            	return false;
            });
	        this.$el.find('.download').unbind('click').on('click', function(){
            	$(this).find('i').removeClass('fa-download').addClass('fa-refresh fa-spin'); 
                $.fileDownload("/1.0/sequence/export/" +  self.model.get('routeId') + '/')
    			.done(function () {
    				window.setTimeout(function(){self.$el.find('.download').find('i').removeClass('fa-refresh fa-spin').addClass('fa-download');}, 500);
    				$.post('/1.0/sequence/export/remove/', { 'sequenceId': self.model.get('routeId')});
    			})
    			.fail(function () { 
    				alert('File download failed! Please retry later.');
    				window.setTimeout(function(){self.$el.find('.download').find('i').removeClass('fa-refresh fa-spin').addClass('fa-download');}, 500);
    			});
            	return false;
            });		

            self.images = [];
            self.changePhoto();
            this.$el.find('#rotate-forward').unbind('click').on('click', function(){
                self.$el.find('#save-button-set').show();
                var image = self.images[self.model.get('markerIndex')];
                if (self.rotationIndex < self.rotationAngles.length - 1) {
                    self.rotationIndex++;
                } else {
                    self.rotationIndex = 0;
                }
                var rotation = self.rotationAngles[self.rotationIndex];
                self.drawRotated(image, rotation);
            });
            this.$el.find('#rotate-backward').unbind('click').on('click', function(){
                self.$el.find('#save-button-set').show();
                var image = self.images[self.model.get('markerIndex')];
                if (self.rotationIndex > 0) {
                    self.rotationIndex--;
                } else {
                    self.rotationIndex = self.rotationAngles.length - 1;
                }
                var rotation = self.rotationAngles[self.rotationIndex];
                self.drawRotated(image, rotation);
            });
            $('#save-rotation-dialog #save-rotation').on('click', function(){
                var dataToSave = {};
                dataToSave['sequenceId'] = self.model.get('routeId');
                dataToSave['photoIndexes'] = [self.model.get('markerIndex')];
                dataToSave['photoId'] = pointDetails.id;
                dataToSave['rotate'] = self.rotationAngles[self.rotationIndex];
                dataToSave['externalUserId'] = osm_user_id;
                dataToSave['userType'] = osm_user_type;
                dataToSave['rotateAll'] = $('#rotate-all').is(':checked')?1:0;
                $(this).prop('disabled', 'disabled');
                $(this,'i.loading').show();
                $.post('/1.0/photo/rotate/', dataToSave, function(data){
                    if(data.status.apiCode == 600) location.reload();
                });
                return false;
            });
            this.canvas = document.getElementById('streetGallery');
            this.canvas.width = $('.image-container').outerWidth();
            this.canvas.height = $('.image-container').outerHeight();
            this.canvasContext = this.canvas.getContext("2d");
            
            
            window.onresize = function(event) {
                self.canvas.width = $('.image-container').outerWidth();
                self.canvas.height = $('.image-container').outerHeight();
                var image = self.images[self.model.get('markerIndex')];
                self.drawRotated(image);
            };
            
		},
	    initProgress: function()
        {
            var self = this;
            var progress = (self.model.get('markerIndex') * 100) / this.model.get('totalPhotos');
            self.$el.find('.progress .progress-bar').width(progress+"%");
            self.$el.find('.progress .progress-pointer').css('left', progress+"%");
        },
		initMarker: function(latlnt) {
        	return L.circleMarker(latlnt, {
    			color: 'green',
    			stroke: false,
    			fillOpacity: 1
    		});
        },
        
		markerIcon: function(latlng) {
        	if(!this.marker)
        		this.marker = this.initMarker(latlng ? latlng : point.latlng).addTo(this.map);
        	else
        		this.changeMarkerPosition(latlng ? latlng : point.latlng);
        },
        
        changeMarkerPosition: function(latlng) {
        	if(!this.marker) return;
        	
        	this.marker.setLatLng(latlng);
        },
        
        changePhoto: function() {
        	var self = this,
        		pointDetails = this.model.get('photos')[this.model.get('markerIndex')];
        	this.map.setView([pointDetails.lat, pointDetails.lng]);
        	
        	this.markerIcon(new L.LatLng(pointDetails.lat, pointDetails.lng));
        	self.preloadPhotos(self.model.get('markerIndex'));
            self.drawRotated(self.images[this.model.get('markerIndex')]);
        	// this.$el.find('.full-image-container').css('background-image', "url('/" + pointDetails.lth_name + "?v="+Date.now()+"')");
        	this.$el.find('.marker-index').text(self.model.get('markerIndex'));
            this.$el.find("#photoIndexes").val(self.model.get('markerIndex'));
	  var lat = parseFloat(pointDetails.lat);
	  var lng =  parseFloat(pointDetails.lng);
            this.$el.find('.locationLat').text(lat.toFixed(5));
            this.$el.find('.locationLng').text(lng.toFixed(5));
            this.$el.find('.josm').attr({"href" : "http://127.0.0.1:8111/load_and_zoom?left=" + (pointDetails.lng * 1 - 0.003 ) + "&right=" + (pointDetails.lng * 1 + 0.003 ) + "&top=" + (pointDetails.lat * 1 + 0.002) + "&bottom=" + (pointDetails.lat * 1 - 0.002) });
            this.initProgress();
        	window.history.pushState('', 'OpenStreetView', '/details/' + self.model.get('routeId') + '/' + self.model.get('markerIndex'));
        },

        drawRotated: function(photo, degrees){
            var self = this;
            $(photo).load(function(){
                var image = this;
                var width = isNaN(image.width) || !isFinite(image.width)?1:image.width;
                var height = isNaN(image.height) || !isFinite(image.height)?1:image.height;
                if (width > 0 && height > 0) {
                    self.canvasContext.clearRect(0,0,self.canvas.width,self.canvas.height);
                    self.canvasContext.save();
                    self.canvasContext.translate(self.canvas.width/2,self.canvas.height/2);
                    if (degrees >= 0) {
                        self.rotation = degrees*Math.PI/180;
                    }
                    self.canvasContext.rotate(self.rotation);
                    var hRatio = self.canvas.width / width;
                    var vRatio = self.canvas.height / height
                    var ratio  = Math.min(hRatio, vRatio);
                    self.canvasContext.drawImage(image, 0,0, width, height, -width*ratio/2+50, -height*ratio/2, width*ratio-100, height*ratio);
                    self.canvasContext.restore();
                }
            });
            $(photo).load();
        },

        imageZoomInTransition: function(oldImage,newImage, animComplete) {
            var self = this;
            setTimeout(function () {
                if (animComplete <= 100) {
                    self.canvasContext.clearRect(0,0,self.canvas.width,self.canvas.height);
                    self.canvasContext.save();
                    self.canvasContext.translate(self.canvas.width/2,self.canvas.height/2);
                    self.canvasContext.rotate(self.rotation);
                    var hRatio = self.canvas.width / newImage.width;
                    var vRatio = self.canvas.height / newImage.height
                    var ratio  = Math.min(hRatio, vRatio);
                    self.canvasContext.globalAlpha = 1.0;
                    self.canvasContext.drawImage(newImage, 0,0, newImage.width, newImage.height, -newImage.width*ratio/2, -newImage.height*ratio/2, newImage.width*ratio, newImage.height*ratio);
                    self.alpha = self.alpha - .01;
                    self.canvasContext.globalAlpha = self.alpha;
                    var zoom = animComplete + 10;
                    hRatio = self.canvas.width / (oldImage.width + zoom);
                    vRatio = self.canvas.height / (oldImage.height + zoom);
                    ratio  = Math.min(hRatio, vRatio);
                    self.canvasContext.drawImage(oldImage, 0,0, oldImage.width, oldImage.height, -(oldImage.width*ratio+zoom)/2, -(oldImage.height*ratio+zoom)/2, oldImage.width*ratio+zoom, oldImage.height*ratio+zoom);
                    self.canvasContext.restore();
                    animComplete++;
                    self.imageZoomInTransition(oldImage,newImage,animComplete);
                } else {
                    self.alpha = 1.0;
                }
            }, 1000 / self.fps);

        },

        preloadPhotos: function(currentIndex, callback) {
            var self = this;
            var start = 0;
            start = (currentIndex - 5 < 0)?currentIndex:currentIndex - 5;
            for(var i = start; i < (currentIndex + 5); i++) {
                if (typeof self.images[i] == 'undefined' && typeof this.model.get('photos')[i] != 'undefined') {
                    var photo = new Image();
                    photo.src = this.model.get('photos')[i].lth_name+"?v="+Date.now();
                    self.images[i] = photo;
                }
            }
        },
        
        show: function() {
        	this.$el.removeClass('hidden').parent().removeClass('hidden');
        	$('#MENU_SECTION').removeClass().addClass('topbar track-details');
        	$('#MENU_SECTION').find('div:first-child').addClass('hidden').find('.breadcrumb').addClass('hidden');
        	$('#MENU_SECTION').find('div:last-child').removeClass('hidden');
        },
        
        hide: function() {
            this.$el.addClass('hidden').parent().addClass('hidden');
        	$('#MENU_SECTION').removeClass('track-details');
        }
        
    });

});