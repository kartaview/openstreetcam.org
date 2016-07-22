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

	class OSVResponseController{
    
	public $jsonResponse = array();
	
	public function __construct(Application $app, $response = null, $error = null, $apiMessage=null){
		$httpCode = 200; 
		if($error){
			$httpCode = 400;
			$apiMessage = explode(':', $error->getMessage());
			$apiMessageExplain = "";
			if(method_exists($error, "getPropertyPath")) {
				if( $error->getPropertyPath() == 'photo' ) {
					$apiMessage = explode(':', API_CODE_INVALID_REQUEST_BODY.$error->getMessage());
				}
				$apiMessageExplain = '('.str_replace(array('currentLat', 'currentLng'), 'validate currentCoordinate', $error->getPropertyPath()).')';
			} 
			$apiResponse['status'] = array(
					'apiCode' => isset($apiMessage[0])?$apiMessage[0]:'',
					"apiMessage"=> (isset($apiMessage[1])?$apiMessage[1]:'').$apiMessageExplain,
					"httpCode"=> $httpCode,
					"httpMessage"=> HTTP_CODE_BAD_REQUEST
				);
		} else {
			if(is_null($apiMessage)) {
				$apiMessage = explode(':', API_CODE_OK);
			} else {
				$apiMessage = explode(':', $apiMessage);
			}
			$apiResponse['status'] = array(
					'apiCode' =>  isset($apiMessage[0])?$apiMessage[0]:'',
					"apiMessage"=> isset($apiMessage[1])?$apiMessage[1]:'',
					"httpCode"=> $httpCode,
					"httpMessage"=> HTTP_CODE_SUCCESS
				);
			if(array_key_exists('currentPageItems', $response) || array_key_exists('statistic', $response) ) {
				$apiResponse = array_merge($apiResponse, $response);
			} else { 
				$apiResponse['osv'] = $response;
			}
		}

		if ($app['debug']) {
			$timeEnd = microtime(true);
			$apiResponse['status']['executionTime'] = $timeEnd - (float)$app['timeStart'];
		}

		//$this->jsonResponse = $app->json($apiResponse, $httpCode, array('Cache-Control' => 'max-age=0,public'));
		$this->jsonResponse = $app->json($apiResponse, $httpCode);
	}
}