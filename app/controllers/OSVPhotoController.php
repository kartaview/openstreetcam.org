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

	class OSVPhotoController{

	public function index(Application $app){
		$form = $app['form.factory']
			->createBuilder('form')
			->add('sequenceId', 'text', array('data'=>'', 'required'=>false,  'attr' => array('class' => 'form-control')))
			->add('sequenceIndex', 'text', array('data'=>'', 'required'=>false,  'attr' => array('class' => 'form-control')))
			->add('coordinate','text', array('data'=> '', 'required' => false,  'attr' => array('class' => 'form-control')))
			->add('gpsAccuracy','text', array('data'=> '', 'required' => false,  'attr' => array('class' => 'form-control')))
			->add('headers', 'text', array('data'=> '', 'required' => false,  'attr' => array('class' => 'form-control')))
			->add('photo', 'file', array('required'=>false))
			->getForm();

		$request = $app['request'];
		$response = $app['twig']->render(
			'form.html.twig',
			array(
				'page_title' => "OpenStreetView Photo Add",
				'form' => $form->createView(),
				'path' => '/'.API_VERSION.'/photo/'
			)
		);
		return $response;
    }
 
	/**
	*Create new  photo for sequence
	*Method:POST
	*Request parameters:
	*
	*
	*
	*
	*
	*Returns:
	*
	**/
	public function store(Application $app){
		$request = $app['request'];
		if(is_null($request->get('form', null))) {
			$postData = array(
				'sequenceId' => $request->request->get('sequenceId', null),
				'sequenceIndex' => $request->request->get('sequenceIndex', null),
				'coordinate' => $request->request->get('coordinate', null),
				'gpsAccuracy' => $request->request->get('gpsAccuracy', null),
				'headers' => $request->request->get('headers', null),
			);
			$files = array(
				'photo' => $request->files->get('photo', null),
			);
		} else {
			$postData = $request->get('form');
			$files = $request->files->get('form');
		}
	
		$coordinate = explode(",", isset($postData['coordinate'])?$postData['coordinate']:null);
		$photo = new OSVPhotoProvider();
		$photo->setSequenceId(isset($postData['sequenceId'])?$postData['sequenceId']:null);
		$photo->setSequenceIndex(isset($postData['sequenceIndex'])?$postData['sequenceIndex']:null);
		$photo->setLat(isset($coordinate[0])?$coordinate[0]:null);
		$photo->setLng(isset($coordinate[1])?$coordinate[1]:null);
		$photo->setGpsAccuracy((isset($postData['gpsAccuracy']) &&  trim($postData['gpsAccuracy']) != '')?$postData['gpsAccuracy']:null);
		$photo->setHeaders(isset($postData['headers'])?$postData['headers']:null);
		$photoErrors = $app['validator']->validate($photo);
		if (count($photoErrors) > 0) {
			foreach($photoErrors as $error){
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
		}
		$osvSequence = new OSVSequenceProvider();
		$sequence = $osvSequence->get($app, $postData['sequenceId']);
		if (!$sequence){
			$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_OUT_OF_RANGE_ARGUMENT."(sequenceId)", 612);
			$frc = new OSVResponseController($app, null, $error);
			return $frc->jsonResponse;
		}
		if($app['security.authorization_checker']->isGranted('edit', $sequence) == false) {
			$error = new Exception(API_CODE_ACCESS_DENIED, 618);
			$frc = new OSVResponseController($app, null, $error);
			return $frc->jsonResponse;
		}
		if ($photo->searchIndex($app, $photo->getSequenceId(), $photo->getSequenceIndex())){
			$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_DUPLICATE_ENTRY."(sequenceIndex)", 660);
			$frc = new OSVResponseController($app, null, $error);
			return $frc->jsonResponse;
		}
		// photo validation and upload
		$response = array();
		$error = null;
		try {
			if(isset($files['photo']) and $files['photo'] != null) {
				// size
				$errors = $app['validator']->validateValue($files['photo'], new Assert\File(array('maxSize'=>'20M')));
				if (count($errors) > 0) {
					$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_OUT_OF_RANGE_ARGUMENT."(photo)", 612);
				}	
				// upload
				try{
					$photo->setPhoto($app, $files['photo']);
				} catch (Exception $e){
					error_log($e->getCode()."--->".$e->getMessage()." (".print_r($files['photo'], true).")");
					$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_POSSIBLY_INACCURATE."(photo)", 602);
				}
				// add photo to sequence
				try {
					$photoId = $photo->add($app);
					$sequenceActivePhotos = $photo->countSequencePhotos($app);
					$sequence->setCountActivePhotos($sequenceActivePhotos);
					$sequence->updateCountActivePhotos($app);
					$response = array(
						'photo' => $photo->get($app),
					);
				} catch (Exception $e){
					$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_MISSING_ARGUMENT."(photo)", 610);
				}
				
			} else {
				$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_MISSING_ARGUMENT."(photo)", 610);
			}
		} catch(Exception $e){
			error_log($e->getMessage());
		}
			
		$frc = new OSVResponseController($app, $response, $error);
		return $frc->jsonResponse;
	}
	
	public function remove(Application $app){
		$request = $app['request'];
		if(is_null($request->get('form', null))) {
			$postData = array(
				'photoId' => $request->request->get('photoId', null),
			);
		} else {
			$postData = $request->get('form');
		}
		$response = array();
		$error = null;
		/*****VALIDATION***/
		$constraint = new Assert\Collection(array( "fields" =>array(
			'photoId' => array(
				new Assert\NotBlank(array('message' => API_CODE_MISSING_ARGUMENT)), 
				new Assert\Type(array('type' => 'numeric', 'message' => API_CODE_INVALID_ARGUMENT))),
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
		/*****END PARAMETER  VALIDATION***/
		$user = new UserProvider();
		$photo = new OSVPhotoProvider();
		$sequence  = new OSVSequenceProvider();
		try{
			if(!$photo->get($app, $postData['photoId'])){
				$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_INCORRECT_STATUS." The photo you are tring to access is deleted or does not exist.", 671);
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
			$sequence->setId($photo->getSequenceId());
			if(!$sequence->get($app)){
				$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_INCORRECT_STATUS." The sequence you are tring to access is deleted or does not exist.", 671);
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
			if($app['security.authorization_checker']->isGranted('delete', $sequence) == false) {
				$error = new Exception(API_CODE_ACCESS_DENIED, 618);
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
			$photo->delete($app, $postData['photoId']);
			$sequence->setCountActivePhotos($photo->countSequencePhotos($app));
			$sequence->updateCountActivePhotos($app);
			$sequence->updateTrack($app, $photo->getSequenceId());
			$sequence->matchRoute($app, $photo->getSequenceId());
			$sequence->updateBBox($app, $photo->getSequenceId());
			$sequence->updateTrackDistance($app, $photo->getSequenceId());
		} catch (Exception $e){
			error_log($e->getMessage());
			$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_UNEXPECTED_SERVER_ERROR, 690);
		}
		$frc = new OSVResponseController($app, $response,$error);
		return $frc->jsonResponse;
	}
	
	public function restore(Application $app){
		$request = $app['request'];
		if(is_null($request->get('form', null))) {
			$postData = array(
				'photoId' => $request->request->get('photoId', null),
			);
		} else {
			$postData = $request->get('form');
		}
		$response = array();
		$error = null;
		/*****VALIDATION***/
		$constraint = new Assert\Collection(array( "fields" =>array(
			'photoId' => array(
				new Assert\NotBlank(array('message' => API_CODE_MISSING_ARGUMENT)), 
				new Assert\Type(array('type' => 'numeric', 'message' => API_CODE_INVALID_ARGUMENT))),
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
		/*****END PARAMETER  VALIDATION***/
		$user = new UserProvider();
		$photo = new OSVPhotoProvider();
		$sequence  = new OSVSequenceProvider();
		try{
			if(!$photo->get($app, $postData['photoId'], 'deleted')){
				$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_INCORRECT_STATUS." The photo you are tring to access is deleted or does not exist.", 671);
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
			$sequence->setId($photo->getSequenceId());
			if(!$sequence->get($app)){
				$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_INCORRECT_STATUS." The sequence you are tring to access is deleted or does not exist.", 671);
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
			if($app['security.authorization_checker']->isGranted('edit', $sequence) == false) {
				$error = new Exception(API_CODE_ACCESS_DENIED, 618);
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
			$photo->restore($app, $postData['photoId']);
			$sequence->setCountActivePhotos($photo->countSequencePhotos($app, $photo->getSequenceId()));
			$sequence->updateCountActivePhotos($app, $photo->getSequenceId());
			$sequence->updateTrack($app, $photo->getSequenceId());
			$sequence->matchRoute($app, $photo->getSequenceId());
			$sequence->updateBBox($app, $photo->getSequenceId());
			$sequence->updateTrackDistance($app, $photo->getSequenceId());
		} catch (Exception $e){
			error_log($e->getMessage());
			$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_UNEXPECTED_SERVER_ERROR, 690);
		}
		$frc = new OSVResponseController($app, $response,$error);
		return $frc->jsonResponse;
	}

	public function rotate(Application $app)
	{
		$request = $app['request'];
		if(is_null($request->get('form', null))) {
			$postData = array(
				'photoIndexes' => $request->request->get('photoIndexes', array()),
				'sequenceId' => $request->request->get('sequenceId', null),
				'rotate' => $request->request->get('rotate', null),
				'rotateAll' => $request->request->get('rotateAll', null),
			);
		} else {
			$postData = $request->get('form');
		}
		$response = array();
		$error = null;
		/*****VALIDATION***/
		$constraint = new Assert\Collection(array( "fields" =>array(
			'photoIndexes' => new Assert\Type(array('type' => 'array', 'message' => API_CODE_INVALID_ARGUMENT)),
			'sequenceId' => array(
				new Assert\NotBlank(array('message' => API_CODE_MISSING_ARGUMENT)), 
				new Assert\Type(array('type' => 'numeric', 'message' => API_CODE_INVALID_ARGUMENT))),
			'rotateAll' => new Assert\Type(array('type' => 'numeric', 'message' => API_CODE_INVALID_ARGUMENT)),
			'rotate' => array(
				new Assert\NotBlank(array('message' => API_CODE_MISSING_ARGUMENT)),
				new Assert\Choice(array('choices'=>array('90', '180', '270'), 'message' => API_CODE_INVALID_ARGUMENT ))),
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
		/*****END PARAMETER  VALIDATION***/
		$user = new UserProvider();
		$photo = new OSVPhotoProvider();
		$sequence  = new OSVSequenceProvider();
		try{
			$sequence->setId($postData['sequenceId']);
			if(!$sequence->get($app)){
				$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_INCORRECT_STATUS." The sequence you are tring to access is deleted or does not exist.", 671);
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}

			if($app['security.authorization_checker']->isGranted('edit', $sequence) == false) {
				$error = new Exception(API_CODE_ACCESS_DENIED, 618);
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}

			if ($postData['rotateAll']) {
				$photos = $photo->getSequence($app, $postData['sequenceId']);
			} else {
				$photos = $photo->getByIndexes($app, $postData['sequenceId'], $postData['photoIndexes']);
			}
			$rotate = 0;
			switch($postData['rotate']) {
				case '90':
					$rotate = -90;
					break;
				case '180':
					$rotate = -180;
					break;
				case '270':
					$rotate = -270;
					break;
				default:
					break;
			}
			if ($rotate) {
				foreach ($photos as $photo) {
					if (file_exists($photo['name'])) {
						$image = imagecreatefromjpeg($photo['name']);
						$image = imagerotate($image,$rotate,0);
						imagejpeg($image, $photo['name'], 100);
						imagedestroy($image);
					}
					if (file_exists($photo['lth_name'])) {
						$imageLP = imagecreatefromjpeg($photo['lth_name']);
						$imageLP = imagerotate($imageLP,$rotate,0);
						imagejpeg($imageLP, $photo['lth_name'], 100);
						imagedestroy($imageLP);
					}
					if (file_exists($photo['th_name'])) {
						$imageP = imagecreatefromjpeg($photo['th_name']);
						$imageP = imagerotate($imageP,$rotate,0);
						imagejpeg($imageP, $photo['th_name'], 100);
						imagedestroy($imageP);
					}
				}
			}
		} catch (Exception $e){
			error_log($e->getMessage());
			$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_UNEXPECTED_SERVER_ERROR, 690);
		}
		$frc = new OSVResponseController($app, $response,$error);
		return $frc->jsonResponse;
	}
}