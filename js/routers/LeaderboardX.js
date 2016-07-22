/*
 * This file is part of the openstreetview.org
 *
 * Copyright ©2016, Telenav, Inc.  All Rights Reserved
 *
 * The code is licensed under the LGPL Version 3 license 
 *  http://www.gnu.org/licenses/lgpl-3.0.en.html.
 */
define([
    'models/LeaderboardPaneM',
    'views/LeaderbaordPaneV'
], function(
    LeaderboardPaneModel,
    LeaderboardPaneView
    ) {
    return {

        leaderboard_initialize: function() {
            this.leaderbaordPaneModel = new LeaderboardPaneModel();
            this.leaderboardPaneView = new LeaderboardPaneView({model: this.leaderbaordPaneModel});
        },

        leaderboard_showAndPopulate: function() {

            // PANEL TOGGLING
            this.layoutStates.transition(SECTIONS.leaderboard);

            var mainRouter = this;
            // TRIGGERING EXECUTION
            $.when(this.leaderbaordPaneModel.requestData()).done(function() {
                
            }).fail(this.handleErrors);
        }

    };
});