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
	use Symfony\Component\Intl\Intl;
	
	class OSVSequenceProvider{
		/**
		*@var int
		*/
		public $id;
		/**
		*@var int
		*/
		public $userId;
		/**
		 * @var string|null
		 */
		public $clientToken;
		
		/**
		 * @var date|null
		 */
		public $dateAdded;
		
		/**
		 * @var float|null
		 */
		public $currentLat;
		
		/**
		 * @var float|null
		 */
		public $currentLng;
		/**
		 * @var string|null
		 */
		public $countryCode;
		/**
		 * @var string|null
		 */
		public $status;
		/**
		 *  @var string|null
		 */
		public $imagesStatus;
		/**
		 *  @var file|null
		 */
		private $metaData;
		/**
		 *  @var string|null
		 */
		public $metaDataFilename;
		/**
		 * @var bool|null
		 */
		public $obdInfo;
		/**
		 * @var string|null
		 */
		public $platformName;
		/**
		 * @var string|null
		 */
		public $platformVersion;
		/**
		 * @var string|null
		 */
		public $appVersion;
		/**
		 * @var array|null
		 */
		public $track;
		/**
		 * @var array|null
		 */
		public $matchTrack;
		/**
		 * @var int|null
		 */
		public $reviewed;
		/**
		 * @var int|null
		 */
		public $changes;
		/**
		 * @var int|null
		 */
		public $recognitions;

		public $address;
		/**
		 * @var int|null
		 */
		private $isVideo;
		
		static public function loadValidatorMetadata(ClassMetadata $metadata) {
			$metadata->addPropertyConstraint('clientToken',  new Assert\NotBlank(array('message' => API_CODE_MISSING_ARGUMENT)));
			$metadata->addPropertyConstraint('clientToken',   new Assert\Type(array('type' => 'string', 'message' => API_CODE_INVALID_ARGUMENT)));
			$metadata->addPropertyConstraint('clientToken', new Assert\Length(array('max' => '65', 'maxMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT. "[max 65]")));
			
			$metadata->addPropertyConstraint('currentLat', new Assert\NotBlank(array('message' => API_CODE_MISSING_ARGUMENT)));
			$metadata->addPropertyConstraint('currentLat', new Assert\Type(array('type' => 'numeric', 'message' => API_CODE_INVALID_ARGUMENT)));
			$metadata->addPropertyConstraint('currentLat', new Assert\Range(array('min' => '-90', 'max' => '90', 'minMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT. "[min -90]", 'maxMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT. "[max 90]")));
			$metadata->addPropertyConstraint('currentLng', new Assert\NotBlank(array('message' => API_CODE_MISSING_ARGUMENT)));
			$metadata->addPropertyConstraint('currentLng', new Assert\Type(array('type' => 'numeric', 'message' => API_CODE_INVALID_ARGUMENT)));
			$metadata->addPropertyConstraint('currentLng', new Assert\Range(array('min' => '-180', 'max' => '180', 'minMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT. "[min -180]", 'maxMessage' =>API_CODE_OUT_OF_RANGE_ARGUMENT. "[max 180]")));
			
		}	
		
		public function setId($value){
			if(isset($value) && !empty($value)){
				$this->id = $value;
			}
			return;
		}
		
		public function setUserId($value){
			if(isset($value) && !empty($value)){
				$this->userId = $value;
			}
			return;
		}
		
		public function getId(){
			return $this->id;
		}
		
		public function getUserId(){
			return $this->userId;
		}
		
		public function getMetaDataFilename(){
			return $this->metaDataFilename;
		}
		
		public function setClientToken($value){
			if(isset($value) && !empty($value)){
				$this->clientToken = $value;
			}
			return;
		}
		
		public function setCurrentLat($value){
			if(isset($value) && !empty($value)){
				$this->currentLat = $value;
			}
			return;
		}
		
		public function setCurrentLng($value){
			if(isset($value) && !empty($value)){
				$this->currentLng = $value;
			}
			return;
		}
		
		public function setCountActivePhotos($value){
			if(isset($value)){
				$this->countActivePhotos = $value;
			}
			return;
		}
		
		public function getCountActivePhotos(){
			return $this->countActivePhotos;
		}
		
		public function getCurrentLat(){
			return $this->currentLat;
		}
		
		public function getCurrentLng(){
			return $this->currentLng;
		}
		
		public function setStatus($value){
			if(isset($value) && !empty($value) && in_array($value, array('active', 'deleted'))){
				$this->status = $value;
			}
			return;
		}
		
		public function setImagesStatus($value){
			if(isset($value) && !empty($value) &&
					in_array($value, array(
						'NEW',
						'VIDEO_SPLIT', 
						'UPLOAD_FINISHED', 
						'PROCESSING_FINISHED', 
						'PROCESSING_FAILED'))){
				$this->imagesStatus = $value;
			}
			return;
		}
		
		public function setCountryCode($value = null){
			if(isset($value) && !empty($value)){
				$this->countryCode = $value;
			}
			return;
		}
		public function setObdInfo($value = null){
			if(isset($value) && in_array($value, array(0,1))){
				$this->obdInfo = $value;
			}
			return;
		}
		public function setPlatformName($value = null){
			if(isset($value) && !empty($value)){
				$this->platformName = $value;
			}
			return;
		}
		public function setPlatformVersion($value = null){
			if(isset($value) && !empty($value)){
				$this->platformVersion = $value;
			}
			return;
		}
		public function setAppVersion($value = null){
			if(isset($value) && !empty($value)){
				$this->appVersion = $value;
			}
			return;
		}
		public function setReviewed($value = null){
			if(isset($value) && !empty($value)){
				$this->reviewed = $value;
			}
			return;
		}
		public function setChanges($value = null){
			if(isset($value) && !empty($value)){
				$this->changes = $value;
			}
			return;
		}
		public function setRecognitions($value = null){
			if(isset($value) && !empty($value)){
				$this->recognitions = $value;
			}
			return;
		}
		public function setIsVideo($value = null){
			if(isset($value) && ($value == 1 || $value == 0)){
				$this->isVideo = $value;
			}
			return;
		}
		public function getIsVideo($value = null){
			return $this->isVideo;
		}
		public function getImagesStatus(){
			return $this->imagesStatus;
		}
		
		public function add(Application $app){
			$schema = $app['db']->getSchemaManager();
			if ($schema->tablesExist('osv_sequence')) {	
				$result = $app['db']->insert('osv_sequence', array(
				  'user_id'			=> $this->userId,
				  'client_token'		=> $this->clientToken,
				  'current_lat'			=> $this->currentLat,
				  'current_lng'		=> $this->currentLng,
				  'country_code'		=> $this->countryCode,
				 'count_active_photos' 	=> $this->countActivePhotos,
				 'status'			=> 'active', //default value 
				 'image_processing_status'	=> 'NEW', //default value 
				 'obd_info'			=> $this->obdInfo,
				 'platform_name'		=> $this->platformName, 
				 'platform_version'		=> $this->platformVersion,
				 'app_version'		=> $this->appVersion,
				 'reviewed'			=> 0, //default value 
				 'changes'			=> 0, //default value
				 'recognitions'		=> 0, //default value
				 'date_added_day'		=> new \DateTime("now")
				), array( 'date_added_day' => 'datetime'));
				if($result) {
					$this->id= $app['db']->lastInsertId('osv_sequence');
					return $this->id;
				}
			}
			return false;
		}
		public function update(Application $app, $sequenceId =null, $reviewed = null, $changes = null, $recognitions = null, $isVideo = null){
			if($sequenceId) $this->setId($sequenceId); 
			if($reviewed) $this->setReviewed($reviewed); 
			if($changes) $this->setChanges($changes); 
			if($recognitions) $this->setRecognitions($recognitions); 
			if(!is_null($isVideo)) $this->setIsVideo($isVideo); 
			$schema = $app['db']->getSchemaManager();
			$updateSql = "UPDATE osv_sequence SET ";
			$updateArray = array();
			$updateSqlArray = array();
			if(isset($this->reviewed) && !is_null($this->reviewed) && !empty($this->reviewed)) {
				$updateSqlArray[] =  "reviewed = :reviewed ";
				$updateArray['reviewed'] = $this->reviewed;
			}
			if(isset($this->changes) && !is_null($this->changes) && !empty($this->changes)) {
				$updateSqlArray[] = "changes = :changes ";
				$updateArray['changes'] = $this->changes;
			}
			if(isset($this->recognitions) && !is_null($this->recognitions) && !empty($this->recognitions)) {
				$updateSqlArray[] =  "recognitions = :recognitions ";
				$updateArray['recognitions'] = $this->recognitions;
			}
			if(isset($this->isVideo) && !is_null($this->isVideo) && in_array($this->isVideo, array('0','1'))) {
				$updateSqlArray[] =  "is_video = :is_video ";
				$updateArray['is_video'] = $this->isVideo;
			}
			if(count($updateArray)) {
				$updateSql .= implode(', ', $updateSqlArray)." WHERE id = :sequence_id";
				$updateArray['sequence_id'] = $this->id;
				if ($schema->tablesExist('osv_sequence')){
					$app['db']->executeUpdate($updateSql,$updateArray);
					return $this->get($app);
				}
			}
			return FALSE;
		}
		
		/*
		* get osv sequence properties if the Id is not null
		*/
		public function get(Application $app, $sequenceId = null, $status = 'active'){
			if($sequenceId) $this->id = $sequenceId; 
			$schema = $app['db']->getSchemaManager();
			if ($schema->tablesExist('osv_sequence')) {	
				$sequenceSearch = $app['db']->fetchAssoc("SELECT *,  
					DATE_FORMAT(date_added, '%Y-%m-%d % (%H:%i)') AS date_added_f, 
					CONCAT('".PATH_FILES_PHOTO."', '/',  
						YEAR(OSV_S.date_added),'/', 
						MONTH(OSV_S.date_added),'/',
						DAY(OSV_S.date_added),'/', OSV_S.meta_data_filename) as meta_data_filename
					FROM osv_sequence OSV_S
					WHERE id = :id AND status = '$status' ", 
												array(
												 	'id' => $this->id
												));
				if($sequenceSearch) {
					$this->userId = $sequenceSearch['user_id'];
					$this->clientToken = $sequenceSearch['client_token'];
					$this->dateAdded = $sequenceSearch['date_added_f'];
					$this->currentLat = $sequenceSearch['current_lat'];
					$this->currentLng = $sequenceSearch['current_lng'];
					$this->countryCode = $sequenceSearch['country_code'];
					$this->countActivePhotos = $sequenceSearch['count_active_photos'];
					$this->status = $sequenceSearch['status'];
					$this->imagesStatus = $sequenceSearch['image_processing_status'];
					$this->metaDataFilename = $sequenceSearch['meta_data_filename'];
					$this->obdInfo = $sequenceSearch['obd_info'];
					$this->platformName = $sequenceSearch['platform_name'];
					$this->platformVersion = $sequenceSearch['platform_version'];
					$this->appVersion = $sequenceSearch['app_version'];
					$this->reviewed = $sequenceSearch['reviewed'];
					$this->changes = $sequenceSearch['changes'];
					$this->recognitions = $sequenceSearch['recognitions'];
					$this->address = $sequenceSearch['address'];
					$this->track = !is_null($sequenceSearch['track'])?unserialize($sequenceSearch['track']):null;
					//$this->matchTrack =!is_null($sequenceSearch['match_track'])?unserialize($sequenceSearch['match_track']):null;
					$this->isVideo =!is_null($sequenceSearch['is_video'])?$sequenceSearch['is_video']:null;
					return $this;
				}		
			}
			return false;
		}


		public function getByMetadataFilename($app, $filename, $status = 'active')
		{
			$schema = $app['db']->getSchemaManager();
			if ($schema->tablesExist('osv_sequence')) {	
				$sequenceSearch = $app['db']->fetchAssoc("SELECT *,  DATE_FORMAT(date_added, '%Y-%m-%d % (%H:%i)') AS date_added_f FROM osv_sequence 
												WHERE meta_data_filename = :meta_data_filename AND status = '$status' ", 
												array(
												 	'meta_data_filename' => $filename
												));
				if($sequenceSearch) {
					$this->userId = $sequenceSearch['user_id'];
					$this->clientToken = $sequenceSearch['client_token'];
					$this->dateAdded = $sequenceSearch['date_added_f'];
					$this->currentLat = $sequenceSearch['current_lat'];
					$this->currentLng = $sequenceSearch['current_lng'];
					$this->countryCode = $sequenceSearch['country_code'];
					$this->countActivePhotos = $sequenceSearch['count_active_photos'];
					$this->status = $sequenceSearch['status'];
					$this->imagesStatus = $sequenceSearch['image_processing_status'];
					$this->metaDataFilename = $sequenceSearch['meta_data_filename'];
					$this->obdInfo = $sequenceSearch['obd_info'];
					$this->platformName = $sequenceSearch['platform_name'];
					$this->platformVersion = $sequenceSearch['platform_version'];
					$this->appVersion = $sequenceSearch['app_version'];
					$this->reviewed = $sequenceSearch['reviewed'];
					$this->changes = $sequenceSearch['changes'];
					$this->recognitions = $sequenceSearch['recognitions'];
					$this->track = !is_null($sequenceSearch['track'])?unserialize($sequenceSearch['track']):null;
					//$this->matchTrack =!is_null($sequenceSearch['match_track'])?unserialize($sequenceSearch['match_track']):null;
					$this->isVideo =!is_null($sequenceSearch['is_video'])?$sequenceSearch['is_video']:null;
					return $this;
				}		
			}
			return false;
		}
		
		public function updateCountActivePhotos(Application $app, $sequenceId = null){
			if($sequenceId) $this->id = $sequenceId; 
			$schema = $app['db']->getSchemaManager();
			if ($schema->tablesExist('osv_sequence')) {	
				$app['db']->executeUpdate("UPDATE osv_sequence SET count_active_photos = :count_active_photos WHERE id = :sequence_id", 
						array('sequence_id' => $this->id, 'count_active_photos' => $this->countActivePhotos));
			}
			return false;
		}
		
		public function updateTrack(Application $app, $sequenceId = null){
			if($sequenceId) $this->id = $sequenceId;
			$schema = $app['db']->getSchemaManager();
			if ($schema->tablesExist('osv_sequence')) {
				$osvSequenceTrack = $app['db']->fetchAssoc("SELECT  * FROM osv_sequence WHERE id = :sequence_id", 
												array( 'sequence_id' => $this->id ));
				if($osvSequenceTrack && isset($osvSequenceTrack['id'])) {
					if($schema->tablesExist('osv_photos')) {
						$osvTrack = $this->getGpsTrack($app, $sequenceId);
						if($osvTrack) {
							$encodedPoints = serialize($osvTrack);
							if ($schema->tablesExist('osv_sequence')) {	
								$app['db']->executeUpdate("UPDATE osv_sequence SET track = :track WHERE id = :sequence_id", 
								array('sequence_id' => $this->id, 'track' => $encodedPoints));
							}
						}
					}
				}
			}
			return true;
		}
		
		private function updateMatchTrack(Application $app, $sequenceId =null, $matchTrack =null){
			if($sequenceId && $sequenceId !== $this->id) $this->id = $sequenceId;
			if($matchTrack && $matchTrack !== $this->matchTrack) $this->matchTrack = $matchTrack;
			$schema = $app['db']->getSchemaManager();
			if ($schema->tablesExist('osv_sequence')) {
				$encodedPoints = serialize($this->matchTrack);
				$app['db']->executeUpdate("UPDATE osv_sequence SET match_track = :match_track WHERE id = :sequence_id", 
								array('sequence_id' => $this->id, 'match_track' => $encodedPoints));
			}
			return true;
		}

		public function delete(Application $app, $sequenceId){
			$schema = $app['db']->getSchemaManager();
			if ($schema->tablesExist('osv_sequence')) {	
				$app['db']->executeUpdate("UPDATE osv_sequence "
						. "SET status = :status WHERE id = :sequence_id", array('sequence_id' => $sequenceId, 'status' => 'deleted'));
				$this->removeMatchedValues($app, $sequenceId);
				return true;	
			}
			
			return false;
		}
		 
		public function restore(Application $app, $sequenceId){
			$schema = $app['db']->getSchemaManager();
			if ($schema->tablesExist('osv_sequence')) {	
				$app['db']->executeUpdate("UPDATE osv_sequence SET "
						. "status = :status WHERE id = :sequence_id", array('sequence_id' => $sequenceId, 'status' => 'active'));
				$this->matchRoute($app, $sequenceId);
				return true;	
			}
			
			return false;
		}
		
		public function setMetaData(Application $app, $value){
			if(isset($value) && !empty($value)){
				$this->metaData = $value;
				try{
					$path =  PATH_FILES_PHOTO;
					$currentDate = $app['db']->fetchAssoc("SELECT "
							. "YEAR(date_added) AS year,  "
							. "MONTH(date_added) AS month, "
							. "DAY(date_added) as day FROM osv_sequence WHERE id = :sequence_id ", 
									array('sequence_id' => $this->id));
					if(isset($currentDate) && isset($currentDate['year']) && isset($currentDate['month']) && isset($currentDate['day'])) {
						$path .= '/'.  implode('/', $currentDate);
					}
					if (!file_exists($path)) {
						mkdir($path, 0777, true);
					}
					$fileUpload= new UploadProvider($value, 'meta');
					$metaDataFilename = $fileUpload->upload($path, $this->id);
				}catch(Exception $e) {
					throw new Exception($e->getMessage(), 602); //the request has been processed but there are incidents 
				}
			}
			if(isset($metaDataFilename) && !empty($metaDataFilename)){
				$this->metaDataFilename = $metaDataFilename;
				$app['db']->executeUpdate("UPDATE osv_sequence "
						. "SET meta_data_filename = :meta_data_filename "
						. "WHERE id = :sequence_id", 
						array('sequence_id' => $this->id, 'meta_data_filename' => $this->metaDataFilename));
				return true;	
			}
			return;
		}
		public function exportMetaData(Application $app, $sequenceId){
			 $schema = $app['db']->getSchemaManager();
			 $this->setId($sequenceId);
			 $this->get($app);
			$zip = new ZipArchive();
			$path = $this->getFileLocation($app, $sequenceId);
			$filename = "$path/$sequenceId"."_export.zip";
			 if ($zip->open($filename, ZIPARCHIVE::CREATE )!==TRUE) {
				  exit("cannot open <$filename>\n");
			}
			if(file_exists("$path/$this->metaDataFilename")){
				$zip->addFile("$path/".  $this->metaDataFilename, $this->metaDataFilename);
			}
			$zip->close();
			return true;
		}
		
		public function updateImagesStatus(Application $app){
			$schema = $app['db']->getSchemaManager();
			
			if ($schema->tablesExist('osv_sequence')) {
				// update status
				$app['db']->executeUpdate(
					"UPDATE osv_sequence SET image_processing_status = :image_processing_status WHERE id = :sequence_id",
					array('sequence_id' => $this->id, 'image_processing_status' => $this->imagesStatus)
				);
				return true;	
			}
			return false;
		}
		
		public function updateSequenceInfo(Application $app, $sequenceId = null) {
			if($sequenceId) $this->id = $sequenceId; 
			// get gps track
			$gpsTrack = $this->getGpsTrack($app, $this->id);
			
			// get bbox
			$BBox = $this->getBBox($gpsTrack);
			
			// get distance
			$distance = $this->getTrackDistance($gpsTrack);
			
			// generate address
			$trackInfo = $app['db']->fetchAssoc(
				"SELECT current_lat, current_lng FROM osv_sequence WHERE id = :sequence_id",
				array('sequence_id' => $this->id)
			);
			$address = $this->getAddress($trackInfo['current_lat'], $trackInfo['current_lng'], $app);
			// update track info
			$app['db']->executeUpdate(
				"UPDATE osv_sequence 
					SET nw_lat = :nw_lat, nw_lng = :nw_lng, se_lat = :se_lat, se_lng = :se_lng, distance = :distance, address = :address 
					WHERE id = :sequence_id",			
						array(
							'nw_lat'		=> $BBox['nw']['lat'],
							'nw_lng'		=> $BBox['nw']['lng'],
							'se_lat'		=> $BBox['se']['lat'],
							'se_lng'		=> $BBox['se']['lng'],
							'distance'		=> $distance,
							'address'		=> $address,
							'sequence_id' 	=> $this->id
						)
					);
			$this->matchRoute($app, $this->id);
			return true;
		}
		
		
		// get sequence gps track
		public function getGpsTrack(Application $app, $sequenceId = null){
			$schema = $app['db']->getSchemaManager();
			if ($schema->tablesExist('osv_photos')) {
				$osvTrack = $app['db']->fetchAll(
					"SELECT lat, lng FROM osv_photos WHERE sequence_id = :sequence_id and status = 'active' ORDER BY sequence_index ASC",
					array( 'sequence_id' => $sequenceId )
				);
				if($osvTrack) {
					return $osvTrack;
				}		
			}
			
			return false;
		}
		
		// update sequence BBox
		public function updateBBox(Application $app, $sequenceId = null){
			if($sequenceId) $this->id = $sequenceId;
			
			$schema = $app['db']->getSchemaManager();
			if ($schema->tablesExist('osv_sequence')) {
				
				$gpsTrack = $this->getGpsTrack($app, $this->id);
				$BBox = $this->getBBox($gpsTrack);
				
				$app['db']->executeUpdate(
					
					"UPDATE osv_sequence 
					
					SET nw_lat = :nw_lat, nw_lng = :nw_lng, se_lat = :se_lat, se_lng = :se_lng 
					
					WHERE id = :sequence_id",			
					array(
						'nw_lat'		=> $BBox['nw']['lat'],
						'nw_lng'		=> $BBox['nw']['lng'],
						'se_lat'		=> $BBox['se']['lat'],
						'se_lng'		=> $BBox['se']['lng'],
						'sequence_id' 	=> $this->id
					)
				);
				
				return true;
				
			}
			
			return false;
		}
		
		// get sequence BBox
		public function getBBox($points) {
			$first = array_shift($points);
			if ($first == false) {
				return false;
			}
			$lat_min = $this->getPoint($first, 'lat', 0.0);
			$lat_max = $lat_min;
			$lng_min = $this->getPoint($first, 'lng', 0.0);
			$lng_max = $lng_min;
		 
			foreach($points as $c) {
				$lat = $this->getPoint($c, 'lat', 0.0);
				$lng = $this->getPoint($c, 'lng', 0.0);
				$lat_min = min($lat_min, $lat);
				$lat_max = max($lat_max, $lat);
				$lng_min = min($lng_min, $lng);
				$lng_max = max($lng_max, $lng);
			}
		 
			$bbox = array(
		        'nw' => array('lat' => $lat_max, 'lng' => $lng_min),
		        'se' => array('lat' => $lat_min, 'lng' => $lng_max)
			);
			
			return $bbox;
		}
		
		private function getPoint($arr, $key, $default = false) {
			if(isset($arr[$key])) {
				return $arr[$key];
			}
			return $default;
		}
		
		// update sequence distance
		public function updateTrackDistance(Application $app, $sequenceId = null){
			if($sequenceId) $this->id = $sequenceId;
			$schema = $app['db']->getSchemaManager();
			if ($schema->tablesExist('osv_sequence')) {
				$gpsTrack = $this->getGpsTrack($app, $this->id);
				$distance = $this->getTrackDistance($gpsTrack);
				$app['db']->executeUpdate(		
					"UPDATE osv_sequence SET distance = :distance  WHERE id = :sequence_id",			
					array(
						'distance'		=> $distance,
						'sequence_id' 	=> $this->id
					)
				);
				return true;
			}
			return false;
		}
		
		// get sequence distance
		public function getTrackDistance($points) {
			if(count($points)>=2) {
				$lastPoint = null;
				$distance = null;
				foreach($points as $point) {
					if(!is_numeric($point['lat']) or !is_numeric($point['lng'])) continue;
					if(empty($lastPoint)) { $lastPoint = $point; continue; }
					if($lastPoint['lat'] == $point['lat'] and $lastPoint['lng'] == $point['lng']) continue;
					$distance += $this->getDistance($lastPoint['lat'], $lastPoint['lng'], $point['lat'], $point['lng'], 'K');
					$lastPoint = $point;
				}
				return round($distance, 2);
			}
			return null;
		}
		
		private function getDistance($lat1, $lng1, $lat2, $lng2, $unit = 'K') {
			$theta = $lng1 - $lng2;
			$dist = sin(deg2rad($lat1)) * sin(deg2rad($lat2)) +  cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * cos(deg2rad($theta));
			$dist = acos($dist);
			$dist = rad2deg($dist);
			$miles = $dist * 60 * 1.1515;
			$unit = strtoupper($unit);
			if ($unit == "K") {
				return ($miles * 1.609344);
			} else if ($unit == "N") {
				return ($miles * 0.8684);
			} else {
				return $miles;
			}
		}
		
		// get sequence address
		public function getAddress($lat, $lng, $app) {
			$address = null;
			$addressDetails = $this->getAddressDetails($lat, $lng, $app);
			if(isset($addressDetails['name']) && !empty($addressDetails['name'])) {
				$address = $addressDetails['name'];
			} else {
				if (isset($addressDetails['address']['street']) && !empty($addressDetails['address']['street'])) {
					$address .=  $addressDetails['address']['street'].', ';
				}
				if (isset($addressDetails['address']['citysector']) && !empty($addressDetails['address']['citysector'])) {
					$address .=  $addressDetails['address']['citysector'].', ';
				}
				if (isset($addressDetails['address']['city']) && !empty($addressDetails['address']['city'])) {
					$address .=  $addressDetails['address']['city'].', ';
				}
				if (isset($addressDetails['address']['country']) && !empty($addressDetails['address']['country'])) {
					$address .=  $addressDetails['address']['country'].', ';
				} elseif (isset($addressDetails['address']['cc']) && !empty($addressDetails['address']['cc'])) {
					$address .=  Intl::getRegionBundle()->getCountryName($osvSequenceTrack['address']['cc']).', ';
				}
				$address = substr($address, 0, -2);
			}
			return $address;
		}
		
		public function getAddressDetails($lat = null, $lng = null, Application $app = null){
			if (isset ($lat) && !empty($lat) && isset($lng) && !empty($lng)) {
				$params = array( 'search_center' => $lat .',' . $lng );
				$url = str_replace('{METHOD}', 'reversegeocoding', $app['config.NBService']);
				$query = http_build_query($params, '_', '&');
				$query = str_replace('+', '%20', $query);//spaces will be percent encoded
				$defaults = array(
					CURLOPT_HEADER => 0,
					CURLOPT_URL => $url . '?' .$query, 
					CURLOPT_FRESH_CONNECT => 1,
					CURLOPT_RETURNTRANSFER => 1,
					CURLOPT_FORBID_REUSE => 1,
					CURLOPT_TIMEOUT => 4
				);
				$curlSession = curl_init();
				curl_setopt_array($curlSession, $defaults);
				$result = curl_exec($curlSession);
				curl_close($curlSession);
				$response = json_decode($result, true);
				if ($response['status']['apiCode'] == 600) { //Request ok.
					$firstResult = array_pop($response['places']);
					return $firstResult;
				}
			}
			return null;
		}
		public function matchRouteOld(Application $app, $sequenceId = null){
			$schema = $app['db']->getSchemaManager();
			$this->get($app, $sequenceId);
			//remove old Matched values
			$this->removeMatchedValues($app, $sequenceId);
			$matchedInputArray = array();
			if(count($this->track)) {
				$sql = "SELECT id, lat, lng as lon FROM osv_photos WHERE status = 'active'  and sequence_id =  :sequence_id ORDER BY sequence_index ASC";
				if ($schema->tablesExist('osv_photos')) {
					$matchedInputArray = $app['db']->fetchAll($sql, array( 'sequence_id' => $sequenceId));
				}
				$urlCode = 'na';
				$matchedInput = json_encode($matchedInputArray, JSON_NUMERIC_CHECK);
				if( -25 < $matchedInputArray[0]['lon'] && $matchedInputArray[0]['lon'] < 70 &&  
					35 < $matchedInputArray[0]['lat'] &&  $matchedInputArray[0]['lat']< 80){
					$urlCode = 'eu';
				}
				if ($matchedOutputArray = $this->matcher($app, $urlCode, $matchedInput)) {
					$matchTrack = array();
					foreach($matchedOutputArray as $match){
						if(isset($match['segment_id']) && $match['segment_id'] != 0){
							foreach($match['points'] as $matchPoint) {
								$updatePhotoSql = "UPDATE osv_photos SET "
										. " match_lat = :match_lat, "
										. " match_lng =:match_lng, "
										. " match_segment_id = :match_segment_id "
										. " WHERE id =:photo_id ";
								$updateArray = array(
									'match_lat' => $matchPoint['lat'],
									'match_lng' => $matchPoint['lon'],
									'match_segment_id' => $match['segment_id'],
									'photo_id' => $matchedInputArray[$matchPoint['initial_index']]['id']
								);
								$app['db']->executeUpdate($updatePhotoSql, $updateArray);
								array_push($matchTrack, array('lat'=>$matchPoint['lat'], 'lng'=>$matchPoint['lon']));
							}
						}
						$this->addMatchedValues($app, $sequenceId, $match['segment_id']);
					}//end foreach
					$this->updateMatchTrack($app, $sequenceId, $matchTrack);
				}//end if(count($matchedOutputArray)	
			}
		}

		public function matchRoute(Application $app, $sequenceId = null){
			$projectFilePath = PATH_FILES_PHOTO;
			try {
				$conn = $app['db'];
				// set the PDO error mode to exception	
				$sql = "SELECT * FROM osv_sequence WHERE 
						status = 'active' and count_active_photos > 1 and  
						image_processing_status IN ('UPLOAD_FINISHED','PROCESSING_FINISHED','PROCESSING_FAILED')  
						AND id = ".$sequenceId;
				$sql .= " ORDER BY id ASC";
				$result = $conn->query($sql);
				$notMatched = 0;
				if ($result->rowCount()) {
					$thCount = 0 ;
					foreach ($result as $row) {
						$this->resetData($conn, $row['id']);
						$sql = "SELECT id, lat, lng as lon FROM osv_photos WHERE status = 'active'  and sequence_id = ".$row['id']." ORDER BY sequence_index ASC";
						$resultPhotos = $conn->query($sql);
						$data_coord_array = array();
						$matched = "no";
						if($resultPhotos->rowCount()) {
							$data_coord_array = $resultPhotos->fetchAll();
							$data_json = json_encode($data_coord_array, JSON_NUMERIC_CHECK);
							if( -25 < $data_coord_array[0]['lon'] && $data_coord_array[0]['lon'] < 70 &&  35 < $data_coord_array[0]['lat'] &&  $data_coord_array[0]['lat']< 80){
								$urlCode = 'eu';
							} else {
								$urlCode = 'na';
							}
							$url = str_replace('{AREA}',$urlCode, $app['config.MRService']);
							$ch = curl_init();
							curl_setopt($ch, CURLOPT_URL, $url);
							curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
							curl_setopt($ch, CURLOPT_POST, 1);
							curl_setopt($ch, CURLOPT_POSTFIELDS,$data_json);
							curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
							$response  = curl_exec($ch);
							curl_close($ch);
							$response_array  = json_decode($response, true);
							if($response_array && !(isset($response_array['status']) && $response_array['status'] != 'Error')) {
								if(count($response_array)) {
									$segmentCount = 0;
									$photos = array();
									$matched = "yes";
									foreach ($response_array as $match) {
										$from = isset($match['from_node_id'])?$match['from_node_id']:false;
										$to = isset($match['to_node_id'])?$match['to_node_id']:false;
										$wayId = isset($match['segment_id'])?$match['segment_id']:false;
										$sequenceId = $row['id'];
										$index = $segmentCount;

										if (!$from || !$to || !$wayId || !$sequenceId || !isset($match['points'])) {
											continue;
										}
										$geometry = isset($match['segment_geometry'])?$match['segment_geometry']:false;
										if ($from >= $to) {
											$int = $to;
											$to = $from;
											$from = $int;
										}
										$sql = "SELECT os.from, os.to, os.way_id FROM osv_segments os WHERE os.from = $from AND os.to = $to AND os.way_id = $wayId  limit 1";
										$segmentResultOne = $conn->query($sql);
										if (!$segmentResultOne->rowCount()) {
											$this->updateSegment($conn, $geometry, $from, $to, $wayId, $match['segment_length']);
										}
										if ($geometry) {
											$this->updateGeometry($conn, $geometry, $from, $to, $wayId);
										}
										
										if ($segmentCount > 0 && $segmentCount < count($response_array) &&  count($response_array) > 1) {
											$startOffset = 0;
											$endOffset = 1;
										} else if ($segmentCount == 0 && count($response_array) > 1) {
											$startOffset = $match['points'][0]['match_offset'];
											$endOffset = 1;
										} else if (($segmentCount == count($response_array) - 1) && count($response_array) > 1){
											$startOffset = 0;
											$endOffset = $match['points'][count($match['points']) - 1]['match_offset'];
										} else {
											$startOffset = $match['points'][0]['match_offset'];
											$endOffset = $match['points'][count($match['points']) - 1]['match_offset'];
										}
										$sql = "insert into osv_sequence_segment (osv_sequence_segment.from, osv_sequence_segment.to, osv_sequence_segment.way_id, osv_sequence_segment.sequence_id, osv_sequence_segment.index, osv_sequence_segment.start_offset, osv_sequence_segment.end_offset) values ";
										$sql .= "(".$from.", ".$to.", ".$wayId.", ".$row['id'].", ".$segmentCount.", ".$startOffset.", ".$endOffset.")";
										$result = $conn->query($sql);
										foreach($match['points'] as $point) {
											$photo = isset($data_coord_array[$point['initial_index']])?$data_coord_array[$point['initial_index']]:false;
											if ($photo) {
												$this->updatePhotos($conn, $photo, $point, $from, $to, $wayId);
											}
										}
										$segmentCount++;
									}
									
								}
							}
						}
						$sql = "update osv_sequence set osv_sequence.matched = '$matched' where osv_sequence.id = ".$row['id'];
						$conn->query($sql);
					}
				}
			} catch(PDOException $e) {
				logX( "Connection failed: " . $e->getMessage());
			}
		}
		
		public function matchRoutePhotosByWayId(Application $app, $sequenceId, $wayId){
			$this->get($app, $sequenceId);
			$schema = $app['db']->getSchemaManager();
			$sequenceDateArray = split(' ', $this->dateAdded); 
			$path = PATH_FILES_PHOTO."/". str_replace('/0', '/', str_replace('-', '/', $sequenceDateArray[0]));
			$nameSql = " CONCAT('$path/ori/', name)  AS name ";
			$thNameSql = " CONCAT('$path/th/', name)  AS th_name";
			$lthNameSql = " CONCAT('$path/lth/', name)  AS lth_name";
			
			$photoInfo = "OSV_P.id, 
				OSV_P.sequence_id, 
				OSV_P.sequence_index,
				OSV_P.lat, 
				OSV_P.lng,
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
			
			$sql = "SELECT $photoInfo "
					. " FROM osv_photos AS OSV_P "
					. " WHERE OSV_P.sequence_id = :sequence_id  AND OSV_P.match_segment_id = :match_segment_id ";

			if ($schema->tablesExist('osv_photos')) {
				$osvPhotos = $app['db']->fetchAll($sql, array( 'sequence_id' => $sequenceId,  'match_segment_id' => $wayId));
				return $osvPhotos;
			}			
			return FALSE;
		}
		
		/*
		 * cals for external service MatchServer
		 * 
		 *     @param string $matchedInput String in json format containing lat lon pairs as expected by the match server
		 *     @param string $code eu|na
		 *   
		 *     @return string 
		 */
		private function matcher(Application $app, $code, $matchedInput = 'eu'){
			$url = str_replace('{AREA}',$code, $app['config.MRService']);
			$ch = curl_init();
			curl_setopt($ch, CURLOPT_URL, $url);
			curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
			curl_setopt($ch, CURLOPT_POST, 1);
			curl_setopt($ch, CURLOPT_POSTFIELDS,$matchedInput);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
			$matchedOutput  = curl_exec($ch);
			curl_close($ch);
			$matchedOutputArray = json_decode($matchedOutput, true);
			$trackNoMatchingOccurrences =  substr_count($matchedOutput, "unmatched"); 
			if( $trackNoMatchingOccurrences== 0   //only complete matched tracks are recorded
					&& !(isset($matchedOutputArray['status']) && $matchedOutputArray['status'] != 'Error')){
				 if(count($matchedOutputArray)) { //it may happen to receive an empty response
					return  $matchedOutputArray;
				 }
			}
			return FALSE;
		}

		private function removeMatchedValues(Application $app, $sequenceId = null){
			if($sequenceId && $sequenceId !== $this->id) $this->id = $sequenceId; 
			$schema = $app['db']->getSchemaManager();
			if ($schema->tablesExist('osv_sequence_segments')) {	
				$app['db']->delete('osv_sequence_segments', array('sequence_id' => $this->id));
			}
			return false;
		}
		private function addMatchedValues(Application $app, $sequenceId = null, $matchSegmentId){
			if($sequenceId && $sequenceId !== $this->id) $this->id = $sequenceId; 
			$schema = $app['db']->getSchemaManager();
			if ($schema->tablesExist('osv_sequence_segments')) {
				$matchExists = $app['db']->fetchAssoc("SELECT COUNT(*) as no FROM osv_sequence_segments 
										WHERE sequence_id = :sequence_id AND match_segment_id = :match_segment_id", 
										array('sequence_id' => $this->id, 'match_segment_id' => $matchSegmentId));
				
				if(!$matchExists['no']){
					$result = $app['db']->insert("osv_sequence_segments", 
						array('sequence_id' => $this->id, 'match_segment_id' => $matchSegmentId));
					if($result) return true;
				}
			}
			return false;
		}
		private function getFileLocation(Application $app, $sequenceId = null){
			if(isset($sequenceId) && !empty($sequenceId)) {
				$this->sequenceId = $sequenceId;
			}
			$path = PATH_FILES_PHOTO;
			try{
				$currentDate = $app['db']->fetchAssoc("SELECT "
						. " YEAR(date_added) AS year, "
						. " MONTH(date_added) AS month, "
						. " DAY(date_added) as day "
						. " FROM osv_sequence WHERE id = :sequence_id ", 
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


		private function updateGeometry($conn, $geometry, $from, $to, $way_id) {
			$sql = "insert into osv_geometry (osv_geometry.from, osv_geometry.to, osv_geometry.way_id, osv_geometry.index, osv_geometry.lat, osv_geometry.lng) values ";
			$values = [];
			$index = 0;
			foreach ($geometry as $point) {
				$values[] = "(".$from.", ".$to.", ".$way_id.", ".$index.", ".$point['lat'].", ".$point['lon'].")";
				$index++;
			}
			$sql .= implode(',', $values);
			$result = $conn->query($sql);
		}

		private function updateSegment($conn, $geometry, $from, $to, $way_id, $length) {
			$lats = [];
			$lngs = [];
			foreach ($geometry as $point) {
				$lats[] = $point['lat'];
				$lngs[] = $point['lon'];
			}
			$nwLat = min($lats);
			$nwLng = max($lngs);
			$seLat = max($lats);
			$seLng = min($lngs);
			$sql = "insert into osv_segments (osv_segments.from, osv_segments.to, osv_segments.way_id, osv_segments.nw_lat, osv_segments.nw_lng, osv_segments.se_lat, osv_segments.se_lng, osv_segments.length) values ";
			$sql .= "(".$from.", ".$to.", ".$way_id.", ".$nwLat.", ".$nwLng.", ".$seLat.", ".$seLng.", ".$length.")";
			$result = $conn->query($sql);
		}

		private function updatePhotos($conn, $photo, $point, $from, $to, $way_id) {
			$sql = "update osv_photos set osv_photos.from = $from, osv_photos.to = $to, osv_photos.way_id = $way_id, osv_photos.match_lat = ".$point['lat'].", osv_photos.match_lng=".$point['lon']." where osv_photos.id = ".$photo['id'];
			$result = $conn->query($sql);
		}

		private function resetData($conn, $sequenceId)
		{
			$sqlRemovePhotosData = "UPDATE `osv_photos` SET match_lat = NULL, match_lng = NULL, match_segment_id = NULL WHERE sequence_id = ".$sequenceId;
			$result = $conn->query($sqlRemovePhotosData);
			$sqlRemoveSequenceData = "UPDATE `osv_sequence` ssSET matched = NULL WHERE id = ".$sequenceId;
			$result = $conn->query($sqlRemoveSequenceData);
			$sql = "DELETE FROM osv_sequence_segment WHERE sequence_id = ".$sequenceId;
			$conn->query($sql);
			$sql = "DELETE osv_geometry FROM osv_geometry LEFT JOIN osv_sequence_segment AS os ON osv_geometry.from = os.from AND osv_geometry.to = os.to AND osv_geometry.way_id = os.way_id WHERE os.sequence_id = ".$sequenceId;
			$conn->query($sql);
			$sql = "DELETE osv_segments FROM osv_segments LEFT JOIN osv_sequence_segment AS os ON osv_segments.from = os.from AND osv_segments.to = os.to AND osv_segments.way_id = os.way_id WHERE os.sequence_id = ".$sequenceId;
			$conn->query($sql);
			$i = 0 ;
		}

		public function getTotalDistance(Application $app, $userId,  $sequenceId = null, $forObd = false)
		{
			$sql = "SELECT SUM(distance) AS distance FROM osv_sequence WHERE user_id = :userId";
			$parameters = array();
			$parameters['userId'] = $userId;
			$where = "";
			if ($sequenceId) {
				$where .= " AND sequence_id = :sequenceId ";
				$parameters['sequence_id'] = $sequenceId;
			}
			if ($forObd) {
				$where .= " AND obd_info = 1 ";
			}
			$sql .= $where." GROUP BY user_id";
			$result = $app['db']->fetchAll($sql, $parameters);
			return $result?$result[0]['distance']:0;
		}

	}