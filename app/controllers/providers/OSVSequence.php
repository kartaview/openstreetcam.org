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

class OSVSequence implements ControllerProviderInterface{
 
    public function connect(Application $app)
    {
	$sequence = $app["controllers_factory"];
	$sequence->get("/", "OSVSequenceController::index")->bind('sequence');
	$sequence->post("/","OSVSequenceController::store");
	$sequence->post("/photo-list/", "OSVSequenceController::photoList")->bind('photo-list');
	$sequence->post("/remove/", "OSVSequenceController::remove")->bind('sequence-remove');
	$sequence->post("/restore/", "OSVSequenceController::restore")->bind('sequence-restore');
	$sequence->post("/finished-uploading/", "OSVSequenceController::finishedUploading")->bind('finished-uploading');
	$sequence->post("/update-info/", "OSVSequenceController::updateInfo")->bind('update-info');
	$sequence->post("/edit/", "OSVSequenceController::edit")->bind('edit');
	$sequence->get("/export/{sequenceId}/", "OSVSequenceController::export")->bind('export');
	$sequence->post("/export/remove/", "OSVSequenceController::exportRemove")->bind('export-remove');
	
	return $sequence;
    }
 
}