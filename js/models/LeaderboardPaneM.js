/*
 * This file is part of the openstreetview.org
 *
 * Copyright ©2016, Telenav, Inc.  All Rights Reserved
 *
 * The code is licensed under the LGPL Version 3 license 
 *  http://www.gnu.org/licenses/lgpl-3.0.en.html.
 */
define(['models/BasicPaneM'], function(BasicPaneModel) {

    return BasicPaneModel.extend({

        defaults: {
            users: [],
        },

        parseResponse: function(data) {
            var users = []; 
            var rank = 0;
            _.each(data.osv, function(photo){
                rank++;
                photo.rank = rank;
                users.push(photo);
            });
            this.setData({
                users: users
            }, true);
            
            this.trigger('new:leaderboard');
        },

        setData: function(data, silent) {
            this.set(data, {silent: silent});
        },

        requestData: function() {
            var self = this;
            return $.ajax({
                type: 'POST',
                url: '/1.0/user/leaderboard/',
                beforeSend: function(jqXHR) {
                    self.xhrPool.push(jqXHR);
                },
                data: {},
                async: true
            }).done(function(data){
                self.parseResponse(data);
            });
        }

    });

});