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
], function(
    BasicPaneView
    ) {

    return BasicPaneView.extend({
        userDetailsTpl: _.template($('#tpl_user_details').html()),
        userInfoTpl: _.template($('#tpl_user_info').html()),
        userTracks: _.template($('#tpl_user_tracks').html()),
        userTrackItems: _.template($('#tpl_user_track_items').html()),

        el: $('#LIST_SECTION'),
        events: {
        },
        initialize: function() {
            var self = this;
            BasicPaneView.prototype.initialize.call(this);
            this.listenTo(this.model, 'new:tracks', this.renderTrackList);
            this.listenTo(this.model, 'new:userDetails', this.renderUserDetails);
            $(window).scroll(function() {
               if($(window).scrollTop() + $(window).height() == $(document).height()) {
                   self.$el.find('loading').show();
                   self.model.requestData();
               }
            });
        },

        renderUserDetails: function() {
            this.$el.find('#userDetails').html(this.userDetailsTpl({userDetails:this.model.get('userDetails')}));
            this.$el.find('#userInfo').html(this.userInfoTpl({userDetails:this.model.get('userDetails')}));
        },
        renderTrackList: function() {
            var self = this;
            this.$el.find('#userTracks').html(this.userTracks({trackStatus:this.model.get('tracksStatus')}));
            this.$el.find('#userTracksItems').append($(this.userTrackItems({trackList:this.model.get('trackList')})));
            this.$el.find('loading').hide();

            this.$el.find('.delete-photo').unbind('click').on('click', function(){
                var id = $(this).data('id');
                $('#notification').modal('show');
                $('#notification input#track_id').val(id);
                return false;
            });
            this.$el.find('.track-item').unbind('click').on('click', function(){
                var id = $(this).data('id');
                self.model.trigger('issue:select', {id:id})
            });
            $('#notification #delete-track').unbind('click').on('click', function(){
                $(this).find('i').addClass('fa-refresh fa-spin');
                var id = $('#notification #track_id').val();
                $.post('/1.0/sequence/remove/', { 'sequenceId': id, 'externalUserId': osm_user_id, 'userType': osm_user_type }, function(data){
                    if(data.status.apiCode == 600) location.reload();
                });
                return false;
            });
        },
        show: function() {
            this.$el.removeClass('hidden').parent().removeClass('hidden');
            $('#MENU_SECTION').removeClass().addClass('topbar profile');
            $('#MENU_SECTION').find('div:first-child').removeClass('hidden').find('.breadcrumb').removeClass('hidden');
            $('#MENU_SECTION').find('div:last-child').addClass('hidden');
        },
         
        hide: function() {
            this.$el.addClass('hidden').parent().addClass('hidden');
            $('#MENU_SECTION').removeClass('profile');
        }
    });

});