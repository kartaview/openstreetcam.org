<?php 
	
/*
 * This file is part of the openstreetview.org
 *
 * Copyright ©2016, Telenav, Inc.  All Rights Reserved
 *
 * The code is licensed under the LGPL Version 3 license 
 *  http://www.gnu.org/licenses/lgpl-3.0.en.html.
 */

use Silex\Application;
use Silex\ControllerProviderInterface;

class OSVList implements ControllerProviderInterface{
 
    public function connect(Application $app)
    {
		$list = $app["controllers_factory"];
		$list->post("/", "OSVListController::index")->bind('list');
		$list->post("/my-list/", "OSVListController::myList")->bind('my-list');
		$list->post("/route-matched-way/", "OSVListController::routeMatchedWayList")->bind('route-matched-way');
		$list->post("/nearby-photos/", "OSVListController::nearbyPhotoList")->bind('nearby-photos');
		return $list;
    }
 
}