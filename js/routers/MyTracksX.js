/*
 * This file is part of the openstreetview.org
 *
 * Copyright ©2016, Telenav, Inc.  All Rights Reserved
 *
 * The code is licensed under the LGPL Version 3 license 
 *  http://www.gnu.org/licenses/lgpl-3.0.en.html.
 */
define([
    'models/MyTracksM',
    'views/MyTracksV'
], function(
    MyTracksModel,
    MyTracksView
    ) {
    return {

        myTracks_initialize: function() {
            this.myTracksPaneModel = new MyTracksModel();
            this.myTracksPaneView = new MyTracksView({model: this.myTracksPaneModel, collection: this.issuesCollection});

            this.myTracksPaneView.on('page:change', this.myTracks_changePage, this);
        },

        myTracks_changePage: function(pagination) {
            this.pathModel.updatePagination({
                page: pagination.get('page'),
                ipp: pagination.get('ipp')
            });
            this.navigate(this.pathModel.getString());

            this.myTracks_showAndPopulate();
        },

        myTracks_showAndPopulate: function() {
            // PANEL TOGGLING
            this.layoutStates.transition(SECTIONS.mytracks);

            // TRIGGERING EXECUTION
            var mainRouter = this;
            $.when(this.issuesCollection.requestData(this.filterPaneModel.toJSON(), this.myTracksPaneModel.paginationModel.toJSON())).done(function () {
                mainRouter.myTracksPaneView.resizePagination(mainRouter.issuesCollection.totalIssues);
                mainRouter.overlayView.hide();
            }).fail(this.handleErrors);
        }

    };
});