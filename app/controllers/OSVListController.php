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
	
	class OSVListController{

	public function index(Application $app){
		 $request = $app['request'];
		if(is_null($request->get('form', null))) {
			$postData = array(
				'userName' => $request->request->get('userName', null),
				'location' => $request->request->get('location', null),
				'startDate' => $request->request->get('startDate', null),	
				'endDate' => $request->request->get('endDate', null),
				'bbTopLeft' => $request->request->get('bbTopLeft', null),
				'bbBottomRight' => $request->request->get('bbBottomRight', null),
				'obdInfo' => $request->request->get('obdInfo', null),
				'platformName' => $request->request->get('platformName', null),
				'page' => $request->request->get('page', null),	
				'ipp' => $request->request->get('ipp', null),
				'returnTrack' => $request->request->get('returnTrack', false),	
			);
		} else {
			$postData = $request->get('form');
		}
		$response = null;
		$error = null;
		/*****VALIDATION***/
		$constraint = new Assert\Collection(array( "fields" =>array(
			'userName' => new Assert\Optional(),
			'location' => array(
				new Assert\Optional(),
				new Assert\Type(array('type' => 'string', 'message' => API_CODE_INVALID_ARGUMENT)),
				new Assert\Length(array('min' =>1, 'max' => 5, 'minMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT, 'maxMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT))
			),
			'startDate' => array(new Assert\Optional(), new Assert\Date(array('message' => API_CODE_INVALID_ARGUMENT))),
			'endDate' => array(new Assert\Optional(), new Assert\Date(array('message' => API_CODE_INVALID_ARGUMENT))),
			'bbTopLeft' => array(new Assert\Optional()),
			'bbBottomRight' => array(new Assert\Optional()),
			'obdInfo' => array(new Assert\Optional(), new Assert\Choice(array('choices'=>array( '0', '1'), 'message' => API_CODE_INVALID_ARGUMENT ))),
			'platformName' => array(
				new Assert\Optional(),
				new Assert\Type(array('type' => 'string', 'message' => API_CODE_INVALID_ARGUMENT)),
				new Assert\Length(array('min' =>1, 'max' => 100, 'minMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT, 'maxMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT))
			),
			'page' => array(
				new Assert\Optional(),
				new Assert\Type(array('type' => 'numeric', 'message' => API_CODE_INVALID_ARGUMENT)),
				new Assert\Range(array('min' => '1', 'max' => '32000', 'minMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT, 'maxMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT))
			),
			'returnTrack' => array(new Assert\Optional(), new Assert\Choice(array('choices'=>array( '0', '1'), 'message' => API_CODE_INVALID_ARGUMENT ))),
			'ipp' => array(
				new Assert\Optional(), 
				new Assert\Type(array('type' => 'numeric', 'message' => API_CODE_INVALID_ARGUMENT)),
				new Assert\Range(array('min' => '1', 'max' => '500', 'minMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT, 'maxMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT))
			)),
			"allowMissingFields" => true, "allowExtraFields" =>true ));
		
		$errors = $app['validator']->validateValue($postData, $constraint);
		if (count($errors) > 0) {
			foreach($errors as $error){
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
		}

		$bbTopLeft = explode(",", isset($postData['bbTopLeft'])?$postData['bbTopLeft']:null);
		$bbTopLeftLat = (isset($bbTopLeft[0])?$bbTopLeft[0]:null);
		$bbTopLeftLng = (isset($bbTopLeft[1])?$bbTopLeft[1]:null);
		
		$bbBottomRight = explode(",", isset($postData['bbBottomRight'])?$postData['bbBottomRight']:null);
		$bbBottomRightLat = (isset($bbBottomRight[0])?$bbBottomRight[0]:null);
		$bbBottomRightLng = (isset($bbBottomRight[1])?$bbBottomRight[1]:null);
		$obdInfo = isset($postData['obdInfo'])?$postData['obdInfo']:null;
		$platformName = (isset($postData['platformName'])?$postData['platformName']:null);
		/*****END VALIDATION***/
		
		try {
			$osvList = new OSVListProvider();
			$osvSequence = new OSVSequenceProvider();
			$osvUser = new UserProvider();
			$photo = new OSVPhotoProvider();
			$osvList = $osvList->get($app, $postData['userName'], $postData['location'], $postData['startDate'], $postData['endDate'], 
					$bbTopLeftLat, $bbTopLeftLng, $bbBottomRightLat, $bbBottomRightLng,
					$platformName, $obdInfo,
					$postData['page'], $postData['ipp']);
			$pageItems = array();
			
			foreach ($osvList->sequenceList as $oneSequence){
				$owner = $osvUser->get($app, $oneSequence['user_id']);
				$privacyLevel = 1;
				$oneSequence['thumb_name'] = $photo->getSequenceHeadPhoto($app, $oneSequence['id'], $privacyLevel);
				if ($postData['returnTrack']) {
					$oneSequence['track'] = $photo->getSequence($app, $oneSequence['id'], 1);
				}
				array_push($pageItems, $oneSequence);
			}
			$response = array(
				   'currentPageItems' =>$pageItems,
				   'totalFilteredItems' =>$osvList->sequenceCount
			   );
		} catch (Exception $ex) {
			error_log($ex->getMessage());
			$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_UNEXPECTED_SERVER_ERROR, 690);
		}
		$frc = new OSVResponseController($app, $response, $error);
		return $frc->jsonResponse;
	}
	
	public function myList(Application $app){
		$request = $app['request'];
		if(is_null($request->get('form', null))) {
			$postData = array(
				'location' => $request->request->get('location', null),
				'startDate' => $request->request->get('startDate', null),	
				'endDate' => $request->request->get('endDate', null),
				'bbTopLeft' => $request->request->get('bbTopLeft', null),
				'bbBottomRight' => $request->request->get('bbBottomRight', null),
				'obdInfo' => $request->request->get('obdInfo', null),
				'platformName' => $request->request->get('platformName', null),
				'page' => $request->request->get('page', null),	
				'ipp' => $request->request->get('ipp', null),	
				'returnTrack' => $request->request->get('returnTrack', false),	
			);
		} else {
			$postData = $request->get('form');
		}
		$response = null;
		$error = null;
		/*****VALIDATION***/
		$constraint = new Assert\Collection(array("fields" =>array(
			'location' =>array(
				new Assert\Optional(),
				new Assert\Type(array('type' => 'string', 'message' => API_CODE_INVALID_ARGUMENT)),
				new Assert\Length(array('min' =>1, 'max' => 5, 'minMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT, 'maxMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT))
			),
			'startDate' =>array(new Assert\Optional(), new Assert\Date(array('message' => API_CODE_INVALID_ARGUMENT))),
			'endDate' => array(new Assert\Optional(), new Assert\Date(array('message' => API_CODE_INVALID_ARGUMENT))),
			'bbTopLeft' => array(new Assert\Optional()),
			'bbBottomRight' => array(new Assert\Optional()),
			'obdInfo' => array(new Assert\Optional(), new Assert\Choice(array('choices'=>array( '1', '0'), 'message' => API_CODE_INVALID_ARGUMENT ))),
			'platformName' => array(
				new Assert\Optional(),
				new Assert\Type(array('type' => 'string', 'message' => API_CODE_INVALID_ARGUMENT)),
				new Assert\Length(array('min' =>1, 'max' => 100, 'minMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT, 'maxMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT))
			),
			'page' => array(
				new Assert\Optional(),
				new Assert\Type(array('type' => 'numeric', 'message' => API_CODE_INVALID_ARGUMENT)),
				new Assert\Range(array('min' => '1', 'max' => '32000', 'minMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT, 'maxMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT))
			),
			'returnTrack' => array(new Assert\Optional(), new Assert\Choice(array('choices'=>array( '0', '1'), 'message' => API_CODE_INVALID_ARGUMENT ))),
			'ipp' => array(
				new Assert\Optional(), 
				new Assert\Type(array('type' => 'numeric', 'message' => API_CODE_INVALID_ARGUMENT)),
				new Assert\Range(array('min' => '1', 'max' => '500', 'minMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT, 'maxMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT))
				)),
			"allowMissingFields" => true, "allowExtraFields" =>true 
		));
		$errors = $app['validator']->validateValue($postData, $constraint);
		if (count($errors) > 0) {
			foreach($errors as $error){
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
		}
			
		$bbTopLeft = explode(",", isset($postData['bbTopLeft'])?$postData['bbTopLeft']:null);
		$bbTopLeftLat = (isset($bbTopLeft[0])?$bbTopLeft[0]:null);
		$bbTopLeftLng = (isset($bbTopLeft[1])?$bbTopLeft[1]:null);
		
		$bbBottomRight = explode(",", isset($postData['bbBottomRight'])?$postData['bbBottomRight']:null);
		$bbBottomRightLat = (isset($bbBottomRight[0])?$bbBottomRight[0]:null);
		$bbBottomRightLng = (isset($bbBottomRight[1])?$bbBottomRight[1]:null);
		$obdInfo = isset($postData['obdInfo'])?$postData['obdInfo']:null;
		$platformName = (isset($postData['platformName'])?$postData['platformName']:null);
		/*****END VALIDATION***/
		try {
			$osvList = new OSVListProvider();
			$traksStatus = $osvList->getTracksStatus($app, $app['user']->getId());
			$osvSequence = new OSVSequenceProvider();
			$osvUser = new UserProvider();
			$photo = new OSVPhotoProvider();
			$userId = $app['user']->getId();
			if ($app['user']->getRole() == UserProvider::ROLE_SUPER_ADMIN) {
				$userId = false;
			}
			$osvList = $osvList->get($app, null, $postData['location'], $postData['startDate'], $postData['endDate'],
					$bbTopLeftLat, $bbTopLeftLng, $bbBottomRightLat, $bbBottomRightLng,
					$platformName, $obdInfo,
					$postData['page'], $postData['ipp'], $userId);
			$pageItems = array();

			foreach ($osvList->sequenceList as $oneSequence){
				if ($postData['returnTrack']) {
					$oneSequence['track'] = $photo->getSequence($app, $oneSequence['id'], 1);
				}
				array_push($pageItems, $oneSequence);
			}

			$response = array(
				'currentPageItems' 		=> $pageItems,
				'totalFilteredItems' 	=> $osvList->sequenceCount,
				'tracksStatus' 			=> $traksStatus
			);
		} catch (Exception $ex) {
			error_log($ex->getMessage());
			$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_UNEXPECTED_SERVER_ERROR, 690);
		}
		$frc = new OSVResponseController($app, $response, $error);
		return $frc->jsonResponse;
	}

	
	public function routeMatchedWayList(Application $app){
		 $request = $app['request'];
		if(is_null($request->get('form', null))) {
			$postData = array(
				'wayId' => $request->request->get('wayId', null),
				'page' => $request->request->get('page', null),	
				'ipp' => $request->request->get('ipp', null),	
			);
		} else {
			$postData = $request->get('form');
		}
		$response = null;
		$error = null;
		/*****VALIDATION***/
		$constraint = new Assert\Collection(array( "fields" =>array(
			'wayId' => array(
				new Assert\NotBlank(array('message' => API_CODE_MISSING_ARGUMENT)), 
				new Assert\Type(array('type' => 'numeric', 'message' => API_CODE_INVALID_ARGUMENT)),
				new Assert\Range(array('min' =>'0', 'max' => '4294967295', 'minMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT, 'maxMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT))
			),
			'page' => array(
				new Assert\Optional(),
				new Assert\Type(array('type' => 'numeric', 'message' => API_CODE_INVALID_ARGUMENT)),
				new Assert\Range(array('min' => '1', 'max' => '32000', 'minMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT, 'maxMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT))
			),
			'ipp' => array(
				new Assert\Optional(), 
				new Assert\Type(array('type' => 'numeric', 'message' => API_CODE_INVALID_ARGUMENT)),
				new Assert\Range(array('min' => '1', 'max' => '500', 'minMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT, 'maxMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT))
			)),
			"allowMissingFields" => true, "allowExtraFields" =>true)
		);
		$errors = $app['validator']->validateValue($postData, $constraint);
		if (count($errors) > 0) {
			foreach($errors as $error){
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
		}
		/*****END VALIDATION***/
		
		try {
			$osvList = new OSVListProvider();
			$osvSequence = new OSVSequenceProvider();
			$t1 = time();
			$osvList->getRouteMatchedWay($app, $postData['wayId'], $postData['page'], $postData['ipp']);
			$t2 = time();
			foreach ($osvList->sequenceList as &$sequence) {
				$sequence['match_photos'] = $osvSequence->matchRoutePhotosByWayId($app, $sequence['id'], $postData['wayId']);
			}
			$t3 = time();
			$response = array(
				   'currentPageItems' =>$osvList->sequenceList,
				   'totalFilteredItems' =>$osvList->sequenceCount,
				   'sequenceTime' => ($t2 - $t1),
				   'photosTime' => ($t3 - $t2),
			   );
		} catch (Exception $ex) {
			error_log($ex->getMessage());
			$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_UNEXPECTED_SERVER_ERROR, 690);
		}
		$frc = new OSVResponseController($app, $response, $error);
		return $frc->jsonResponse;
	}
	
	public function nearbyPhotoList(Application $app){
		 $request = $app['request'];
		if(is_null($request->get('form', null))) {
			$postData = array(
				'coordinate' => $request->request->get('coordinate', null),
				'radius' => $request->request->get('radius', null),
				'heading' => $request->request->get('heading', null),
				'wayId' => $request->request->get('wayId', null),
				'page' => $request->request->get('page', null),	
				'ipp' => $request->request->get('ipp', null),
				'externalUserId' => $request->request->get('externalUserId', null),
				'date' => $request->request->get('date', null),
			);
		} else {
			$postData = $request->get('form');
		}
		$coordinate = explode(",", isset($postData['coordinate'])?$postData['coordinate']:null);
		$postData['lat'] = isset($coordinate[0]) ? $coordinate[0] : null;
		$postData['lng'] = isset($coordinate[1]) ? $coordinate[1] : null;
		$response = null;
		$error = null;
		/*****VALIDATION***/
		$constraint = new Assert\Collection(array( "fields" =>array(
			'lat' => array(
				new Assert\NotBlank(array('message' => API_CODE_MISSING_ARGUMENT)), 
				new Assert\Type(array('type' => 'numeric', 'message' => API_CODE_INVALID_ARGUMENT)),
				new Assert\Range(array('min' => '-90', 'max' => '90', 'minMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT. '[min -90]', 'maxMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT. '[max 90]'))
			),
			'lng' => array(
				new Assert\NotBlank(array('message' => API_CODE_MISSING_ARGUMENT)), 
				new Assert\Type(array('type' => 'numeric', 'message' => API_CODE_INVALID_ARGUMENT)),
				new Assert\Range(array('min' => '-180', 'max' => '180', 'minMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT. '[min -180]', 'maxMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT. '[max 180]'))
			),
			'radius' => array(
				new Assert\NotBlank(array('message' => API_CODE_MISSING_ARGUMENT)), 
				new Assert\Type(array('type' => 'numeric', 'message' => API_CODE_INVALID_ARGUMENT)),
				new Assert\Range(array('min' => '1', 'max' => '5000', 'minMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT. '[min 1]', 'maxMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT. '[max 5000]'))
			),
			'heading' => array(
				new Assert\Optional(),
				new Assert\Type(array('type' => 'numeric', 'message' => API_CODE_INVALID_ARGUMENT)),
				new Assert\Range(array('min' =>'-180', 'max' => '180', 'minMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT, 'maxMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT))
			),
			'wayId' => array(
				new Assert\Optional(),
				new Assert\Type(array('type' => 'numeric', 'message' => API_CODE_INVALID_ARGUMENT)),
				new Assert\Range(array('min' =>'0', 'max' => '4294967295', 'minMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT, 'maxMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT))
			),
			'page' => array(
				new Assert\Optional(),
				new Assert\Type(array('type' => 'numeric', 'message' => API_CODE_INVALID_ARGUMENT)),
				new Assert\Range(array('min' => '1', 'max' => '32000', 'minMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT, 'maxMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT))
			),
			'ipp' => array(
				new Assert\Optional(), 
				new Assert\Type(array('type' => 'numeric', 'message' => API_CODE_INVALID_ARGUMENT)),
				new Assert\Range(array('min' => '1', 'max' => '5000', 'minMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT, 'maxMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT))
			),
			'externalUserId' => array(
				new Assert\Optional(), 
				new Assert\Type(array('type' => 'numeric', 'message' => API_CODE_INVALID_ARGUMENT)),
			),
			'date' => array(new Assert\Optional(), new Assert\Date(array('message' => API_CODE_INVALID_ARGUMENT))),
			),
			"allowMissingFields" => true, "allowExtraFields" =>true)
		);
	
		$errors = $app['validator']->validateValue($postData, $constraint);
		if (count($errors) > 0) {
			foreach($errors as $error){
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
		}
		/*****END VALIDATION***/
		
		try {
			$osvList = new OSVListProvider();
			$osvUser = new UserProvider();
			$boundingBox = $this->getBoundingBox($postData['lat'],$postData['lng'] , ($postData['radius']/1000));
			$date = null;
			if ($postData['date']) {
				$date = date('Y-m-d H:i:s', strtotime($postData['date']));
			}
			if ($postData['externalUserId']) {
				$osvUser->exists($app, $postData['externalUserId'], 'osm');
			}
			$osvList->getPhotos($app, $boundingBox['nw_lat'],$boundingBox['nw_lng'],$boundingBox['se_lat'],$boundingBox['se_lng'], $postData['heading'],
					$postData['wayId'], $postData['page'], $postData['ipp'], $osvUser->getId(), $date, true);
			$response = array(
				   'currentPageItems' =>$osvList->sequenceList,
				   'totalFilteredItems' =>$osvList->sequenceCount,
			);
		} catch (Exception $ex) {
			error_log($ex->getMessage());
			$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_UNEXPECTED_SERVER_ERROR, 690);
		}
		$frc = new OSVResponseController($app, $response, $error);
		return $frc->jsonResponse;
	}
	
	 function getBoundingBox($lat, $lng, $distance) {
		// distance is in km.
		$radius = 6378.1;
		//North West latitude
		$boundingBox['nw_lat']= rad2deg(asin(sin(deg2rad($lat)) * cos($distance / $radius) + cos(deg2rad($lat)) * sin($distance / $radius) * cos(deg2rad(315))));
		//North West longitude 
		$boundingBox['nw_lng'] = rad2deg(deg2rad($lng) + atan2(sin(deg2rad(315)) * sin($distance / $radius) * cos(deg2rad($lat)), cos($distance / $radius) - sin(deg2rad($lat)) * sin(deg2rad($boundingBox['nw_lat']))));
		//South Est  latitude
		$boundingBox['se_lat']= rad2deg(asin(sin(deg2rad($lat)) * cos($distance / $radius) + cos(deg2rad($lat)) * sin($distance / $radius) * cos(deg2rad(135))));
		//South East longitude 
		$boundingBox['se_lng'] = rad2deg(deg2rad($lng) + atan2(sin(deg2rad(135)) * sin($distance / $radius) * cos(deg2rad($lat)), cos($distance / $radius) - sin(deg2rad($lat)) * sin(deg2rad($boundingBox['se_lat']))));
		//print_r($boundingBox); die();
		return $boundingBox;
  
  	}	
	
}