/*
 * This file is part of the openstreetview.org
 *
 * Copyright ©2016, Telenav, Inc.  All Rights Reserved
 *
 * The code is licensed under the LGPL Version 3 license 
 *  http://www.gnu.org/licenses/lgpl-3.0.en.html.
 */
define([], function() {

    return {

        declareGlobals: function() {

            window.SECTIONS = {
                map: 'map',
                profile: 'profile',
                details: 'details',
                aboutus: 'aboutus',
                leaderboard: 'leaderboard',
	      home: 'home',
   	      terms: 'terms',
                mytracks: 'mytracks'
            };

            window.MENU_ITEMS = {
            	map: 'map',
                profile: 'profile',
                mytracks: 'mytracks',
                leaderboard: 'leaderboard'
            };

           window.FOOTER_ITEMS = {
                terms: 'terms',
                aboutus: 'aboutus'               
            };

            window.FILTER_DATA_TYPE = {
                number: 'number',
                date: 'date',
                text: 'text',
                boolean: 'boolean'
            };

            window.FILTERS = {
                myList: FILTER_DATA_TYPE.boolean,
                location: ['de', 'uk', 'us', 'ro', 'other'],
                startDate: FILTER_DATA_TYPE.date,
                endDate: FILTER_DATA_TYPE.date,
                page: FILTER_DATA_TYPE.number,
                ipp: FILTER_DATA_TYPE.number
            };

        }()

    };

});