/*
 * This file is part of the openstreetview.org
 *
 * Copyright ©2016, Telenav, Inc.  All Rights Reserved
 *
 * The code is licensed under the LGPL Version 3 license 
 *  http://www.gnu.org/licenses/lgpl-3.0.en.html.
 */
define([
    'views/TermsPaneV'
], function(
    TermsPaneView
    ) {
    return {

        terms_initialize: function() {
            this.termsPaneView = new TermsPaneView();
        },

        terms_showAndPopulate: function () {
            // PANEL TOGGLING
           this.layoutStates.transition(SECTIONS.terms);

        }

    };
});