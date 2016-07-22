/*
 * This file is part of the openstreetview.org
 *
 * Copyright ©2016, Telenav, Inc.  All Rights Reserved
 *
 * The code is licensed under the LGPL Version 3 license 
 *  http://www.gnu.org/licenses/lgpl-3.0.en.html.
 */
define([
    'models/MenuPaneM',
    'views/MenuPaneV'
], function (MenuPaneModel, MenuPaneView) {
    return {

        menu_initialize: function () {
            this.menuPaneModel = new MenuPaneModel();
            this.menuPaneView = new MenuPaneView({model: this.menuPaneModel});

            this.menuPaneView.on('selectedItem:changed', this.menu_changeSection, this);
        },

        menu_changeSection: function(selectedItem) {
            switch (selectedItem) {
            	case MENU_ITEMS.map:
                    this.pathModel.updateSection(SECTIONS.map);
                    this.navigate(this.pathModel.getString());

                    this.map_show();

                    break;
				case MENU_ITEMS.leaderboard:
                	this.pathModel.updateSection(SECTIONS.leaderboard);
                    this.navigate(this.pathModel.getString());

                    this.leaderboard_showAndPopulate();
                    
                    break;
            	case MENU_ITEMS.profile:
                    this.pathModel.updateSection(SECTIONS.profile);
   
                    this.navigate(this.pathModel.getString());

                    this.list_showAndPopulate();

                    break;                    
            }
            this.footerPaneModel.set({footerSelectedItem: null});
        }

    };
});