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
	

	class OSVSequenceController{

	public function index(Application $app){
	
		$form = $app['form.factory']
			->createBuilder('form')
			->add('externalUserId', 'text', array('data'=>'', 'required' => false, 'attr' => array('class' => 'form-control')))
			->add('userName', 'text', array('data'=>'', 'required' => false, 'attr' => array('class' => 'form-control')))
			->add('userType', 'choice', array( 'choices' => array('osm' => 'osm', 'anonymous' => 'anonymous'),
								 'constraints' 	=> new Assert\Choice(array('osm', 'anonymous')), 'required'=>false,
								  'attr' => array('class' => 'form-control')))
			->add('clientToken','text', array('data'=> '', 'required'=>false, 'attr' => array('class' => 'form-control')))
			->add('currentCoordinate', 'text', array('data'=> '', 'required' => false,  'attr' => array('class' => 'form-control')))
			->add('obdInfo', 'choice', array( 'choices' => array('1' => 'true', '0' => 'false'),
							     'constraints' => new Assert\Choice(array('1', '0')),
							     'required'=>false,
							     'attr' => array('class' => 'form-control')))
			->add('platformName', 'text', array('data'=>'', 'required' => false, 'attr' => array('class' => 'form-control')))
			->add('platformVersion', 'text', array('data'=>'', 'required' => false, 'attr' => array('class' => 'form-control')))
			->add('appVersion', 'text', array('data'=>'', 'required' => false, 'attr' => array('class' => 'form-control')))
			->add('metaData', 'file', array('required'=>false))
			->getForm();

		$request = $app['request'];
		$response = $app['twig']->render(
			'form.html.twig',
			array(
				'page_title' => "OpenStreetView",
				'form' => $form->createView(),
				'path' => '/'.API_VERSION.'/sequence/'
			)
		);
		return $response;
    }
 
 
	/**
	*Create new open  street view sequence 
	*Method:POST
	*Request parameters:
	*
	*
	*
	*
	*
	*Returns:a
	*
	**/
	public function store(Application $app){	
		$request = $app['request'];
		if(is_null($request->get('form', null))) {
			$postData = array(
				'externalUserId' => $request->request->get('externalUserId', null),
				'userType' => $request->request->get('userType', null),
				'userName' => $request->request->get('userName', null),
				'clientToken' => $request->request->get('clientToken', null),
				'currentCoordinate' => $request->request->get('currentCoordinate', null),		
				'obdInfo' => $request->request->get('obdInfo', null),		
				'platformName' => $request->request->get('platformName', null),		
				'platformVersion' => $request->request->get('platformVersion', null),		
				'appVersion' => $request->request->get('appVersion', null),		
			);
			$files = array(
				'metaData' => $request->files->get('metaData', null),
			);
		} else {
			$postData = $request->get('form');
			$files = $request->files->get('form');
		}
		
		$user = new UserProvider();
		$user->setExternalUserId(isset($postData['externalUserId'])?$postData['externalUserId']:null);
		$user->setType(isset($postData['userType'])?$postData['userType']:null);
		$user->setUsername(isset($postData['userName'])?$postData['userName']:null);
		$userErrors = $app['validator']->validate($user);
		if (count($userErrors) > 0) {
			foreach($userErrors as $error){
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
		}
		
		$sequence = new OSVSequenceProvider();
		$sequence->setClientToken(isset($postData['clientToken'])?$postData['clientToken']:null);
		$currentCoordinate = explode(",", isset($postData['currentCoordinate'])?$postData['currentCoordinate']:null);
		$sequence->setCurrentLat(isset($currentCoordinate[0])?$currentCoordinate[0]:null);
		$sequence->setCurrentLng(isset($currentCoordinate[1])?$currentCoordinate[1]:null);
		$address = $sequence->getAddressDetails($sequence->currentLat, $sequence->currentLng, $app);
		$sequence->setCountryCode(isset($address['address']['cc']) ? $address['address']['cc'] : null);
		$sequence->setCountActivePhotos(0);
		$sequenceErrors = $app['validator']->validate($sequence);
		if (count($sequenceErrors) > 0) {
			foreach($sequenceErrors as $error){
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
		}
		$constraint = new Assert\Collection(array( "fields" =>array(
			'obdInfo' => array(new Assert\Optional(), new Assert\Choice(array('choices'=>array( '0', '1'), 'message' => API_CODE_INVALID_ARGUMENT ))),
			'platformName' =>array( 
				new Assert\Optional(),
				new Assert\Type(array('type' => 'string', 'message' => API_CODE_INVALID_ARGUMENT)),
				new Assert\Length(array('min' =>1, 'max' => 100, 'minMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT, 'maxMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT))
			),
			'platformVersion' => array(
				new Assert\Optional(),
				new Assert\Type(array('type' => 'string', 'message' => API_CODE_INVALID_ARGUMENT)),
				new Assert\Length(array('min' =>1, 'max' => 25, 'minMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT, 'maxMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT))
			),
			'appVersion' => array(
				new Assert\Optional(),
				new Assert\Type(array('type' => 'string', 'message' => API_CODE_INVALID_ARGUMENT)),
				new Assert\Length(array('min' =>1, 'max' => 25, 'minMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT, 'maxMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT))
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
		$sequence->setObdInfo(isset($postData['obdInfo'])?$postData['obdInfo']:null);
		$sequence->setPlatformName(isset($postData['platformName'])?$postData['platformName']:null);
		$sequence->setPlatformVersion(isset($postData['platformVersion'])?$postData['platformVersion']:null);
		$sequence->setAppVersion(isset($postData['appVersion'])?$postData['appVersion']:null);
		
		$response = array();
		$error = null;
		try {
			$userId = $user->add($app);
			if(isset($userId) &&  !is_null($userId)) {
				$sequence->setUserId($userId);
				$sequanceId = $sequence->add($app);
				if(isset($files['metaData']) and $files['metaData'] != null) {
					// size
					$errors = $app['validator']->validateValue($files['metaData'], new Assert\File(array('maxSize'=>'1024M')));
					if (count($errors) > 0) {
						$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_OUT_OF_RANGE_ARGUMENT."(metaData)", 612);
					}	
					// upload
					try{
						$sequence->setMetaData($app, $files['metaData']);
					} catch (Exception $e){
						error_log($e->getCode()."--->".$e->getMessage()." (".print_r($files['metaData'], true).")");
						$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_POSSIBLY_INACCURATE."(metaData)", 602);
					}
				}
			}
			$response = array(
				'sequence' => $sequence->get($app),
			);
		}catch(Exception $e){
			error_log($e->getMessage());
			$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_UNEXPECTED_SERVER_ERROR, 690);
		} 
		$frc = new OSVResponseController($app, $response, $error);
		return $frc->jsonResponse;
	}
	
	public function remove(Application $app){
		$request = $app['request']; 
		if(is_null($request->get('form', null))) {
			$postData = array(
				'sequenceId' => $request->request->get('sequenceId', null),
			);
		} else {
			$postData = $request->get('form');
		}
		$error = null;
		$response = array();
		/*****VALIDATION***/
		$constraint = new Assert\Collection(array( "fields" =>array(
			'sequenceId' => array(
				new Assert\NotBlank(array('message' => API_CODE_MISSING_ARGUMENT)), 
				new Assert\Type(array('type' => 'numeric', 'message' => API_CODE_INVALID_ARGUMENT))),
			),
			"allowMissingFields" => false, "allowExtraFields" =>false 
		));

		$errors = $app['validator']->validateValue($postData, $constraint);
		if (count($errors) > 0) {
			foreach($errors as $error){
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
		}
		/*****END PARAMETER VALIDATION***/
		$osvSequence = new OSVSequenceProvider();
		$osvPhoto = new OSVPhotoProvider();
		$osvVideo = new OSVVideoProvider();
		
	 	$user = new UserProvider();
		try {
			$osvSequence->setId($postData['sequenceId']);
			if(!$osvSequence->get($app)){
				$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_INCORRECT_STATUS." The sequence you are tring to access is deleted or does not exist.", 671);
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
			if($app['security.authorization_checker']->isGranted('delete', $osvSequence) == false) {
				$error = new Exception(API_CODE_ACCESS_DENIED, 618);
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
			$osvPhoto->deleteSequencePhotos($app, $postData['sequenceId']);
			if($osvSequence->getIsVideo()) {
				$osvVideo->deleteSequenceVideos($app, $postData['sequenceId']); //marks videos flag status = 'deleted' 
			}
			$osvSequence->delete($app, $postData['sequenceId']);
		}catch(Exception $e){
			error_log($e->getMessage());
			$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_UNEXPECTED_SERVER_ERROR, 690);
		}
		$frc = new OSVResponseController($app, $response, $error);
		return $frc->jsonResponse;
	}

	public function restore(Application $app){
		$request = $app['request']; 
		if(is_null($request->get('form', null))) {
			$postData = array(
				'sequenceId' => $request->request->get('sequenceId', null),
			);
		} else {
			$postData = $request->get('form');
		}
		$error = null;
		$response = array();
		/*****VALIDATION***/
		$constraint = new Assert\Collection(array( "fields" =>array(
			'sequenceId' => array(
				new Assert\NotBlank(array('message' => API_CODE_MISSING_ARGUMENT)), 
				new Assert\Type(array('type' => 'numeric', 'message' => API_CODE_INVALID_ARGUMENT))),
			),
			"allowMissingFields" => false, "allowExtraFields" =>false 
		));

		$errors = $app['validator']->validateValue($postData, $constraint);
		if (count($errors) > 0) {
			foreach($errors as $error){
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
		}
		/*****END PARAMETER VALIDATION***/
		$osvSequence = new OSVSequenceProvider();
		$osvPhoto = new OSVPhotoProvider();
		$osvVideo = new OSVVideoProvider();
	 	$user = new UserProvider();
		try {
			$osvSequence->setId($postData['sequenceId']);
			if(!$osvSequence->get($app,$osvSequence->getId(), 'deleted')){
				$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_INCORRECT_STATUS." The sequence you are tring to access is deleted or does not exist.", 671);
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
			if($app['security.authorization_checker']->isGranted('edit', $osvSequence) == false) {
				$error = new Exception(API_CODE_ACCESS_DENIED, 618);
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
			$osvPhoto->restoreSequencePhotos($app, $postData['sequenceId']);
			if($osvSequence->getIsVideo()) {
				$osvVideo->restoreSequenceVideos($app, $postData['sequenceId']);
			}
			$osvSequence->restore($app, $postData['sequenceId']);
		}catch(Exception $e){
			error_log($e->getMessage());
			$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_UNEXPECTED_SERVER_ERROR, 690);
		}
		$frc = new OSVResponseController($app, $response, $error);
		return $frc->jsonResponse;
	}
	
	public function photoList(Application $app){
		$request = $app['request']; 
		if(is_null($request->get('form', null))) {
			$postData = array(
				'sequenceId' => $request->request->get('sequenceId', null),
			);
		} else {
			$postData = $request->get('form');
		}
		$constraint = new Assert\Collection(array( "fields" =>array(
				'sequenceId' =>  array(
					new Assert\NotBlank(array('message' => API_CODE_MISSING_ARGUMENT)), 
					new Assert\Type(array('type' => 'numeric', 'message' => API_CODE_INVALID_ARGUMENT)),
					new Assert\Length(array('min' =>1, 'max' => 10, 'minMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT, 'maxMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT))
				),
			),
			"allowMissingFields" => true, "allowExtraFields" =>true 
		));

		$errors = $app['validator']->validateValue($postData, $constraint);
		if (count($errors) > 0) {
			foreach($errors as $error){
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
		}
		$osvList = new OSVListProvider();
		$photo = new OSVPhotoProvider();
		$osvSequence = new OSVSequenceProvider();
		$osvUser = new UserProvider();
		$error = null;
		$response = array();
		try {
			$sequence = $osvSequence->get($app, $postData['sequenceId']);
			if (empty($sequence)) {
				$error = new Exception(API_CODE_EMPTY_RESULT, 601);
			} else {
				$owner = $osvUser->get($app, $sequence->userId);
				$privacyLevel = 1; //not the sequence owner 
				if($app['security.authorization_checker']->isGranted('view', $sequence) == false) {
					$error = new Exception(API_CODE_ACCESS_DENIED, 618);
				} else {
					$photos  = $photo->getSequence($app, $postData['sequenceId'], $privacyLevel);
					if($photos != false) {
						$response =  array(
							'sequenceId' => $postData['sequenceId'],
							'photos' => $photos
						);
					} else {
						$error = new Exception(API_CODE_EMPTY_RESULT, 601);
					}
				}
			}
		}catch(Exception $e){
			error_log($e->getMessage());
			$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_UNEXPECTED_SERVER_ERROR, 690);
		}
		$frc = new OSVResponseController($app, $response, $error);
		return $frc->jsonResponse;
	}
	
	public function finishedUploading(Application $app){
		$request = $app['request']; 
		if(is_null($request->get('form', null))) {
			$postData = array(
				'sequenceId' => $request->request->get('sequenceId', null),
			);
		} else {
			$postData = $request->get('form');
		}
		$constraint = new Assert\Collection(array( "fields" =>array(
			'sequenceId' =>  array(
				new Assert\NotBlank(array('message' => API_CODE_MISSING_ARGUMENT)), 
				new Assert\Type(array('type' => 'numeric', 'message' => API_CODE_INVALID_ARGUMENT)),
				new Assert\Length(array('min' =>1, 'max' => 10, 'minMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT, 'maxMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT))
				),
			),
			"allowMissingFields" => false, "allowExtraFields" =>false 
		));

		$errors = $app['validator']->validateValue($postData, $constraint);
		if (count($errors) > 0) {
			foreach($errors as $error){
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
		}
		/*****END PARAMETER VALIDATION***/
		$user = new UserProvider();
		$osvSequence = new OSVSequenceProvider();
		$response = array();
		$error = array();
		try {
			$osvSequence->setId($postData['sequenceId']);
			if(!$osvSequence->get($app)){
				$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_INCORRECT_STATUS." The sequence you are tring to access is deleted or does not exist.", 671);
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
			if($app['security.authorization_checker']->isGranted('edit', $osvSequence) == false) {
				$error = new Exception(API_CODE_ACCESS_DENIED, 618);
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
			if($osvSequence->getIsVideo() === 1 && $osvSequence->getImagesStatus() == 'NEW') {
				$osvSequence->setImagesStatus("VIDEO_SPLIT");
			} else {
				$osvPhoto = new OSVPhotoProvider();
				$processingStatus = $osvPhoto->getSequenceProcessingStatus($app,$osvSequence->getId());
				$sequenceStatus = "UPLOAD_FINISHED";
				foreach ($processingStatus as $imageProcessingStatus) {
					if( $imageProcessingStatus['auto_img_processing_status'] == 'UNCLEAR'
							&& $imageProcessingStatus['count_processing_status'] > 0){
						$sequenceStatus = "PROCESSING_FAILED";
					}
					if( $imageProcessingStatus['auto_img_processing_status'] == 'COPY_FAILD'
							&& $imageProcessingStatus['count_processing_status'] > 0){
						$sequenceStatus = "PROCESSING_FAILED";
					}
					if( $imageProcessingStatus['auto_img_processing_status'] == 'FINISHED'
							&& $imageProcessingStatus['count_processing_status'] ==  $osvSequence->getCountActivePhotos()){
						$sequenceStatus = "PROCESSING_FINISHED";
					}
				}
				$osvSequence->setImagesStatus($sequenceStatus);
			}
			$result  = $osvSequence->updateImagesStatus($app);
			$params = array( 'sequenceId' => $postData['sequenceId']);
			$url = $app['url_generator']->generate('update-info', array('access_token' => $request->get('access_token')), TRUE);
			$curlSession = curl_init(); 
			$defaults = array(
				CURLOPT_POST => 1,
				CURLOPT_HEADER => 0,
				CURLOPT_URL => $url,
				CURLOPT_FRESH_CONNECT => 1,
				CURLOPT_RETURNTRANSFER => 1,
				CURLOPT_FORBID_REUSE => 1,
				CURLOPT_TIMEOUT => 1, //not waiting for code to finish
				CURLOPT_POSTFIELDS => http_build_query($params, '_', '&')
			);
			curl_setopt_array($curlSession, $defaults);
			curl_exec($curlSession);
			curl_close($curlSession);
			if($result) {
				$response =  array(
					'sequenceId' => $postData['sequenceId'],
				);
			} else {
				$error = new Exception(API_CODE_EMPTY_RESULT, 601);
			}
		}catch(Exception $e){
			error_log($e->getMessage());
			$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_UNEXPECTED_SERVER_ERROR, 690);
		}
		$frc = new OSVResponseController($app, $response, $error);
		return $frc->jsonResponse;
	}
	
	
	public function updateInfo(Application $app){
		$request = $app['request']; 
		if(is_null($request->get('form', null))) {
			$postData = array(
				'sequenceId' => $request->request->get('sequenceId', null)
			);
		} else {
			$postData = $request->get('form');
		}
		$constraint = new Assert\Collection(array( "fields" =>array(
			'sequenceId' =>  array(
				new Assert\NotBlank(array('message' => API_CODE_MISSING_ARGUMENT)), 
				new Assert\Type(array('type' => 'numeric', 'message' => API_CODE_INVALID_ARGUMENT)),
				new Assert\Length(array('min' =>1, 'max' => 10, 'minMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT, 'maxMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT))
			)),
			"allowMissingFields" => false, "allowExtraFields" =>false 
		));
		$errors = $app['validator']->validateValue($postData, $constraint);
		if (count($errors) > 0) {
			foreach($errors as $error){
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
		}
		/*****END PARAMETER VALIDATION***/
		$osvSequence = new OSVSequenceProvider();
		$response = array();
		$error = array();
		try {		
			$osvSequence->setId($postData['sequenceId']);
			if(!$osvSequence->get($app)){
				$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_INCORRECT_STATUS." The sequence you are tring to access is deleted or does not exist.", 671);
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
			if($app['security.authorization_checker']->isGranted('edit', $osvSequence) == false) {
				$error = new Exception(API_CODE_ACCESS_DENIED, 618);
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
			$result  = $osvSequence->updateSequenceInfo($app, $postData['sequenceId']);
			if($result) {
				$response =  array(
					'sequenceId' => $postData['sequenceId'],
				);
			} else {
				$error = new Exception(API_CODE_EMPTY_RESULT, 601);
			}
		}catch(Exception $e){
			error_log($e->getMessage());
			$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_UNEXPECTED_SERVER_ERROR, 690);
		}
		$frc = new OSVResponseController($app, $response, $error);
		return $frc->jsonResponse;
	}
	
	public function edit(Application $app){
		$request = $app['request']; 
		if(is_null($request->get('form', null))) {
			$postData = array(
				'sequenceId' => $request->request->get('sequenceId', null),
				'reviewed' => $request->request->get('reviewed', null),
				'changes' => $request->request->get('changes', null),
				'recognitions' => $request->request->get('recognitions', null)
			);
		} else {
			$postData = $request->get('form');
		}
		$constraint = new Assert\Collection(array( "fields" =>array(
			'sequenceId' =>  array(
				new Assert\NotBlank(array('message' => API_CODE_MISSING_ARGUMENT)), 
				new Assert\Type(array('type' => 'numeric', 'message' => API_CODE_INVALID_ARGUMENT)),
			),
			'reviewed' =>  array(
				new Assert\Optional(),
				new Assert\Type(array('type' => 'numeric', 'message' => API_CODE_INVALID_ARGUMENT)),
				new Assert\Range(array('min' => '1', 'max' => '10000000000', 'minMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT, 'maxMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT))
			),
			'changes' =>  array(
				new Assert\Optional(),
				new Assert\Type(array('type' => 'numeric', 'message' => API_CODE_INVALID_ARGUMENT)),
				new Assert\Range(array('min' => '1', 'max' => '10000000000', 'minMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT, 'maxMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT))
			),
			'recognitions' =>  array(
				new Assert\Optional(),
				new Assert\Type(array('type' => 'numeric', 'message' => API_CODE_INVALID_ARGUMENT)),
				new Assert\Range(array('min' => '1', 'max' => '10000000000', 'minMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT, 'maxMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT))
			)),
			"allowMissingFields" => false, "allowExtraFields" =>false 
		));

		$errors = $app['validator']->validateValue($postData, $constraint);
		if (count($errors) > 0) {
			foreach($errors as $error){
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
		}
		/*****END PARAMETER VALIDATION***/
		$osvSequence = new OSVSequenceProvider();
		$response = array();
		$error = array();
		try { 	
			$osvSequence->setId($postData['sequenceId']);
			if(!$osvSequence->get($app)){
				$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_INCORRECT_STATUS." The sequence you are tring to access is deleted or does not exist.", 671);
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
			if($app['security.authorization_checker']->isGranted('edit', $osvSequence) == false) {
				$error = new Exception(API_CODE_ACCESS_DENIED, 618);
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
			$result  = $osvSequence->update($app, $postData['sequenceId'], $postData['reviewed'], $postData['changes'], $postData['recognitions']);
			if($result) {
				$response =  array(
					'sequence' => $result,
				);
			} else {
				$error = new Exception(API_CODE_EMPTY_RESULT, 601);
			}
		}catch(Exception $e){
			error_log($e->getMessage());
			$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_UNEXPECTED_SERVER_ERROR, 690);
		}
		$frc = new OSVResponseController($app, $response, $error);
		return $frc->jsonResponse;
	}
	
	public function export(Application $app){
		$request = $app['request'];
		$postData = array(
			'sequenceId' => $request->get('sequenceId', null)
		);
		$constraint = new Assert\Collection(array( "fields" =>array(
			'sequenceId' =>  array(
				new Assert\NotBlank(array('message' => API_CODE_MISSING_ARGUMENT)), 
				new Assert\Type(array('type' => 'numeric', 'message' => API_CODE_INVALID_ARGUMENT)),
			)),
			"allowMissingFields" => false, "allowExtraFields" =>false 
		));

		$errors = $app['validator']->validateValue($postData, $constraint);
		if (count($errors) > 0) {
			foreach($errors as $error){
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
		}
		/*****END PARAMETER VALIDATION***/
		$osvSequence = new OSVSequenceProvider();
		$osvPhoto = new OSVPhotoProvider();
		$response = array();
		$error = array();
		try { 	
			$osvSequence->setId($postData['sequenceId']);
			if(!$osvSequence->get($app)){
				$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_INCORRECT_STATUS." The sequence you are tring to access is deleted or does not exist.", 671);
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}	
			if($app['security.authorization_checker']->isGranted('edit', $osvSequence) == false) {
				$error = new Exception(API_CODE_ACCESS_DENIED, 618);
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
			$zipFilename  = $osvPhoto->exportSequencePhotos($app, $postData['sequenceId']);
			//$osvSequence->exportMetaData($app, $postData['sequenceId']);
			
			if($zipFilename != false) {
				$response = new \Symfony\Component\HttpFoundation\BinaryFileResponse($zipFilename);
				$d = $response->headers->makeDisposition(
						\Symfony\Component\HttpFoundation\ResponseHeaderBag::DISPOSITION_ATTACHMENT,
						"$postData[sequenceId]"."_export.zip"
				);
				$response->headers->set('Content-Disposition', $d);
				$response->headers->set('Set-Cookie', 'fileDownload=true; path=/');
				$response->headers->set('Content-type', 'application/octet-stream');
				return $response;
			} else {
					$error = new Exception(API_CODE_EMPTY_RESULT, 601);
			}
		}catch(Exception $e){
			error_log($e->getMessage());
			$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_UNEXPECTED_SERVER_ERROR, 690);
		}
		$frc = new OSVResponseController($app, $response, $error);
		return $frc->jsonResponse;
	}
	public function exportRemove(Application $app){
		$request = $app['request']; 
		if(is_null($request->get('form', null))) {
			$postData = array(
				'sequenceId' => $request->request->get('sequenceId', null)
			);
		} else {
			$postData = $request->get('form');
		}
		$constraint = new Assert\Collection(array( "fields" =>array(
			'sequenceId' =>  array(
				new Assert\NotBlank(array('message' => API_CODE_MISSING_ARGUMENT)), 
				new Assert\Type(array('type' => 'numeric', 'message' => API_CODE_INVALID_ARGUMENT)),
			)),
			"allowMissingFields" => false, "allowExtraFields" =>false 
		));

		$errors = $app['validator']->validateValue($postData, $constraint);
		if (count($errors) > 0) {
			foreach($errors as $error){
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
		}
		/*****END PARAMETER VALIDATION***/
		$osvSequence = new OSVSequenceProvider();
		$osvPhoto = new OSVPhotoProvider();
		$response = array();
		$error = array();
		try { 	
			$osvSequence->setId($postData['sequenceId']);
			if(!$osvSequence->get($app)){
				$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_INCORRECT_STATUS." The sequence you are tring to access is deleted or does not exist.", 671);
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}	
			if($app['security.authorization_checker']->isGranted('edit', $osvSequence) == false) {
				$error = new Exception(API_CODE_ACCESS_DENIED, 618);
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
			$osvPhoto->removeExportSequence($app, $postData['sequenceId']);
		
		}catch(Exception $e){
			error_log($e->getMessage());
			$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_UNEXPECTED_SERVER_ERROR, 690);
		}
		$frc = new OSVResponseController($app, $response, $error);
		return $frc->jsonResponse;
	}
}