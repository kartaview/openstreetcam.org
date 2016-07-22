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

class OSVDetails implements ControllerProviderInterface{
 
    public function connect(Application $app) 
   {
	$details = $app["controllers_factory"];      
	$details->post("/","OSVDetailsController::index")->bind("details");
	return $details;
    }
 
}