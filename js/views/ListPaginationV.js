/*
 * This file is part of the openstreetview.org
 *
 * Copyright ©2016, Telenav, Inc.  All Rights Reserved
 *
 * The code is licensed under the LGPL Version 3 license 
 *  http://www.gnu.org/licenses/lgpl-3.0.en.html.
 */
define([], function() {

    return Backbone.View.extend({

        el: $('#PAGINATION'),

        totalIssues: null,

        events: {
            'click li > a': 'changePage'
        },

        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
        },

        changePage: function(element) {
            var newPage = null;
            switch (element.currentTarget.innerHTML) {
                case '« First page':
                    newPage = 1;
                    break;
                case 'Last page »':
                    newPage = Math.floor(this.totalIssues / this.model.get('ipp'));
                    if (this.totalIssues % this.model.get('ipp') != 0) {
                        newPage++;
                    }
                    break;
                default:
                    newPage = parseInt(element.currentTarget.innerHTML);
            }
            if (!isNaN(newPage)) {
                this.model.setData({
                    page: newPage
                });
            }
        },

        resize: function(totalIssues) {
            this.totalIssues = totalIssues;
            this.render();
        },

        render: function() {
            this.$el.empty();
            if (this.totalIssues != null) {
                var noOfPages = Math.floor(this.totalIssues / this.model.get('ipp'));
                if (this.totalIssues % this.model.get('ipp') != 0) {
                    noOfPages++;
                }
                var currentPage = this.model.get('page');
                if (currentPage == 1) {
                    this.$el.append('<li class="disabled"><a>&laquo; First page</a></li>');
                } else {
                    this.$el.append('<li><a>&laquo; First page</a></li>');
                }
                if (noOfPages < 8) {
                    for (var i = 1; i <= noOfPages; i++) {
                        if (currentPage == i) {
                            this.$el.append('<li class="active"><a>' + i + '</a></li>');
                        } else {
                            this.$el.append('<li><a>' + i + '</a></li>');
                        }
                    }
                } else {
                    var j = 0
                    for (var i = currentPage - 3; i <= currentPage - 1; i++) {
                        if (i > 0) {
                            this.$el.append('<li><a>' + i + '</a></li>');
                            j++;
                        }
                    }
                    this.$el.append('<li class="active"><a>' + currentPage + '</a></li>');
                    for (var i = currentPage + 1; i <= currentPage + 6; i++) {
                        if ((j < 6) && (i <= noOfPages)) {
                            this.$el.append('<li><a>' + i + (j == 5 && i < noOfPages? '...' : '') + '</a></li>');
                            j++;
                        }
                    }
                }
                if (currentPage == noOfPages) {
                    this.$el.append('<li class="disabled"><a>Last page &raquo;</a></li>');
                } else {
                    this.$el.append('<li><a>Last page &raquo;</a></li>');
                }
            }
        }

    });

});