/*
 * This file is part of the openstreetview.org
 *
 * Copyright ©2016, Telenav, Inc.  All Rights Reserved
 *
 * The code is licensed under the LGPL Version 3 license 
 *  http://www.gnu.org/licenses/lgpl-3.0.en.html.
 */
define([
    'collections/IssuesC'
], function(
    IssuesCollection
    ) {
    return {

        issues_initialize: function() {
            this.issuesCollection = new IssuesCollection();
        }

    };
});