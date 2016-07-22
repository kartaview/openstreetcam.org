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

class OSVVideo implements ControllerProviderInterface{
    
	public function connect(Application $app)
	{
		$video = $app["controllers_factory"];
		$video->get("/","OSVVideoController::index")->bind("photo");
		$video->post("/","OSVVideoController::store");
		$video->post("/remove/","OSVVideoController::remove");
		$video->post("/split/","OSVVideoController::splitVideo")->bind("split");
		return $video;
	}
}