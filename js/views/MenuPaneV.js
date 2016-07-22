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

        el: $('#MENU_SECTION'),

        events: {
            'click .map': 'handleChangeToMap',
            'click .leaderboard': 'handleChangeToLeaderboard',
            'click .list': 'handleChangeToList',
            'click .profile': 'handleChangeToProfile',
        },

        initialize: function() {
            BasicPaneView.prototype.initialize.call(this);
            
            this.listenTo(this.model, 'change:selectedItem', this.reflectSelectionChange)
        },

		handleChangeToMap: function() {
            this.model.setSelectedItem(MENU_ITEMS.map);
        },
        
        handleChangeToLeaderboard: function() {
            this.model.setSelectedItem(MENU_ITEMS.leaderboard);
        },

        handleChangeToProfile: function() {
            this.model.setSelectedItem(MENU_ITEMS.profile);
        },
        
        reflectSelectionChange: function(model, value) {
            switch (value) {
                case MENU_ITEMS.map:
                    this.$el.find('.active').removeClass('active');
                    this.$el.find('.map').addClass('active');
                    break;
                case MENU_ITEMS.leaderboard:
                    this.$el.find('.active').removeClass('active');
                    this.$el.find('.leaderboard').addClass('active');
                    break;
                case MENU_ITEMS.profile:
                    this.$el.find('.active').removeClass('active');
                    this.$el.find('.profile').addClass('active');
                    break;                                                 
                case null:
                    this.$el.find('.active').removeClass('active');
                    break;
            }
            this.trigger('selectedItem:changed', value);
        }

    });

});