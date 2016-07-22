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

        events: {
        },

        initialize: function() {
        },

        show: function() {
            if (typeof this.model == 'object') {
                this.model.show();
            }
            this.$el.removeClass('hidden').addClass('show');
            return this;
        },

        hide: function() {
            if (typeof this.model == 'object') {
                this.model.hide();
            }
            this.$el.removeClass('show').addClass('hidden');
            return this;
        }

    });

});