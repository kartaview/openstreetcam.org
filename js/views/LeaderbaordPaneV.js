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

        el: $('#LEADERBOARD'),
        leaderboardTable:_.template($('#tpl_leaderboard_table').html()),
        events: {
        },

        initialize: function() {
            BasicPaneView.prototype.initialize.call(this);
            this.listenTo(this.model, 'new:leaderboard', this.addListView);
        },

        addListView: function() {
            this.$el.find('table > tbody').html(this.leaderboardTable({users: this.model.get('users')}));
        }

    });

});