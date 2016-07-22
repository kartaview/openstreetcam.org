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
            items: [],
            item: false,
            trackInfo: null
        },
        
        setData: function(data, silent) {
            this.set(data, {silent: silent});
        },
        
        clearData: function() {
        	this.set({
        		items: [],
            	item: false,
            	trackInfo: null
        	}, {silent: true});
        }

    });

});