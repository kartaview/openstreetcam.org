/*
 * This file is part of the openstreetview.org
 *
 * Copyright ©2016, Telenav, Inc.  All Rights Reserved
 *
 * The code is licensed under the LGPL Version 3 license 
 *  http://www.gnu.org/licenses/lgpl-3.0.en.html.
 */
define([
], function(
    ) {

    return Backbone.View.extend({

        tagName: 'tr',

        template: _.template($('#tpl_issue_item').html()),

        events: {
            'click': 'issueSelected'
        },

        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
        },

        render: function() {
            var templateData = this.model.toJSON();
            this.$el.html(this.template(templateData));
           
            var self = this;
            if(this.model.get('thumb')) {
            	
            	this.$el.tooltipster({
            		onlyOne: true,
            		animation: 'fade',
	            	theme: 'tooltipster-light',
	            	position: 'left',
	            	content: 'Loading ...',
	            	updateAnimation: false,
	                functionBefore: function(origin, continueTooltip){
	                	continueTooltip();
	                	origin.tooltipster('content', $('<img src="/' + self.model.get('thumb') + '" width="250" />'));
	                }
	            });
            	
            }
	  this.$el.find('.delete').unbind('click').on('click', function(){
            	if(!confirm('Are you sure you want to delete this sequence?')) return false;
            	$(this).find('i').removeClass('fa-trash').addClass('fa-refresh fa-spin');
            	$.post('/1.0/sequence/remove/', { 'sequenceId': self.model.get('id'), 'externalUserId': osm_user_id, 'userType': osm_user_type }, function(data){
            		if(data.status.apiCode == 600) location.reload();
            	});
            	return false;
            });
            
            return this;
        },

        issueSelected: function() {
            if(this.model.get('status') == 'active' || this.model.get('status') == 'processing' || this.model.get('reprocessing')) this.model.trigger('issue:select', this.model);
        }

    });

});