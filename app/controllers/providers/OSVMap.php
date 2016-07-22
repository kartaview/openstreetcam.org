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

class OSVMap implements ControllerProviderInterface{
 
    public function connect(Application $app)
    {
		$list = $app["controllers_factory"];
		$list->post("/", "OSVMapController::index")->bind('tracks');
		$list->post("/tracks", "OSVMapController::tracksDeprecated")->bind('tracks-deprecated');
		return $list;
    }
 
}