/*
 * This file is part of the openstreetview.org
 *
 * Copyright ©2016, Telenav, Inc.  All Rights Reserved
 *
 * The code is licensed under the LGPL Version 3 license 
 *  http://www.gnu.org/licenses/lgpl-3.0.en.html.
 */
define([
    'models/MapPaneM',
    'views/MapPaneV',
    'models/GalleryM',
    'views/GalleryV'
], function(
    MapPaneModel,
    MapPaneView,
    GalleryModel,
    GalleryView
    ) {
    return {

        map_initialize: function() {
        	  this.galleryModel = new GalleryModel();
            this.galleryView = new GalleryView({model: this.galleryModel});
            this.mapPaneModel = new MapPaneModel();
            this.mapPaneView = new MapPaneView({model: this.mapPaneModel, galleryM: this.galleryModel});
            this.mapPaneModel.on('go:details', this.map_selectTrack, this);
        },

        map_show: function () {
            this.mapPaneView.prepareData();
            this.layoutStates.transition(SECTIONS.map);
        },
        
        map_selectTrack: function(route) {
            this.pathModel.updateSection(SECTIONS.details);
            this.pathModel.updateDetails({
                routeId: route.id,
                markerIndex: route.point.index
            });
            this.navigate(this.pathModel.getString(), {trigger: true});
        }

    };
});