/*
 * This file is part of the openstreetview.org
 *
 * Copyright ©2016, Telenav, Inc.  All Rights Reserved
 *
 * The code is licensed under the LGPL Version 3 license 
 *  http://www.gnu.org/licenses/lgpl-3.0.en.html.
 */

define(['models/IssueRowM'], function(IssueRowModel) {

    return Backbone.Collection.extend({

        initialize: function() {

        },

        parseResponse: function(data) {
            this.reset();
            var that = this;
			if (data.currentPageItems.length > 0) {
				this.trigger('noData:hide');
				var  status  = 'uploading';
				data.currentPageItems.forEach(function(item) {
					switch(item.image_processing_status){
						case 'NEW':
							status =  'uploading';
							break;
						case 'UPLOAD_FINISHED':
							status =  'processing';
							break;
						case 'PROCESSING_FINISHED':
							status =  'active';
							break;
						case'PROCESSING_FAILED':
							status =  'reprocessing';
							break;
						default:
							status =  'uploading';
							break;
					}
					
					that.add(new IssueRowModel({
						id: item.id,
						date: item.date_added,
						user: item.username,
						location: item.location,
						current_lat: item.current_lat,
						current_lng: item.current_lng,
						nw_lat: item.nw_lat,
						nw_lng: item.nw_lng,
						se_lat: item.se_lat,
						se_lng: item.se_lng,
						photo_no: item.photo_no,
						thumb: item.thumb_name,
						status: status
					}));
				});
				this.totalIssues = parseInt(data.totalFilteredItems[0]);
				this.tracksStatus = data.tracksStatus;
			} else {
				this.totalIssues = null;
				this.tracksStatus = null;
				this.trigger('noData:show');
			}
        },

        requestData: function(filterData, paginationData) {
            var data = {
            	externalUserId: typeof osm_user_id != 'undefined' ? osm_user_id : null,
            	userType: typeof osm_user_type != 'undefined' ? osm_user_type : null,
            };
            _.extend(data, filterData, paginationData);
            var issuesCollection = this;
            //var url = filterData.myList ? '/my-list' : '/list';
            var url = '/my-list';
            return $.post(url, data).done(function(data) {
                issuesCollection.parseResponse(data);
            });
        }

    });

});