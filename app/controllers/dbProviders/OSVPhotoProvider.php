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
	use Symfony\Component\Validator\Constraints as Assert;
	use Symfony\Component\Validator\Mapping\ClassMetadata;

	class OSVPhotoProvider{
		
		/**
		 * @var int 
		 */
		public $id;
		 /**
		 * @var int
		 */
		public $sequenceId;
		/**
		 * @var string|null
		 */
		public $dateAdded = null;
		/**
		 * @var string|null
		 */
		public $sequenceIndex = null;
		/**
		 * @var object|null
		 */
		private $photo = null;
		/**
		 * @var string|null
		 */
		public $photoName = null;
		/**
		 * @var float|null
		 */
		public $lat = null;
		/**
		 * @var float|null
		 */
		public $lng = null;
		/**
		 * @var float|null
		 */
		public $gpsAccuracy = null;
		/**
		 * @var string|null
		 */
		public $headers = null;

		public $autoImgProcessingResult = null;

		public $status = null;
		
		public function __construct() {
			
		}	
			
		static public function loadValidatorMetadata(ClassMetadata $metadata) {
			
			$metadata->addPropertyConstraint('sequenceId',  new Assert\NotBlank(array('message' => API_CODE_MISSING_ARGUMENT)));
			$metadata->addPropertyConstraint('sequenceId', new Assert\Type(array('type' => 'numeric', 'message' => API_CODE_INVALID_ARGUMENT)));
			$metadata->addPropertyConstraint('sequenceId', new Assert\Range(array('min' => 1, 'minMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT)));
			
			$metadata->addPropertyConstraint('sequenceIndex',  new Assert\NotBlank(array('message' => API_CODE_MISSING_ARGUMENT)));
			$metadata->addPropertyConstraint('sequenceIndex', new Assert\Type(array('type' => 'numeric', 'message' => API_CODE_INVALID_ARGUMENT)));
			$metadata->addPropertyConstraint('sequenceIndex', new Assert\Range(array('min' => 0, 'max'=>10000000000, 
				'minMessage' => API_CODE_OUT_OF_RANGE_ARGUMENT, 'maxMessage' => API_CODE_OUT_OF_RANGE_ARGUMENT)));
			
			$metadata->addPropertyConstraint('lat', new Assert\NotBlank(array('message' => API_CODE_MISSING_ARGUMENT)));
			$metadata->addPropertyConstraint('lat', new Assert\Type(array('type' => 'numeric', 'message' => API_CODE_INVALID_ARGUMENT)));
			$metadata->addPropertyConstraint('lat', new Assert\Range(array('min' => '-90', 'max' => '90', 'minMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT. "[min -90]", 'maxMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT. "[max 90]")));
			$metadata->addPropertyConstraint('lng', new Assert\NotBlank(array('message' => API_CODE_MISSING_ARGUMENT)));
			$metadata->addPropertyConstraint('lng', new Assert\Type(array('type' => 'numeric', 'message' => API_CODE_INVALID_ARGUMENT)));
			$metadata->addPropertyConstraint('lng', new Assert\Range(array('min' => '-180', 'max' => '180', 'minMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT. "[min -180]", 'maxMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT. "[max 180]")));
			
			$metadata->addPropertyConstraint('gpsAccuracy', new Assert\Type(array('type' => 'numeric', 'message' => API_CODE_INVALID_ARGUMENT)));
			$metadata->addPropertyConstraint('gpsAccuracy', new Assert\Range(array('min' => '0', 'max'=>'999999.9999' ,  'minMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT. "[positive value]", 'maxMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT. "[max 999999.9999]")));			
			
			//$metadata->addPropertyConstraint('photo', new Assert\File(array('maxSize'=>'100k', 'maxSizeMessage' => API_CODE_OUT_OF_RANGE_ARGUMENT. "[max 1mb]")));
		}	
		
		public function setSequenceId($value){
			if(isset($value) && !empty($value)){
				$this->sequenceId = $value;
			}
			return;
		}
		public function getSequenceId(){
			return $this->sequenceId;
		}
		public function setSequenceIndex($value){
			if(isset($value)){
				$this->sequenceIndex = $value;
			}
			return;
		}
		public function getSequenceIndex(){
			return $this->sequenceIndex;
		}
		public function setLat($value){
			if(isset($value) && !empty($value)){
				$this->lat = $value;
			}
			return;
		}
		public function setLng($value){
			if(isset($value) && !empty($value)){
				$this->lng = $value;
			}
			return;
		}
		public function setGpsAccuracy($value){
			if(isset($value)){
				$this->gpsAccuracy = $value;
			}
			return;
		}
		public function setHeaders($value){
			if(isset($value) && !empty($value)){
				$this->headers = $value;
			}
			return;
		}
		public function setPhoto(Application $app, $value){
			if(isset($value) && !empty($value)){
				$this->photo = $value;
				try{
					$path = $this->getFileLocation($app);
					$photo = new UploadProvider($value);
					$photoName = $photo->upload($path, $this->sequenceId);
				}catch(Exception $e) {
					throw new Exception($e->getMessage(), 602); //the request has been processed but there are incidents 
				}
			}
			if(isset($photoName) && !empty($photoName)){
				$this->photoName = $photoName;
			}
			return $this->photoName;
		}	
		public function add(Application $app){
			$schema = $app['db']->getSchemaManager();
			if ($schema->tablesExist('osv_photos')) {	
				$result = $app['db']->insert('osv_photos', array(
				  'sequence_id' 		=> $this->sequenceId,
				  'sequence_index' 		=> $this->sequenceIndex,
				  'lat' 				=> $this->lat,
				  'lng'				=> $this->lng,
				  'name'			=> $this->photoName,
				  'headers'			=> $this->headers,
				  'gps_accuracy'		=> $this->gpsAccuracy,
				  'date_added_day'		=> new \DateTime("now")
				), array( 'date_added_day' => 'datetime'));
				if($result) {
					$this->id= $app['db']->lastInsertId('osv_photos');
					return $this->id;
				}
			}
			return false;
		}
		
		/*
		* get open street view photo properties if the Id is not null
		*/
		public function get(Application $app, $osvPhotoId = null, $status = 'active'){
			if($osvPhotoId) $this->id = $osvPhotoId; 
			$schema = $app['db']->getSchemaManager();
			if ($schema->tablesExist('osv_photos')) {	
				$osvPhoto = $app['db']->fetchAssoc("SELECT *,   DATE_FORMAT(date_added, '%Y-%m-%d % (%H:%i)') AS date_added_f FROM osv_photos
												WHERE id = :id AND status = '$status'", 
												array(
												 	'id' => $this->id
												));
				if($osvPhoto) {
					$this->sequenceId = $osvPhoto['sequence_id'];
					$this->sequenceIndex = $osvPhoto['sequence_index'];
					$this->lat = $osvPhoto['lat'];
					$this->lng = $osvPhoto['lng'];
					$this->gpsAccuracy =  $osvPhoto['gps_accuracy'];
					$this->photoName = $osvPhoto['name'];
					$this->headers = $osvPhoto['headers'];
					$this->dateAdded = $osvPhoto['date_added_f'];
					return $this;
				}		
			}
			return false;
		}

		/**
		* get photos by indexes
		* @param Application $app
		* @param array $indexes
		*/
		public function getByIndexes(Application $app, $sequenceId, $indexes)
		{	
			$result = array();
			$fileLocation  = $this->getFileLocation($app, $sequenceId);
			$photos = $app['db']->fetchAll("
				SELECT id,
				lat,
				lng,
				date_added,
				CONCAT('$fileLocation/proc/', name) AS name, 
				CONCAT('$fileLocation/th/', name)  AS th_name,
				CONCAT('$fileLocation/lth/', name)  AS lth_name
				FROM osv_photos 
				WHERE sequence_index IN (".implode(',',$indexes).") AND sequence_id = ".$sequenceId);
			return $photos;
		}


		public function getByName($app, $name, $status = 'active') 
		{
			$osvPhoto = $app['db']->fetchAssoc("SELECT *,  DATE_FORMAT(date_added, '%Y-%m-%d % (%H:%i)') AS date_added_f FROM osv_photos
				WHERE name = :name AND status = :status",
				array(
				 	'name' => $name,
				 	'status' => $status
				));
			if($osvPhoto) {
				$this->sequenceId = $osvPhoto['sequence_id'];
				$this->sequenceIndex = $osvPhoto['sequence_index'];
				$this->lat = $osvPhoto['lat'];
				$this->lng = $osvPhoto['lng'];
				$this->gpsAccuracy =  $osvPhoto['gps_accuracy'];
				$this->photoName = $osvPhoto['name'];
				$this->headers = $osvPhoto['headers'];
				$this->dateAdded = $osvPhoto['date_added_f'];
				$this->autoImgProcessingResult = $osvPhoto['auto_img_processing_result'];
				$this->status = $osvPhoto['status'];
				return $this;
			}
			return false;		
		}

		/*
		* searches if a certain photo index is added to a sequence
		*/
		public function searchIndex(Application $app, $osvSequenceId = null, $osvSequenceIndex = null){
			$whereSql = "WHERE 1 ";
			$parameters = array();
			if ($osvSequenceId) {
				$whereSql .= " AND sequence_id = :sequence_id";
				$parameters['sequence_id'] = $osvSequenceId;
			}
			if ($osvSequenceIndex) {
				$whereSql .= " AND sequence_index = :sequence_index";
				$parameters['sequence_index'] = $osvSequenceIndex;
			}
			$schema = $app['db']->getSchemaManager();
			if ($schema->tablesExist('osv_photos')) {	
				$countIndex = $app['db']->fetchColumn("SELECT COUNT(id) as countIndex FROM osv_photos $whereSql", $parameters);
				return $countIndex;
			}
			return false;
		}
		public function getSequence(Application $app, $sequenceId, $privacyLevel = 0, $status = true){
			$schema = $app['db']->getSchemaManager();
			if ($schema->tablesExist('osv_photos')) {
				$fileLocation  = $this->getFileLocation($app, $sequenceId);
				$nameSql = " CONCAT('$fileLocation/proc/', name)  AS name ";
				if (!$privacyLevel) {
					$nameSql = " IF( visibility = 'private', CONCAT('$fileLocation/th/', name) , CONCAT('$fileLocation/proc/', name)) AS name ";
				}
				$thNameSql = " CONCAT('$fileLocation/th/', name)  AS th_name";
				$lthNameSql = " CONCAT('$fileLocation/lth/', name)  AS lth_name";
				$photoInfo = "OSV_P.id, 
					OSV_P.sequence_id, 
					OSV_P.sequence_index,
					IF(OSV_P.match_lat IS NULL, OSV_P.lat, OSV_P.match_lat) as lat,
					IF(OSV_P.match_lng IS NULL, OSV_P.lng, OSV_P.match_lng) as lng,
					$nameSql, 
					$lthNameSql, 
					$thNameSql, 
					DATE_FORMAT(OSV_P.date_added, '%Y-%m-%d % (%H:%i)') AS date_added,  
					UNIX_TIMESTAMP(OSV_P.date_added) AS timestamp,  
					OSV_P.match_segment_id,
					OSV_P.match_lat, 
					OSV_P.match_lng, 
					OSV_P.headers AS heading, 
					OSV_P.gps_accuracy ";
					//date_added_f

				$statusSQL = $status ? "AND status='active'" : '';
				$osvPhotos = $app['db']->fetchAll("SELECT $photoInfo 
									     FROM osv_photos AS OSV_P
									     WHERE OSV_P.sequence_id = :sequence_id $statusSQL
									     ORDER BY OSV_P.sequence_index ASC", 
								array( 'sequence_id' => $sequenceId ));
				if($osvPhotos) {
					return $osvPhotos;
				}		
			}
			return false;
		} 
		public function getSequenceHeadPhoto(Application $app, $sequenceId, $privacyLevel){
			$schema = $app['db']->getSchemaManager();
			if ($schema->tablesExist('osv_photos')) {
				$fileLocation  = $this->getFileLocation($app, $sequenceId);
				$osvPhotos = $app['db']->fetchAssoc(
					"SELECT CONCAT('$fileLocation/th/', name) AS name FROM osv_photos "
						. "WHERE sequence_id = :sequence_id AND status='active' "
						. "ORDER BY sequence_index ASC LIMIT 1", 
					array( 'sequence_id' => $sequenceId)
				);
				if($osvPhotos && isset($osvPhotos['name'])) {
					return $osvPhotos['name'];
				}
			}
			return false;
		} 
		 
		public function countSequencePhotos(Application $app, $sequenceId = null){
			if(isset($sequenceId) && !empty($sequenceId)) {
				$this->sequenceId = $sequenceId;
			}
			$schema = $app['db']->getSchemaManager();
			if ($schema->tablesExist('osv_photos')) {	
				$osvPhotos = $app['db']->fetchAssoc("SELECT  COUNT(*) AS photos_no  FROM osv_photos
									    WHERE sequence_id = :sequence_id AND status='active'", 
												array(
												 	'sequence_id' => $this->sequenceId
												));

				if($osvPhotos && isset($osvPhotos['photos_no'])) {
					return $osvPhotos['photos_no'];
				}		
			}
			return false;
		} 
		
		public function getSequenceProcessingStatus(Application $app, $sequenceId = null){
			if(isset($sequenceId) && !empty($sequenceId)) {
				$this->sequenceId = $sequenceId;
			}
			$schema = $app['db']->getSchemaManager();
			if ($schema->tablesExist('osv_photos')) {	
				$osvPhotos = $app['db']->fetchAll("SELECT  auto_img_processing_status, COUNT(*) AS count_processing_status  FROM osv_photos
									    WHERE sequence_id = :sequence_id AND status='active' GROUP BY auto_img_processing_status ", 
												array(
												 	'sequence_id' => $this->sequenceId
												));

				if($osvPhotos) {
					return $osvPhotos;
				}		
			}
			return false;
		} 
		public function deleteSequencePhotos(Application $app, $sequenceId){
			$schema = $app['db']->getSchemaManager();
			$sequencePhotos = $this->getSequence($app, $sequenceId, true, false);
			$path = $this->getFileLocation($app, $sequenceId);
			if( $sequencePhotos && count($sequencePhotos) > 0) {
				foreach ($sequencePhotos as $photo) {
					$this->deleteFile($photo['name'], $path);
				}
			}
			if ($schema->tablesExist('osv_photos')) {	
				$app['db']->executeUpdate("UPDATE osv_photos SET status = :status "
						. "WHERE sequence_id = :sequence_id", array('sequence_id' => $sequenceId, "status" => 'deleted'));
			}
			return true;
		} 
		public function exportSequencePhotos(Application $app, $sequenceId){		
			$schema = $app['db']->getSchemaManager();
			if ($schema->tablesExist('osv_photos')) {
				$osvPhotos = $app['db']->fetchAll("SELECT name FROM osv_photos AS OSV_P
											   WHERE OSV_P.sequence_id = :sequence_id ", 
									array( 'sequence_id' => $sequenceId ));
				if($osvPhotos) {
					$zip = new ZipArchive();
					$path = $this->getFileLocation($app, $sequenceId);
					$filename = "$path/$sequenceId"."_export.zip";
					 if ($zip->open($filename, ZIPARCHIVE::CREATE )!==TRUE) {
						  exit("cannot open <$filename>\n");
					}
					if( $osvPhotos && count($osvPhotos) > 0) {
						foreach ($osvPhotos as $photo) {
							if(file_exists("$path/ori/$photo[name]")){
								$zip->addFile("$path/ori/$photo[name]", "$photo[name]");
							}
						}
					}
					$zip->close();
				}		
			}
			return $filename;
		} 
		public function removeExportSequence(Application $app, $sequenceId){		
			$schema = $app['db']->getSchemaManager();
			if ($schema->tablesExist('osv_photos')) {
				$path = $this->getFileLocation($app, $sequenceId);
				$filename = "$path/$sequenceId"."_export.zip";
				if(file_exists($filename)){
					unlink($filename);
				}
			}
			return true;
		} 
		public function restoreSequencePhotos(Application $app, $sequenceId){
			$schema = $app['db']->getSchemaManager();
			$sequencePhotos = $this->getSequence($app, $sequenceId, true, false);
			$path = $this->getFileLocation($app, $sequenceId);
			if( $sequencePhotos && count($sequencePhotos) > 0) {
				foreach ($sequencePhotos as $photo) {
					$this->restoreFile($photo['name'], $path);
				}
			}
			if ($schema->tablesExist('osv_photos')) {	
				$app['db']->executeUpdate("UPDATE osv_photos SET status = :status "
						. "WHERE sequence_id = :sequence_id", 
						array('sequence_id' => $sequenceId, "status" => 'active'));
			}
			return true;
		}
		public function delete(Application $app, $osvPhotoId){
			$schema = $app['db']->getSchemaManager();
			if ($schema->tablesExist('osv_photos')) {
				$this->get($app, $osvPhotoId);
				$path = $this->getFileLocation($app, $this->sequenceId);
				$this->deleteFile(null, $path);
				$osvPhotos = $app['db']->executeUpdate('UPDATE osv_photos SET status = :status WHERE id = :photo_id', array("photo_id" => $osvPhotoId, "status" => 'deleted'));
			}
			return false;
		}
		public function restore(Application $app, $osvPhotoId){
			$schema = $app['db']->getSchemaManager();
			if ($schema->tablesExist('osv_photos')) {
				$this->get($app, $osvPhotoId, 'deleted');
				$path = $this->getFileLocation($app, $this->sequenceId);
				$this->restoreFile(null, $path);
				$osvPhotos = $app['db']->executeUpdate('UPDATE osv_photos SET status = :status WHERE id = :photo_id', array("photo_id" => $osvPhotoId, "status" => 'active'));
			}
			return false;
		} 
		private function deleteFile($filename = null, $path = null){
			if(isset($filename) && !empty($filename)) {
				$this->photoName = basename($filename);
			}
			$path = $path == null ? PATH_FILES_PHOTO : $path;
			try{
				@rename($path. "/ori/". $this->photoName, $path. "/del/ori/". $this->photoName);
				@rename($path. "/proc/". $this->photoName, $path. "/del/proc/". $this->photoName);
				@rename($path. "/th/". $this->photoName, $path. "/del/th/". $this->photoName);
				@rename($path. "/lth/". $this->photoName, $path. "/del/lth/". $this->photoName);
			} catch (Exception $e) {
				error_log($e->getMessage());
			}
			return true;
		}
		private function restoreFile($filename = null, $path = null){
			if(isset($filename) && !empty($filename)) {
				$this->photoName = basename($filename);
			}
			$path = $path == null ? PATH_FILES_PHOTO : $path;
			
			try{
				@rename( $path. "/del/ori/". $this->photoName, $path. "/ori/". $this->photoName);
				@rename($path. "/del/proc/". $this->photoName, $path. "/proc/". $this->photoName);
				@rename($path. "/del/th/". $this->photoName, $path. "/th/". $this->photoName);
				@rename($path. "/del/lth/". $this->photoName, $path. "/lth/". $this->photoName);
			} catch (Exception $e) {
				error_log($e->getMessage());
			}
			return true;
		}
		
		private function getFileLocation(Application $app, $sequenceId = null){
			if(isset($sequenceId) && !empty($sequenceId)) {
				$this->sequenceId = $sequenceId;
			}
			$path = PATH_FILES_PHOTO;
			try{
				$currentDate = $app['db']->fetchAssoc("SELECT YEAR(date_added) AS year,  MONTH(date_added) AS month, DAY(date_added) as day FROM osv_sequence WHERE id = :sequence_id ", 
									array('sequence_id' => $this->sequenceId));
				if(isset($currentDate) && isset($currentDate['year']) && isset($currentDate['month']) &&isset($currentDate['day'])) {
					$path .= '/'.  implode('/', $currentDate);
					if (!file_exists($path)) {
						mkdir($path, 0777, true);
					}
					if (!file_exists($path.'/th')) {
						mkdir($path.'/th', 0777, true);
					}
					if (!file_exists($path.'/lth')) {
						mkdir($path.'/lth', 0777, true);
					}
					if (!file_exists($path.'/ori')) {
						mkdir($path.'/ori', 0777, true);
					}
					if (!file_exists($path.'/proc')) {
						mkdir($path.'/proc', 0777, true);
					}
					if (!file_exists($path.'/del')) {
						mkdir($path.'/del', 0777, true);
					}
					if (!file_exists($path.'/del/th')) {
						mkdir($path.'/del/th', 0777, true);
					}
					if (!file_exists($path.'/del/lth')) {
						mkdir($path.'/del/lth', 0777, true);
					}
					if (!file_exists($path.'/del/ori')) {
						mkdir($path.'/del/ori', 0777, true);
					}
					if (!file_exists($path.'/del/proc')) {
						mkdir($path.'/del/proc', 0777, true);
					}
				}
			} catch (Exception $e) {
				error_log($e->getMessage());
			}
			return $path;
		} 

		public function getAutoImgProcessingResult()
		{
			return $this->autoImgProcessingResult;
		}

		public function getStatus()
		{
			return $this->status;
		}
	}