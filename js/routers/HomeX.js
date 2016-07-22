/*
 * This file is part of the openstreetview.org
 *
 * Copyright ©2016, Telenav, Inc.  All Rights Reserved
 *
 * The code is licensed under the LGPL Version 3 license 
 *  http://www.gnu.org/licenses/lgpl-3.0.en.html.
 */
define([
    'views/HomeV'
], function(
    HomePaneView
    ) {
    return {

        home_initialize: function() {
            this.homePaneView = new HomePaneView();
        },

        home_showAndPopulate: function () {
            // PANEL TOGGLING
           this.layoutStates.transition(SECTIONS.home);

        }

    };
});