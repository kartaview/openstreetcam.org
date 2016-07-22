/*
 * This file is part of the openstreetview.org
 *
 * Copyright ©2016, Telenav, Inc.  All Rights Reserved
 *
 * The code is licensed under the LGPL Version 3 license 
 *  http://www.gnu.org/licenses/lgpl-3.0.en.html.
 */
define([], function() {

    return Backbone.Model.extend({

        defaults: {
            section: null,
            pagination: {
                page: 1,
                ipp: null
            },
            filters: {
                myList: false,
                location: null,
                startDate: null,
                endDate: null
            },
            details: {
                location: null,
            	routeId: null,
            	markerIndex: null,
                markerLat: null,
                markerLng: null
            }
        },

        getString: function() {
            var segments = [
                this.get('section')
            ];
            switch (this.get('section')) {
                case SECTIONS.list:
                    segments.push(this.get('pagination').page);
                    segments.push(this.get('pagination').ipp);

                    if (this.get('filters').myList != false) {
                        segments.push('myList=' + this.get('filters').myList);
                    };
                    if (this.get('filters').location != null) {
                        segments.push('location=' + this.get('filters').location);
                    };
                    if (this.get('filters').startDate != null) {
                        segments.push('startDate=' + this.get('filters').startDate);
                    };
                    if (this.get('filters').endDate != null) {
                        segments.push('endDate=' + this.get('filters').endDate);
                    };
                    break;
                case SECTIONS.mytracks:
                    segments.push(this.get('pagination').page);
                    segments.push(this.get('pagination').ipp);

                    if (this.get('filters').myList != false) {
                        segments.push('myList=' + this.get('filters').myList);
                    };
                    if (this.get('filters').location != null) {
                        segments.push('location=' + this.get('filters').location);
                    };
                    if (this.get('filters').startDate != null) {
                        segments.push('startDate=' + this.get('filters').startDate);
                    };
                    if (this.get('filters').endDate != null) {
                        segments.push('endDate=' + this.get('filters').endDate);
                    };
                    break;                    
                case SECTIONS.details:
                	segments.push(this.get('details').routeId);
                    segments.push(this.get('details').markerIndex);
                    break;
                case SECTIONS.map:
                    segments.push(this.get('details').location);
                    break;
                default:
                    segments.push('');
            }
            return segments.join('/');
        },

        updateSection: function(section) {
            this.set({section: section});
        },

        updatePagination: function(pagination) {
            if (pagination != null) {
                this.set({pagination: pagination});
            }
        },

        updateFilters: function(filters) {
            if (filters != null) {
                this.set({filters: filters});
            }
        },

        updateDetails: function(details) {
            if (details != null) {
                this.set({details: details});
            }
        }

    });

});