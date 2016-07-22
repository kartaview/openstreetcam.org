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

class OSVUser implements ControllerProviderInterface{
    
	public function connect(Application $app)
	{
		$user = $app["controllers_factory"];
		$user->post("/remove/","OSVUserController::remove");
		$user->post("/details/","OSVUserController::details");
		$user->post("/leaderboard/","OSVUserController::leaderboard");
		$user->post("/email/","OSVUserController::setEmail");
		return $user;
	}
}