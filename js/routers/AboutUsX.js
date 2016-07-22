define([
    'views/AboutUsV'
], function(
    AboutUsPaneView
    ) {
    return {

        aboutus_initialize: function() {
            this.aboutUsPaneView = new AboutUsPaneView();
        },

        aboutus_showAndPopulate: function () {
            // PANEL TOGGLING
            this.layoutStates.transition(SECTIONS.aboutus);

        }

    };
});