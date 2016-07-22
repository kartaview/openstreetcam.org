/*
 * This file is part of the openstreetview.org
 *
 * Copyright ©2016, Telenav, Inc.  All Rights Reserved
 *
 * The code is licensed under the LGPL Version 3 license 
 *  http://www.gnu.org/licenses/lgpl-3.0.en.html.
 */
define([
    'machina',

    'routers/GlobalsX',
    'views/OverlayV',
    'models/PathM',

    'routers/MenuX',
    'routers/FooterX',
    'routers/MapX',
    'routers/FilterX',
    'routers/ListX',
    'routers/MyTracksX',
    'routers/DetailsX',
    'routers/IssuesX',

    'routers/AboutUsX',
    'routers/LeaderboardX',
    'routers/HomeX',
    'routers/TermsX'
], function(
    machina,

    GlobalsMixin,
    OverlayView,
    PathModel,

    MenuMixin,
    FooterMixin,
    MapMixin,
    FilterMixin,
    ListMixin,
    MyTracksMixin,
    DetailsMixin,
    IssuesMixin,

    AboutUsMixin,
    LeaderboardMixin,
    HomeMixin,
    TermsMixin
    ) {

    return Backbone.Router.extend(_.extend({},
        GlobalsMixin,
        MenuMixin,
        FooterMixin,
        MapMixin,
        FilterMixin,
        ListMixin,
        MyTracksMixin,
        DetailsMixin,
        IssuesMixin,
        AboutUsMixin,
        LeaderboardMixin,
        HomeMixin,
        TermsMixin,
        {

        layoutStates: null,

        routes: {
            'map/': 'routeMap',
            'map/:location': 'routeMap',
            'map/:routeId': 'routeMap',
            'profile/': 'routeProfile',
            'mytracks/:page/:ipp': 'routeTracks',
            'mytracks/:page/:ipp/*filters': 'routeTracks',
            'aboutus/': 'routeAboutUs',
            'leaderboard/': 'routeLeaderboard',
            'home/': 'routeHome',
            'terms/': 'routeTerms',
            'details/:routeId/:markerIndex': 'routeDetails',
            '*defaultPath': 'routeDefaultPath'
        },
        routesHit: [],
        back: function() {
            if(this.routesHit.length > 0) {
                var routeTo = this.routesHit[this.routesHit.length - 2];
                delete this.routesHit[this.routesHit,length - 1];
                this.navigate(routeTo, {trigger:true, replace:true});
            } else {
              this.navigate('/', {trigger:true, replace:true});
            }
        },
        initialize: function() {
            var self = this;
            this.pathModel = new PathModel();
            this.overlayView = new OverlayView();

            this.issues_initialize();
            this.menu_initialize();
            this.footer_initialize();
            this.map_initialize();
            this.filter_initialize();
            this.list_initialize();
            this.myTracks_initialize();
            this.details_initialize();
    
            this.aboutus_initialize();
            this.leaderboard_initialize();
            this.home_initialize();     
            this.terms_initialize();
            var router = this;
            this.routesHit = [];

            this.layoutStates = new machina.Fsm({

                states: {
                    uninitialized: {
                    },
                    map: {
                        _onEnter: function() {
                            router.menuPaneView.show();
                            router.footerPaneView.show();
                            router.mapPaneView.show();
                            router.filterPaneView.hide();
                            router.listPaneView.hide();
                            router.myTracksPaneView.hide();
                            router.detailsPaneView.hide();
                            router.aboutUsPaneView.hide();
                            router.homePaneView.hide();
                            router.termsPaneView.hide();
                            router.leaderboardPaneView.hide();
                        }
                    },
                    profile: {
                        _onEnter: function() {
                            router.menuPaneView.show();
                            router.footerPaneView.hide();
                            router.mapPaneView.hide();
                            router.filterPaneView.show();
                            router.listPaneView.show();
                            router.myTracksPaneView.hide();
                            router.detailsPaneView.hide();
                            router.aboutUsPaneView.hide();
                            router.homePaneView.hide();
                            router.termsPaneView.hide();
                            router.leaderboardPaneView.hide();
                        }
                    },
                    details: {
                        _onEnter: function() {
                            router.menuPaneView.show();
                            router.footerPaneView.hide();
                            router.mapPaneView.hide();
                            router.filterPaneView.hide();
                            router.listPaneView.hide();
                            router.myTracksPaneView.hide();
                            router.detailsPaneView.show();
                            router.aboutUsPaneView.hide();
                            router.homePaneView.hide();
                            router.termsPaneView.hide();
                            router.leaderboardPaneView.hide();
                        }
                    },
                    aboutus: {
                        _onEnter: function() {
                            router.menuPaneView.show();
                            router.footerPaneView.show();
                            router.mapPaneView.hide();
                            router.filterPaneView.hide();
                            router.listPaneView.hide();
                            router.myTracksPaneView.hide();
                            router.detailsPaneView.hide();
                            router.homePaneView.hide();
                            router.aboutUsPaneView.show();
                            router.termsPaneView.hide();
                            router.leaderboardPaneView.hide();
                        }
                    },
                    leaderboard: {
                        _onEnter: function() {
                            router.menuPaneView.show();
                            router.footerPaneView.hide();
                            router.mapPaneView.hide();
                            router.filterPaneView.hide();
                            router.listPaneView.hide();
                            router.myTracksPaneView.hide();
                            router.detailsPaneView.hide();
                            router.homePaneView.hide();
                            router.aboutUsPaneView.hide();
                            router.termsPaneView.hide();
                            router.leaderboardPaneView.show();
                        }
                    },
                    terms: {
                        _onEnter: function() {
                            router.menuPaneView.show();
                            router.footerPaneView.hide();
                            router.mapPaneView.hide();
                            router.filterPaneView.hide();
                            router.listPaneView.hide();
                            router.myTracksPaneView.hide();
                            router.detailsPaneView.hide();
                            router.aboutUsPaneView.hide();
                            router.termsPaneView.show();
                            router.homePaneView.hide();
                            router.leaderboardPaneView.hide();
                        }
                    }
                }

            });
            Backbone.history.start({pushState: true});

        },
        navigate: function(fragment, options) {
            this.menuPaneModel.abortAll();
            this.routesHit.push(fragment);
            Backbone.history.navigate(fragment, options);
            return this;
        },

        routeDefaultPath: function() {          
            this.pathModel.updateSection(SECTIONS.map);
            this.navigate(this.pathModel.getString(), {trigger: true});
        
            this.menuPaneModel.setSelectedItem(MENU_ITEMS.map);
            
            this.map_show();
        },
        
        routeMap: function(location) {
            this.pathModel.updateDetails({
                location: location
            });
            this.menuPaneModel.setSelectedItem(MENU_ITEMS.map);
        },
        
        routeAboutUs: function() {
            this.pathModel.updateSection(SECTIONS.aboutus);
            this.navigate(this.pathModel.getString(), {trigger: true});
            
            this.menuPaneModel.setSelectedItem(MENU_ITEMS.aboutus);
            
            this.aboutus_showAndPopulate();
        },
        
        routeLeaderboard: function() {
            this.pathModel.updateSection(SECTIONS.leaderboard);
            this.navigate(this.pathModel.getString(), {trigger: true});
            
            this.menuPaneModel.setSelectedItem(MENU_ITEMS.leaderboard);
            
            this.leaderboard_showAndPopulate();
        },
        
        routeHome: function() {
            this.pathModel.updateSection(SECTIONS.home);
            this.home_showAndPopulate();
        },
        
        routeTerms: function() {
            this.pathModel.updateSection(SECTIONS.terms);
            this.navigate(this.pathModel.getString(), {trigger: true});
            
            this.footerPaneModel.setFooterSelectedItem(FOOTER_ITEMS.terms);
            
            this.terms_showAndPopulate();
        },
        
        routeProfile: function(page) {
                // PATH UPDATING
                this.pathModel.updateSection(SECTIONS.profile);

	      // PUSHING DATA
                this.menuPaneModel.setSelectedItem(MENU_ITEMS.profile);
    
                this.list_showAndPopulate();
                
        },
        
        routeTracks: function(page, ipp, filters) {
                // ARGUMENT PARSING
                page = parseInt(page);
                ipp = parseInt(ipp);
                var parsedFilters = this.parseFilters(filters);
    
                // PATH UPDATING
                this.pathModel.updateSection(SECTIONS.mytracks);
                this.pathModel.updatePagination({
                    page: page,
                    ipp: ipp
                });
                this.pathModel.updateFilters(parsedFilters);
    
                // PUSHING DATA
                this.menuPaneModel.setSelectedItem(MENU_ITEMS.mytracks);
                
                this.listPaneModel.setPaginationData({
                    page: page,
                    ipp: ipp
                });
                this.filterPaneModel.setData(parsedFilters);
    
                this.myTracks_showAndPopulate();
                
            //}
        },        

        routeDetails: function(routeId, markerIndex, markerLat, markerLng) {
               // ARGUMENT PARSING
                var parsedDetails = {
                    routeId: routeId,
                    markerIndex: parseInt(markerIndex)
                };
    
                // PATH UPDATING
                this.pathModel.updateSection(SECTIONS.details);
                this.pathModel.updateDetails({
                    routeId: routeId,
                    markerIndex: parseInt(markerIndex)
                });
    
                // PUSHING DATA
                this.menuPaneModel.resetSelection();
                this.detailsPaneModel.setData(parsedDetails, true/*silent*/);
    
                this.details_showAndPopulate();
        },
        parseFilters: function(filters) {
            var parsedFilters;
            if (filters == null) {
                parsedFilters = null;
            } else {
                parsedFilters = {};
                var filterItems = filters.split('/');
                for (var i = 0; i < filterItems.length; i++) {
                    var pair = filterItems[i].split('=');
                    if (pair.length != 2) {
                        parsedFilters = null;
                        break;
                    } else {
                        var key = pair[0];
                        if (!window.FILTERS.hasOwnProperty(key)) {
                            parsedFilters = null;
                            break;
                        }
                        var value = pair[1];
                        if (typeof window.FILTERS[key] == 'Array') {
                            if (window.FILTERS[key].indexOf(value) == -1) {
                                parsedFilters = null;
                                break;
                            }
                        } else if (window.FILTERS[key] == FILTER_DATA_TYPE.number) {
                            // add parsing here
                        } else if (window.FILTERS[key] == FILTER_DATA_TYPE.date) {
                            // add parsing here
                        } else if (window.FILTERS[key] == FILTER_DATA_TYPE.text) {
                            // add parsing here
                        } else if (window.FILTERS[key] == FILTER_DATA_TYPE.boolean) {
                            // add parsing here
                        }
                        var value = filterItems[i].split('=')[1];
                        parsedFilters[key] = value;
                    }
                }
            }
            return parsedFilters;
        },
     handleErrors: function(error) {
            if (error.hasOwnProperty('responseText')) {
                var responseText = JSON.parse(error.responseText);
                if (responseText.status.apiCode == '690') {
                    alert('Something went wrong and we could not establish db connection. Please contact administrator and try again later.');
                    return;
                }
          if (responseText.status.apiCode == '401') {
                     alert('Authentification it\'s required.');
                    return;
                }
            }
            alert('unexpected error');
        }

    }));

});