/*
 * This file is part of the openstreetview.org
 *
 * Copyright ©2016, Telenav, Inc.  All Rights Reserved
 *
 * The code is licensed under the LGPL Version 3 license 
 *  http://www.gnu.org/licenses/lgpl-3.0.en.html.
 */
define([], function() {

    return Backbone.Model.extend({

        defaults: {
        	id: null,
            date: null,
	  		user: null,
	  		current_lat: null,
	  		current_lng: null,
	  		nw_lat: null,
	  		nw_lng: null,
	  		se_lat: null,
	  		se_lng: null,
            location: null,
	  		photo_no: null,
            thumb: null,
            status: null
        }

    });

});