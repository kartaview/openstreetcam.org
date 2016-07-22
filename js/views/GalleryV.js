/*
 * This file is part of the openstreetview.org
 *
 * Copyright ©2016, Telenav, Inc.  All Rights Reserved
 *
 * The code is licensed under the LGPL Version 3 license 
 *  http://www.gnu.org/licenses/lgpl-3.0.en.html.
 */
define([], function() {

    return Backbone.View.extend({

        template: _.template($('#tpl_gallery').html()),

        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
        },

        render: function() {
        	var self = this,
        		photo = this.model.get('items')[this.model.get('item')],
        		trackInfo = this.model.get('trackInfo');
        	
        	if($('#fullimage').length) {
        		
        		$('#fullimage #fullImageContainer').css('background-image', "url('/" + photo + "')");
        		
        	} else {
        		
        		this.model.trigger('gallery:toggle', true);
        		
        		$('body').append(this.template({photo: photo, trackInfo: trackInfo}));
            
	            $(document).bind('keydown.telenav', function(e){
	            	if(e.keyCode === 27) {
	            		self.close();
	            	} else if(e.keyCode === 38 || e.keyCode === 39) {
	            		self.model.setData({item: self.getLoopedId(self.model.get('item') + 1)});
	            		self.model.trigger('change:marker', self.model.get('item'));
	            	} else if(e.keyCode === 37 || e.keyCode === 40) {
	            		self.model.setData({item: self.getLoopedId(self.model.get('item') - 1)});
	            		self.model.trigger('change:marker', self.model.get('item'));
	            	}
	            });
	            
	            $('#fullimage .prev-icon_white').unbind('click').on('click', function(){
	            	self.model.setData({item: self.getLoopedId(self.model.get('item') - 1)});
	            });
	            
	            $('#fullimage .next-icon_white').unbind('click').on('click', function(){
	            	self.model.setData({item: self.getLoopedId(self.model.get('item') + 1)});
	            });
	            
	            $('#fullimage .close-icon_white').unbind('click').on('click', function(){
	            	self.close();
	            });
        		
        	}
        },
        
        close: function() {
        	$('#fullimage').hide();
        	$('#fullimage').remove();
        	
        	this.model.setData({item: false}, true);
        	
        	this.model.trigger('gallery:toggle', false);
        	
        	$(document).unbind('keydown.telenav');
        },
        
        getLoopedId: function(index) {
        	var nrItems = this.model.get('items').length;
			if(index > nrItems - 1) {
				return index - nrItems;
			} else  if(index < 0) {
				return nrItems + index;
			}
			return index;
        }

    });

});