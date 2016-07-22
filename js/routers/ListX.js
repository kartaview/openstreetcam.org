/*
 * This file is part of the openstreetview.org
 *
 * Copyright ©2016, Telenav, Inc.  All Rights Reserved
 *
 * The code is licensed under the LGPL Version 3 license 
 *  http://www.gnu.org/licenses/lgpl-3.0.en.html.
 */
define([
    'models/ListPaneM',
    'views/ListPaneV'
], function(
    ListPaneModel,
    ListPaneView
    ) {
    return {
        list_initialize: function() {
            this.listPaneModel = new ListPaneModel();
            this.listPaneView = new ListPaneView({model: this.listPaneModel});
            this.listPaneModel.on('issue:select', this.list_selectIssue, this);
        },

        list_selectIssue: function(issue) {
            this.pathModel.updateSection(SECTIONS.details);
            this.pathModel.updateDetails({
                routeId: issue.id,
                markerIndex: 0
            });
            this.navigate(this.pathModel.getString(), {trigger: true});
        },

        list_showAndPopulate: function() {
            // PANEL TOGGLING
           this.layoutStates.transition(SECTIONS.profile);

            // TRIGGERING EXECUTION
            this.listPaneModel.requestUserDetailsData();
            this.listPaneModel.requestData();
        }

    };
});