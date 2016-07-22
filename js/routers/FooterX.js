/*
 * This file is part of the openstreetview.org
 *
 * Copyright ©2016, Telenav, Inc.  All Rights Reserved
 *
 * The code is licensed under the LGPL Version 3 license 
 *  http://www.gnu.org/licenses/lgpl-3.0.en.html.
 */
define([
    'models/FooterPaneM',
    'views/FooterPaneV'
], function (FooterPaneModel, FooterPaneView) {
    return {

        footer_initialize: function () {
            this.footerPaneModel = new FooterPaneModel();
            this.footerPaneView = new FooterPaneView({model: this.footerPaneModel});
	this.footerPaneView.on('footerSelectedItem:changed', this.footer_changeSection, this);
        },

        footer_changeSection: function(footerSelectedItem) {
            switch (footerSelectedItem) {
                 case FOOTER_ITEMS.terms:
                    this.pathModel.updateSection(SECTIONS.terms);
                    this.navigate(this.pathModel.getString());

                    this.terms_showAndPopulate();
                    
                    break;
                 case FOOTER_ITEMS.aboutus:
                    this.pathModel.updateSection(SECTIONS.aboutus);
                    this.navigate(this.pathModel.getString());

                    this.aboutus_showAndPopulate();
                    
                    break;                    
            }
            this.menuPaneModel.set({selectedItem: null});
        }

    };
});