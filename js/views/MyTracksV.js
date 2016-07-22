/*
 * This file is part of the openstreetview.org
 *
 * Copyright ©2016, Telenav, Inc.  All Rights Reserved
 *
 * The code is licensed under the LGPL Version 3 license 
 *  http://www.gnu.org/licenses/lgpl-3.0.en.html.
 */
define([
    'views/BasicPaneV',
    'views/IssueRowV',
    'views/ListPaginationV'
], function(
    BasicPaneView,
    IssueRowView,
    ListPaginationView
    ) {

    return BasicPaneView.extend({

        el: $('#MY_TRACKS'),

        events: {
        },

        initialize: function() {
            BasicPaneView.prototype.initialize.call(this);
            this.paginationView = new ListPaginationView({model: this.model.paginationModel});
            this.listenTo(this.collection, 'add', this.addListView);
            this.listenTo(this.collection, 'reset', this.removeListView);
            this.listenTo(this.collection, 'noData:show', this.showNoData);
            this.listenTo(this.collection, 'noData:hide', this.hideNoData);
            this.listenTo(this.model.paginationModel, 'change', this.changePage);
        },

        addListView: function(item) {
            var issueView = new IssueRowView({model: item});

            this.$el.find('table > tbody').append(issueView.render().el);
        },

        removeListView: function() {
            this.$el.find('table > tbody').empty();
        },
		
		showNoData: function() {
			this.$el.find('table > tbody').empty();
            this.$el.find('table > tbody').append($('#tpl_no_data').html());
        },
		
		hideNoData: function() {
            this.$el.find('table > tbody').empty();
        },

        changePage: function() {
            this.trigger('page:change', this.model.paginationModel);
        },

        resizePagination: function(totalIssues) {
            this.paginationView.resize(totalIssues);
        }

    });

});