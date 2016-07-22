/*
 * This file is part of the openstreetview.org
 *
 * Copyright ©2016, Telenav, Inc.  All Rights Reserved
 *
 * The code is licensed under the LGPL Version 3 license 
 *  http://www.gnu.org/licenses/lgpl-3.0.en.html.
 */
define([
    'models/BasicPaneM',
    'models/ListPaginationM'
], function(
    BasicPaneModel,
    ListPaginationModel
    ) {

    return BasicPaneModel.extend({

        defaults: {
        },

        initialize: function() {
            this.paginationModel = new ListPaginationModel();
        },

        setPaginationData: function(paginationData) {
            this.paginationModel.setData(paginationData);
        }

    });

});