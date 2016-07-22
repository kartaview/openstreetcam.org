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
	use Silex\Provider;
	use Silex\ServiceProviderInterface;
	use Doctrine\DBAL\Schema\Table;

	class OSVUserController{
		
	public function remove(Application $app){
		$request = $app['request'];
		if(is_null($request->get('form', null))) {
			$postData = array(
				'externalUserId' => $request->request->get('externalUserId', null),
				'userType' => $request->request->get('userType', null),
				'deleteData' => $request->request->get('deleteData', null)
			);
		} else {
			$postData = $request->get('form');
		}
		$response = array();
		$error = null;
		/*****VALIDATION***/
		$constraint = new Assert\Collection(array( "fields" =>array(
			'externalUserId' => array(
				new Assert\NotBlank(array('message' => API_CODE_MISSING_ARGUMENT)), 
				new Assert\Type(array('type' => 'numeric', 'message' => API_CODE_INVALID_ARGUMENT))),
			'userType' => array(
				new Assert\NotBlank(array('message' => API_CODE_MISSING_ARGUMENT)),
				new Assert\Choice(array('choices'=>array( 'osm', 'anonymous'), 'message' => API_CODE_INVALID_ARGUMENT ))),
			'deleteData' => array(
				new Assert\NotBlank(array('message' => API_CODE_MISSING_ARGUMENT)),
				new Assert\Choice(array('choices'=>array( '1', '0'), 'message' => API_CODE_INVALID_ARGUMENT )))),
			"allowMissingFields" => true, "allowExtraFields" =>true
		));
		$errors = $app['validator']->validateValue($postData, $constraint);
		if (count($errors) > 0) {
			foreach($errors as $error){
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
		}
		/*****END PARAMETER  VALIDATION***/
		$user = new UserProvider();
		$osvPhoto = new OSVPhotoProvider();
		$osvSequence  = new OSVSequenceProvider();
		$osvList  = new OSVListProvider();
		$osvVideo  = new OSVVideoProvider();
		try{
			if($app['security.authorization_checker']->isGranted('edit', $user) == false) {
				$error = new Exception(API_CODE_ACCESS_DENIED, 618);
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
			if(!$user->exists($app, $postData['externalUserId'], $postData['userType'])){
				$error = new \Symfony\Component\Config\Definition\Exception\Exception(AUTHENTICATION_REQUIRED, 401);
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
			if($user->getStatus() != 'active'){
				$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_INCORRECT_STATUS." The user you are tring to access is deleted or does not exist.", 671);
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
			$page = 1;
			if($postData['deleteData'] == 1){
				$osvList = $osvList->get($app, null, null, null, null,
						null,null, null, null,
						null, null,
						$page, 100,  $user->getId());

				while(count($osvList->sequenceList) > 0  ){
					foreach($osvList->sequenceList as $sequence){
						$osvSequence->get($app, $sequence['id']);
						$osvPhoto->deleteSequencePhotos($app, $sequence['id']);
						if($osvSequence->getIsVideo()) {
							$osvVideo->deleteSequenceVideos($app, $sequence['id']); 
						}
						$osvSequence->delete($app, $sequence['id']);
					}
					$page++;
					$osvList = $osvList->get($app, null, null, null, null,
						null,null, null, null,
						null, null,
						$page, 100, $postData['externalUserId'], $postData['userType']);
				}
			}
			$user->delete($app, $user->getId());
		} catch (Exception $e){
			error_log($e->getMessage());
			$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_UNEXPECTED_SERVER_ERROR, 690);
		}
		$frc = new OSVResponseController($app, $response,$error);
		return $frc->jsonResponse;
	}
	
	public function leaderboard(Application $app){
		$request = $app['request'];
		if(is_null($request->get('form', null))) {
			$postData = array(
				'fromDate' => $request->request->get('fromDate', null),
			);
		} else {
			$postData = $request->get('form');
		}
		$response = array();
		$error = null;
		/*****VALIDATION***/
		$constraint = new Assert\Collection(array( "fields" =>array(
			'fromDate' => array(
				new Assert\Optional(),
				new Assert\Date(array('message' => API_CODE_INVALID_ARGUMENT)))),
			"allowMissingFields" => true, "allowExtraFields" =>true
		));
		$errors = $app['validator']->validateValue($postData, $constraint);
		if (count($errors) > 0) {
			foreach($errors as $error){
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
		}
		/*****END PARAMETER  VALIDATION***/
		$osvUser = new UserProvider();
		try{
			$fromDate  =  isset($postData['fromDate']) ? $postData['fromDate']: null;
			$response = $osvUser->leaderboard($app,$fromDate);
		} catch (Exception $e){
			error_log($e->getMessage());
			$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_UNEXPECTED_SERVER_ERROR, 690);
		}
		$frc = new OSVResponseController($app, $response,$error);
		return $frc->jsonResponse;
	}
	
	public function setEmail(Application $app){
		$request = $app['request'];
		if(is_null($request->get('form', null))) {
			$postData = array(
				'unobtainable' => $request->request->get('unobtainable', null),
				'email' => $request->request->get('email', null),
				'externalUserId' => $request->request->get('externalUserId', null),
				'userType' => $request->request->get('userType', null),
			);
		} else {
			$postData = $request->get('form');
		}
		$response = array();
		$error = null;
		/*****VALIDATION***/
		$constraint = new Assert\Collection(array( "fields" =>array(
			'externalUserId' => array(
				new Assert\NotBlank(array('message' => API_CODE_MISSING_ARGUMENT)), 
				new Assert\Type(array('type' => 'numeric', 'message' => API_CODE_INVALID_ARGUMENT))),
			'userType' => array(
				new Assert\NotBlank(array('message' => API_CODE_MISSING_ARGUMENT)),
				new Assert\Choice(array('choices'=>array( 'osm', 'anonymous'), 'message' => API_CODE_INVALID_ARGUMENT ))),
			'email' => array(
				new Assert\Optional(),
				new Assert\Email(array('message' => API_CODE_INVALID_ARGUMENT ))),
			'unobtainable' => array(
				new Assert\Optional(),
				new Assert\Choice(array('choices'=>array( '1', '0'), 'message' => API_CODE_INVALID_ARGUMENT )))),
			"allowMissingFields" => true, "allowExtraFields" =>true
		));
		$errors = $app['validator']->validateValue($postData, $constraint);
		if (count($errors) > 0) {
			foreach($errors as $error){
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
		}
		/*****END PARAMETER  VALIDATION***/
		$osvUser = new UserProvider();
		try{
			$email = trim($postData['email']);
			if(isset($postData['email']) &&   !empty($email) ) {
				$osvUser->setEmail(trim($postData['email']));
			}elseif(isset ($postData['unobtainable']) && $postData['unobtainable'] == 1){
				$osvUser->setEmail('unobtainable');
			}
			$osvUser->updateEmail($app,$postData['externalUserId'], $postData['userType']);
		} catch (Exception $e){
			error_log($e->getMessage());
			$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_UNEXPECTED_SERVER_ERROR, 690);
		}
		$frc = new OSVResponseController($app, $response,$error);
		return $frc->jsonResponse;
	}

	public function details(Application $app)
	{
		$request = $app['request'];
		if(is_null($request->get('form', null))) {
			$postData = array(
				'fromDate' => $request->request->get('fromDate', null),
				'externalUserId' => $request->request->get('externalUserId', null),
			);
		} else {
			$postData = $request->get('form');
		}
		$response = array();
		$error = null;
		/*****VALIDATION***/
		$constraint = new Assert\Collection(array( "fields" =>array(
			'fromDate' => array(
				new Assert\Optional(),
				new Assert\Date(array('message' => API_CODE_INVALID_ARGUMENT))),
			'externalUserId' => array(
				new Assert\NotBlank(array('message' => API_CODE_MISSING_ARGUMENT)), 
				new Assert\Type(array('type' => 'numeric', 'message' => API_CODE_INVALID_ARGUMENT)))
			),
			"allowMissingFields" => true, "allowExtraFields" => true
		));
		$errors = $app['validator']->validateValue($postData, $constraint);
		if (count($errors) > 0) {
			foreach($errors as $error){
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
		}
		/*****END PARAMETER  VALIDATION***/
		$osvUser = new UserProvider();
		$osvSequence = new OSVSequenceProvider();
		try{
			if ($postData['externalUserId'] && $osvUser->exists($app, $postData['externalUserId'], 'osm')) {
				$userId = $osvUser->getId();
				$ranks = $osvUser->getRanks($app, $userId);
				$weeklyRank = $osvUser->getRanks($app, $userId, date('Y-m-d', strtotime("-1 week")));
				if ($postData['fromDate']) {
					$filteredRank = $osvUser->getRanks($app, $userId, date('Y-m-d', strtotime($postData['fromDate'])));
					$response['filteredRank'] = $filteredRank['rank'];
				}
				$obdDistance = $osvSequence->getTotalDistance($app, $userId, null, true);
				$response['username'] = $osvUser->getUsername();
				$response['totalDistance'] = isset($ranks['total_km'])?$ranks['total_km']:0;
				$response['obdDistance'] = $obdDistance;
				$response['totalPhotos'] = isset($ranks['total_photos'])?$ranks['total_photos']:0;
				$response['overallRank'] = isset($ranks['rank'])?$ranks['rank']:0;
				$response['totalTracks'] = isset($ranks['total_tracks'])?$ranks['total_tracks']:0;
				$response['weeklyRank'] = isset($weeklyRank['rank'])?$weeklyRank['rank']:0;
			} else {
				$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_UNEXPECTED_SERVER_ERROR, 690);
			}
		} catch (Exception $e){
			error_log($e->getMessage());
			$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_UNEXPECTED_SERVER_ERROR, 690);
		}
		$frc = new OSVResponseController($app, $response,$error);
		return $frc->jsonResponse;
	}

}