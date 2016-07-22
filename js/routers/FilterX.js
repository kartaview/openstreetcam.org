/*
 * This file is part of the openstreetview.org
 *
 * Copyright ©2016, Telenav, Inc.  All Rights Reserved
 *
 * The code is licensed under the LGPL Version 3 license 
 *  http://www.gnu.org/licenses/lgpl-3.0.en.html.
 */
define([
    'models/FilterPaneM',
    'views/FilterPaneV'
], function(
    FilterPaneModel,
    FilterPaneView
    ) {
    return {

        filter_initialize: function() {
            this.filterPaneModel = new FilterPaneModel();
            this.filterPaneView = new FilterPaneView({model: this.filterPaneModel});

            this.filterPaneView.on('filter:change', this.filter_changeFilter, this);
        },

        filter_changeFilter: function(filterData) {
            this.pathModel.updatePagination({
                page: 1,
                ipp: this.listPaneModel.paginationModel.get('ipp')
            });
            this.pathModel.updateFilters(filterData);
            this.navigate(this.pathModel.getString(), {trigger: true});
        }

    };
});