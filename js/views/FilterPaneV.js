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

        el: $('#FILTER_SECTION'),
        
        events: {
        	'click #myList': 'updateModel',
            'click #resetFilter': 'resetFilter',

            'change #username': 'updateModel',
            'change #location': 'updateModel',
            'change #startDate': 'updateModel',
            'change #endDate': 'updateModel'
        },

        initialize: function() {
            BasicPaneView.prototype.initialize.call(this);
            
            var self = this;
            this.$el.find('#startDate').datepicker({
            	dateFormat: 'yy-mm-dd',
            	maxDate: '0',
				onClose: function(selectedDate) {
					if(selectedDate != '') self.$el.find('#endDate').datepicker("option","minDate",selectedDate);
				},
                showOtherMonths: true,
                selectOtherMonths: true
                
            });
            this.$el.find('#endDate').datepicker({
            	dateFormat: 'yy-mm-dd',
            	maxDate: '0',
				onClose: function(selectedDate) {
					if(selectedDate != '') self.$el.find('#startDate').datepicker("option","maxDate",selectedDate);
				},
                showOtherMonths: true,
                selectOtherMonths: true
            });

            this.listenTo(this.model, 'change', this.renderInputs);
        },

        updateModel: function() {
            this.model.setData({
            	myList: $('#myList').is(':checked') ? true : false,
                username: $('#username').val() == '' ? null : $('#username').val(),
                location: $('#location').val() == 'all' ? null : $('#location').val(),
                startDate: $('#startDate').val() == '' ? null : $('#startDate').val(),
                endDate: $('#endDate').val() == '' ? null : $('#endDate').val()
            });
            this.$el.find('#startDate').datepicker('option', 'maxDate', this.model.get('endDate'));
            this.$el.find('#endDate').datepicker('option', 'minDate', this.model.get('startDate'));
        },

        renderInputs: function() {
        	$('#myList').attr('checked', this.model.get('myList'));
            this.model.get('username') == null ? $('#username').val('') : $('#username').val(this.model.get('username'));
            this.model.get('location') == null ? $('#location').val('all') : $('#location').val(this.model.get('location'));
            this.model.get('startDate') == null ? $('#startDate').val('') : $('#startDate').val(this.model.get('startDate'));
            this.model.get('endDate') == null ? $('#endDate').val('') : $('#endDate').val(this.model.get('endDate'));
            this.$el.find('#startDate').datepicker('option', 'maxDate', this.model.get('endDate'));
            this.$el.find('#endDate').datepicker('option', 'minDate', this.model.get('startDate'));
            this.trigger('filter:change', this.model.toJSON());
            
            this.activeResetFilterButton();
        },

        resetFilter: function() {
            this.model.setData({
            	myList: false,
                username: null,
                location: null,
                startDate: null,
                endDate: null
            });
            
            this.disableResetFilterButton();
        },
        
        activeResetFilterButton: function() {
        	this.$el.find('#resetFilter').attr('disabled',false);
        },
        
        disableResetFilterButton: function() {
        	this.$el.find('#resetFilter').attr('disabled',true);
        }

    });

});