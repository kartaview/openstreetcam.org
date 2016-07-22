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

	class OSVVideoController{

	public function index(Application $app){
		$form = $app['form.factory']
			->createBuilder('form')
			->add('sequenceId', 'text', array('data'=>'', 'required'=>false,  'attr' => array('class' => 'form-control')))
			->add('sequenceIndex', 'text', array('data'=>'', 'required'=>false,  'attr' => array('class' => 'form-control')))
			->add('video', 'file', array('required'=>false))
			->getForm();

		$request = $app['request'];
		$response = $app['twig']->render(
			'form.html.twig',
			array(
				'page_title' => "OpenStreetView Video Add",
				'form' => $form->createView(),
				'path' => '/'.API_VERSION.'/video/'
			)
		);
		return $response;
    }
 
	/**
	*Create new  video for sequence
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
			);
			$files = array(
				'video' => $request->files->get('video', null),
			);
		} else {
			$postData = $request->get('form');
			$files = $request->files->get('form');
		}
		if($request->headers->get("sequenceId") != null) {
			$postData['sequenceId'] = $request->headers->get("sequenceId");
		}
		if($request->headers->get("sequenceIndex") != null) {
			$postData['sequenceIndex'] = $request->headers->get("sequenceIndex");
		}
		/******************** UPLOAD FILE IN BODY 
		$uniqueName  = uniqid().'.mp4';
		$tempName =  __DIR__.'/../../tmp/'.$uniqueName;
		$handle = fopen($tempName, "wb") or die("Unable to open file!");
		fwrite($handle, $request->getContent());
		fclose($handle);
		$files['video'] = new Symfony\Component\HttpFoundation\File\UploadedFile($tempName , $uniqueName, 'video/mp4', filesize($tempName), null, TRUE);
		 * 
		 * 
		 */
		
		$video = new OSVVideoProvider();
		$video->setSequenceId(isset($postData['sequenceId'])?$postData['sequenceId']:null);
		$video->setSequenceIndex(isset($postData['sequenceIndex'])?$postData['sequenceIndex']:null);
		$videoErrors = $app['validator']->validate($video);
		if (count($videoErrors) > 0) {
			foreach($videoErrors as $error){
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
		if($app['security.authorization_checker']->isGranted('edit', $osvSequence) == false) {
			$error = new Exception(API_CODE_ACCESS_DENIED, 618);
			$frc = new OSVResponseController($app, null, $error);
			return $frc->jsonResponse;
		}
		if( !$sequence->getIsVideo()){
			$sequence->update($app, null, null, null, null, 1 ); //at first video upload the sequence is updated as a video sequence
		}
		if ($video->searchIndex($app, $video->getSequenceId(), $video->getSequenceIndex())){
			$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_DUPLICATE_ENTRY."(sequenceIndex)", 660);
			$frc = new OSVResponseController($app, null, $error);
			return $frc->jsonResponse;
		}
		// photo validation and upload
		$response = array();
		$error = null;
		try {
			if(isset($files['video']) and $files['video'] != null) {
				// size
				$errors = $app['validator']->validateValue($files['video'], new Assert\File(array('maxSize'=>'1024M')));
				if (count($errors) > 0) {
					$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_OUT_OF_RANGE_ARGUMENT."(video)", 612);
				}	
				// upload
				try{
					$video->setVideo($app, $files['video']);
					
				} catch (Exception $e){
					error_log($e->getCode()."--->".$e->getMessage()." (".print_r($files['video'], true).")");
					$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_POSSIBLY_INACCURATE."(video)", 602);
				}
				// add photo to sequence
				try {
					$videoId = $video->add($app);
					$params['videoId'] = $videoId;
					 $url = $app['url_generator']->generate('split', array(), TRUE);
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
					$result = curl_exec($curlSession);
					curl_close($curlSession);
				 	$response = array(
						'video' => $video->get($app)
					);
				} catch (Exception $e){
					$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_MISSING_ARGUMENT."(video)", 610);
				}
				
			} else {
				$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_MISSING_ARGUMENT."(video)", 610);
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
				'videoId' => $request->request->get('videoId', null),
			);
		} else {
			$postData = $request->get('form');
		}
		$response = array();
		$error = null;
		/*****VALIDATION***/
		$constraint = new Assert\Collection(array( "fields" =>array(
			'videoId' => array(
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
		$video = new OSVVideoProvider();
		$sequence  = new OSVSequenceProvider();
		try{
			if(!$video->get($app, $postData['videoId'])){
				$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_INCORRECT_STATUS." The video you are tring to access is deleted or does not exist.", 671);
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
			$sequence->setId($video->getSequenceId());
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
			$video->delete($app, $postData['videoId']);
		} catch (Exception $e){
			error_log($e->getMessage());
			$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_UNEXPECTED_SERVER_ERROR, 690);
		}
		$frc = new OSVResponseController($app, $response,$error);
		return $frc->jsonResponse;
	}
	
	public function splitVideo(Application $app){
		$request = $app['request'];
		if(is_null($request->get('form', null))) {
			$postData = array(
				'videoId' => $request->request->get('videoId', null),
			);
		} else {
			$postData = $request->get('form');
		}
		$response = array();
		$error = null;
		/*****VALIDATION***/
		$constraint = new Assert\Collection(array( "fields" =>array(
			'videoId' => array(
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
		$video = new OSVVideoProvider();
		$video->setId(isset($postData['videoId'])?$postData['videoId']:null);
		$video->get($app);
		
		$osvSequence = new OSVSequenceProvider();
		$sequence = $osvSequence->get($app, $video->getSequenceId());
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
		$videoPath =  $video->getFileLocation($app, $video->getSequenceId());
		$videoFile =  $videoPath.'/video/'.$video->getVideoName();
		// photo validation and upload
		$response = array();
		$error = null;
		
		try {
			if(file_exists($videoFile)) {
				$tempFile = $videoPath.'/video/video_temp_'.$osvSequence->getId().'_'.$video->getSequenceIndex().'/';
				//error_log($tempFile);
				if (!file_exists($tempFile)) {
					mkdir($tempFile, 0777, true);
				}
				$videoTempPattern = $tempFile.'image-%d.jpg';
				$videoAbsolutePath =  $_SERVER['DOCUMENT_ROOT'].'/'.$videoFile;
				$fps = "1/5";
				 if(!empty($fps)) {
					if (!file_exists($tempFile)) {
						mkdir($tempFile,0777,true);
					}
					$videoMetaDataInfo  = $this->getVideoMetaDataInfo($app, $sequence, $video);
					ksort($videoMetaDataInfo['sequence']);
					$photo = new OSVPhotoProvider();
					$photo->setSequenceId($sequence->getId());
					$index = 1;
					foreach($videoMetaDataInfo['sequence'] as $pictureSequenceIndex => $pictureInfo){
						$splitFile = $tempFile."image-$index.jpg";
						$index++;
						if(file_exists($splitFile)) {
							$photoFile = new Symfony\Component\HttpFoundation\File\UploadedFile($splitFile, "image-$index.jpg", 'image/jpeg', filesize($splitFile), null, TRUE);
							$photo->setSequenceIndex($pictureSequenceIndex);
							$photo->setLat(isset($pictureInfo['lat'])?$pictureInfo['lat']:null);
							$photo->setLng(isset($pictureInfo['lng'])?$pictureInfo['lng']:null);
							$photo->setGpsAccuracy((isset($pictureInfo['gpsAccuracy'])&&  trim($pictureInfo['gpsAccuracy']) != '') ? $pictureInfo['gpsAccuracy'] : null);
							$photo->setHeaders((isset($pictureInfo['headers']) &&  trim($pictureInfo['headers']) != '') ? $pictureInfo['headers'] : null);
							$photoErrors = $app['validator']->validate($photo);
							if (count($photoErrors) > 0) {
								foreach($photoErrors as $error){
									$frc = new OSVResponseController($app, null, $error);
									error_log(print_r($frc->jsonResponse, true));
								}
							} else {
								if ($photo->searchIndex($app, $photo->getSequenceId(), $photo->getSequenceIndex())){
									$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_DUPLICATE_ENTRY."(sequenceIndex)", 660);
									$frc = new OSVResponseController($app, null, $error);
									error_log(print_r($frc->jsonResponse, true));
								} else {
									try{
										$photoName = $photo->setPhoto($app, $photoFile);
										$photoAbsPath = $_SERVER['DOCUMENT_ROOT'].'/'.$video->getFileLocation($app)."/ori/".$photoName;
										$creationDate = date("Y-m-d H:i:s", $pictureInfo['time']);
										$latRef  = $pictureInfo['lat'] > 0 ? "N" : "S";
										$lngRef  = $pictureInfo['lng'] > 0 ? "E" : "W";
										$pictureInfo['lat'] = abs($pictureInfo['lat']);
										$pictureInfo['lng'] = abs($pictureInfo['lng']);
										$latDegrees  = intval( $pictureInfo['lat']);
										$lngDegrees  = intval( $pictureInfo['lng']);
										$latMinutes  = intval(60*($pictureInfo['lat'] - $latDegrees));
										$lngMinutes  = intval(60*($pictureInfo['lng'] - $lngDegrees));
										$latSeconds  = 3600 * ($pictureInfo['lat'] - $latDegrees) - 60 * $latMinutes;
										$lngSeconds  = 3600 * ($pictureInfo['lng'] - $lngDegrees) - 60 * $lngMinutes;
										$photoId = $photo->add($app);
										$sequenceActivePhotos = $photo->countSequencePhotos($app);
										$sequence->setCountActivePhotos($sequenceActivePhotos);
										$sequence->updateCountActivePhotos($app);
									} catch (Exception $e){
										error_log($e->getCode()."--->".$e->getMessage()." (".print_r($files['photo'], true).")");
										$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_POSSIBLY_INACCURATE."(photo)", 602);
									}
								}
							}
						}else {//end if(file_exists($splitFile)) {
							error_log($splitFile." - tried to upload this file from video");
						}
					}//end foreach
					//update Video status 
					$video->update($app,null, 'SPLIT_FINISHED'); 
					$sequence->get($app);
					if( $sequence->getCountActivePhotos() == $videoMetaDataInfo['photoCount']) {
						$sequence->setImagesStatus('UPLOAD_FINISHED');
						$sequence->updateImagesStatus($app);
					}
					
				} else {
					$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_EMPTY_RESULT."(missing ffprobe)", 601);
					$frc = new OSVResponseController($app, null, $error);
					return $frc->jsonResponse;
				}
				$this->rrmdir($tempFile);
			} else {
				$error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_EMPTY_RESULT."(missing video)", 601);
				$frc = new OSVResponseController($app, null, $error);
				return $frc->jsonResponse;
			}
		} catch(Exception $e){
			error_log($e->getMessage());
		}
		$frc = new OSVResponseController($app, $response, $error);
		return $frc->jsonResponse;
	}
	public function getVideoMetaDataInfo(Application $app,OSVSequenceProvider $sequence, OSVVideoProvider $video){
		$metaDataFile = $sequence->getMetaDataFilename();
		$format = array(
			'time' =>0,
			'lat' => 2,
			'lng' => 1,
			'gpsAccuracy' =>4,
			'headers' => 13,
			'videoIndex' =>14,
			'photoIndex' =>15
		);
		if(file_exists($metaDataFile)){
			$handle = fopen($metaDataFile, "r");
			$photoInfo = array();
			$videoMetaDataInfo = array('photoCount' =>  0, 'sequence' => array());
			if ($handle) {
				fgets($handle); //this is the first line that has general information
				$timeLng = 0;
				$timeLat = 0;
				$timeGpsAccuracy = 0;
				$timeHeaders = 0;
				$sequencePhotoCount = 0; 
				while (($line = fgets($handle)) !== false) {
					$lineArray = explode(';', $line);
					if(isset($lineArray[$format['lat']]) && 
						$lineArray[$format['lat']] !== '' && $timeLat < $lineArray[$format['time']]){
						$photoInfo['lat'] = $lineArray[$format['lat']];
						$timeLat = $lineArray[$format['time']];
						$photoInfo['time'] = $lineArray[$format['time']];
					}
					if(isset($lineArray[$format['lng']]) && 
							$lineArray[$format['lng']] !== '' && $timeLng < $lineArray[$format['time']]){
						$photoInfo['lng'] = $lineArray[$format['lng']];
						$timeLng = $lineArray[$format['time']];
					}
					if(isset($lineArray[$format['gpsAccuracy']]) && 
							$lineArray[$format['gpsAccuracy']] !== '' && $timeGpsAccuracy < $lineArray[$format['time']]){
						$photoInfo['gpsAccuracy'] = $lineArray[$format['gpsAccuracy']];
						$timeGpsAccuracy = $lineArray[$format['time']];
					}
					if(isset($lineArray[$format['headers']]) && 
							$lineArray[$format['headers']] !== '' && $timeHeaders < $lineArray[$format['time']]){
						$photoInfo['headers'] = $lineArray[$format['headers']];
						$timeHeaders = $lineArray[$format['time']];
					}
					if($lineArray[$format['videoIndex']] == $video->getSequenceIndex()){ //video index in the sequence
						if(isset($lineArray[$format['photoIndex']]) && $lineArray[$format['photoIndex']] != ''){
							$photoInfo['time'] = $lineArray[$format['time']];
							$videoMetaDataInfo['sequence'][$lineArray[$format['photoIndex']]] = $photoInfo;
						} else {
							array_push($videoMetaDataInfo['sequence'], $photoInfo);
						}
					}//end if
					if(isset($lineArray[$format['photoIndex']]) && $lineArray[$format['photoIndex']] != ''){
						$videoMetaDataInfo['photoCount'] = $lineArray[$format['photoIndex']];
					}
				}
				fclose($handle);
				$videoMetaDataInfo['photoCount']++;
			} else {
				error_log("missing metadatafile $metaDataFile");
				// error opening the file.
			}
			return $videoMetaDataInfo;
		}
	}
	private function rrmdir($dir) {
		if (is_dir($dir)) {
			$objects = scandir($dir);
			foreach ($objects as $object) {
				if ($object != "." && $object != "..") {
					if (filetype($dir."/".$object) == "dir"){
						$this->rrmdir($dir."/".$object);
					}else{
						unlink($dir."/".$object);
					}
				}
			}
			reset($objects);
			rmdir($dir);
		}
	}
}