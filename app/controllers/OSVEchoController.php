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
	use Symfony\Component\HttpFoundation\Request;
	use Symfony\Component\HttpFoundation\Response;
	use Symfony\Component\HttpFoundation\JsonResponse;
	use Symfony\Component\HttpFoundation\RedirectResponse;
	use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
	use Symfony\Component\Validator\Constraints as Assert;
	use Symfony\Component\Validator\Mapping\ClassMetadata;
	use Symfony\Component\Form\FormBuilder;
	use Symfony\Component\Intl\Intl;
	
	class OSVEchoController{

	 public function index(Application $app){
		 $request = $app['request'];
		$response = null;
		$error = null;
		
		$revLocalFile = "app/rev";
		if(file_exists($revLocalFile) && is_file($revLocalFile)) {
			$revFile = fopen($revLocalFile, "r");
			$rev =  fread($revFile,filesize($revLocalFile));
			fclose($revFile);
		} else {
			$rev = '???';
			$error = new Exception(API_CODE_UNEXPECTED_SERVER_ERROR, 690);
		}
		$response = array('revisionNo' => $rev);
		$frc = new OSVResponseController($app, $response, $error);
		return $frc->jsonResponse;
	}

}