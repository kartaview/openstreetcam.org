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

class OSVPhoto implements ControllerProviderInterface{
 
    public function connect(Application $app)
    {
        $photo = $app["controllers_factory"];
       
		$photo->get("/","OSVPhotoController::index")->bind("photo");
		$photo->post("/","OSVPhotoController::store");
		$photo->post("/remove/","OSVPhotoController::remove");
		$photo->post("/restore/","OSVPhotoController::restore");
		$photo->post("/rotate/","OSVPhotoController::rotate");
		
        return $photo;
    }
 
}