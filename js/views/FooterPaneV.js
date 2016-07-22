/*
 * This file is part of the openstreetview.org
 *
 * Copyright ©2016, Telenav, Inc.  All Rights Reserved
 *
 * The code is licensed under the LGPL Version 3 license 
 *  http://www.gnu.org/licenses/lgpl-3.0.en.html.
 */
define([
    'views/BasicPaneV'
], function(
    BasicPaneView
    ) {

    return BasicPaneView.extend({

        el: $('#FOOTER_SECTION'),

        events: {
            'click .terms': 'handleChangeToTerms',
            'click .aboutus': 'handleChangeToAboutUs'
        },

        initialize: function() {
            BasicPaneView.prototype.initialize.call(this);
	  this.$el.find('.deleteAccount').unbind('click').on('click', function(){
		$('#DELETE_ACCOUNT_MODAL').modal('show');
		return false;
	   });
	   $('#DELETE_ACCOUNT_MODAL').find('#deleteAccountBtn').unbind('click').on('click', function(){
		var delete_data = $('#DELETE_ACCOUNT_MODAL').find('#remove_data').is(':checked') ? 1: 0;
		
		$.post('/1.0/user/remove/', {'externalUserId': osm_user_id, 'userType': osm_user_type, 'deleteData': delete_data}, function(data){
		
            	}).fail(function() {
        			window.location.href = '/logout';
        		}).done(function() {
        			window.location.href = '/logout';
        		});
		return false;
	   });
	   $('#COLLECT_EMAIL_MODAL').find('#collectEmailBtn').unbind('click').on('click', function(){
		var unobtainable = $('#COLLECT_EMAIL_MODAL').find('#unobtainable').is(':checked') ? 1: 0;
		var email = $('#COLLECT_EMAIL_MODAL').find('#email').val();
		$.post('/1.0/user/email/', {
			'externalUserId': osm_user_id, 
			'userType': osm_user_type, 
			'unobtainable': unobtainable,
			'email': email
		}, function(data){
            	}).fail(function(data) {
        			$('#COLLECT_EMAIL_MODAL').find('#emailErr').removeClass('hidden').addClass('active');
        		}).done(function() {
        			$('#COLLECT_EMAIL_MODAL').modal('hide');
        		});
		return false;
	   });
	   if(restore_user) {
		$('#RESTORE_ACCOUNT_MODAL').modal('show');
	   }
	   if(collect_email) {
		$('#COLLECT_EMAIL_MODAL').modal('show');
	    }
            this.listenTo(this.model, 'change:footerSelectedItem', this.reflectSelectionChange)
        },

        handleChangeToTerms: function() {
            this.model.setFooterSelectedItem(FOOTER_ITEMS.terms);
        },
        
        handleChangeToAboutUs: function() {
            this.model.setFooterSelectedItem(FOOTER_ITEMS.aboutus);
        },        
    
        reflectSelectionChange: function(model, value) {
            switch (value) {
                case FOOTER_ITEMS.terms:
                    this.$el.find('.active').removeClass('active');
                    this.$el.find('.terms').addClass('active');
                    break;
                case FOOTER_ITEMS.aboutus:
                    this.$el.find('.active').removeClass('active');
                    this.$el.find('.aboutus').addClass('active');
                    break;                    
                case null:
                    this.$el.find('.active').removeClass('active');
                    this.$el.find('.terms').removeClass('active');
                    break;
            }
            this.trigger('footerSelectedItem:changed', value);
        }

    });

});