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
            userDetails: {},
            totalTracks: false,
            trackList: [],
            tracksStatus: {}, 
            page: 1,
            ipp: 100
        },

        initialize: function() {
            
        },

        parseResponse: function(data) {
            var self = this;
            self.setData({trackList: data.currentPageItems}, true);
            self.setData({totalTracks: parseInt(data.totalFilteredItems[0])}, true);
            self.setData({tracksStatus: data.tracksStatus}, true);
            this.trigger('new:tracks');
        },

        setData: function(data, silent) {
            this.set(data, {silent: silent});
        },

        requestData: function() {
            var self = this;
            if (self.get('page') - 1*self.get('totalTracks') || self.get('totalTracks') === false) {
                var data = {
                    externalUserId: typeof osm_user_id != 'undefined' ? osm_user_id : null,
                    page: self.get('page'),
                    ipp: self.get('ipp')
                };
                var url = '/my-list';
                self.setData({'page': self.get('page') + 1}, true);
                return $.ajax({
                    type: 'POST',
                    url: url,
                    beforeSend: function(jqXHR) {
                        self.xhrPool.push(jqXHR);
                    },
                    data: data,
                    async: true
                }).done(function(data) {
                    self.parseResponse(data);
                });
            }
            return false;
        }, 
        parseUserDetailResponse: function(data) {
            this.setData({userDetails: data.osv}, true);
            this.trigger('new:userDetails');
        },
        requestUserDetailsData: function() {
            var self = this;
            var data = {
                externalUserId: osm_user_id
            }
            var url = '/1.0/user/details/';
            return $.ajax({
                type: 'POST',
                url: url,
                beforeSend: function(jqXHR) {
                    self.xhrPool.push(jqXHR);
                },
                data: data,
                async: true
            }).done(function(data) {
                self.parseUserDetailResponse(data);
            });
            // return $.post(url, data).done(function(data) {
            //     self.parseUserDetailResponse(data);
            // });
        }

    });

});