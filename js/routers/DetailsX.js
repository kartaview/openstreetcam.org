define([
    'models/DetailsPaneM',
    'views/DetailsPaneV',
    'models/GalleryM',
    'views/GalleryV'
], function(
    DetailsPaneModel,
    DetailsPaneView,
    GalleryModel,
    GalleryView
    ) {
    return {

        details_initialize: function() {
        	  this.galleryModel = new GalleryModel();
            this.galleryView = new GalleryView({model: this.galleryModel});
        	
            this.detailsPaneModel = new DetailsPaneModel();
            this.detailsPaneView = new DetailsPaneView({model: this.detailsPaneModel, gallery: this.galleryModel});
            
            this.detailsPaneView.on('backtomap', this.details_backToMap, this);
        },

        details_showAndPopulate: function() {
	 // PANEL TOGGLING
          this.layoutStates.transition(SECTIONS.details);

            var mainRouter = this;
            // TRIGGERING EXECUTION
            var backLabel = false;
            if (typeof this.routesHit[this.routesHit.length-2] != 'undefined' && this.routesHit[this.routesHit.length-2].indexOf('profile') > -1) {
                backLabel = true;
            }
            this.detailsPaneModel.setData({backLabel:backLabel}, true);
            $.when(this.detailsPaneModel.requestData()).done(function() {
                mainRouter.overlayView.hide();
            }).fail(this.handleErrors);
        },
        
        details_backToMap: function() {
            this.back();
        }

    };
});