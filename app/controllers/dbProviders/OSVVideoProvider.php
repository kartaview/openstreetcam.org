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

	//use app\validators\IsLatitude;

	class OSVVideoProvider{
		
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
		private $video = null;
		/**
		 * @var string|null
		 */
		public $videoName = null;
		
		/**
		 * @var string|null
		 */
		private $processingStatus = null;
		
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
		}	
		
		public function setId($value){
			if(isset($value) && !empty($value)){
				$this->id = $value;
			}
			return;
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
		public function setProcessingStatus($value){
			if(isset($value) && !empty($value)){
				$this->processingStatus = $value;
			}
			return;
		}
		public function getSequenceIndex(){
			return $this->sequenceIndex;
		}
		public function getProcessingStatus(){
			return $this->processingStatus;
		}
		public function getVideoName(){
			return $this->videoName;
		}
		
		public function setVideo(Application $app, $value){
			if(isset($value) && !empty($value)){
				$this->video = $value;
				try{
					$path = $this->getFileLocation($app);
					$video = new UploadProvider($value, 'video');
					$videoName = $video->upload($path, $this->sequenceId);
				}catch(Exception $e) {
					throw new Exception($e->getMessage(), 602); //the request has been processed but there are incidents 
				}
			}
			if(isset($videoName) && !empty($videoName)){
				$this->videoName = $videoName;
			}
			return;
		}	
		public function add(Application $app){
			$schema = $app['db']->getSchemaManager();
			if ($schema->tablesExist('osv_videos')) {	
				$result = $app['db']->insert('osv_videos', array(
				  'sequence_id' 		=> $this->sequenceId,
				  'sequence_index' 		=> $this->sequenceIndex,
				  'name'			=> $this->videoName
				));
				if($result) {
					$this->id= $app['db']->lastInsertId('osv_videos');
					return $this->id;
				}
			}
			return false;
		}
		public function update(Application $app, $videoId =null,  $processingStatus = null){
			$schema = $app['db']->getSchemaManager();
			if($videoId) $this->setId($videoId); 
			if($processingStatus) $this->setProcessingStatus($processingStatus); 
			
			$updateSql = "UPDATE osv_videos SET ";
			$updateArray = array();
			$updateSqlArray = array();
			if(isset($this->processingStatus )&& !is_null($this->processingStatus) && !empty($this->processingStatus)) {
				$updateSqlArray[] =  "processing_status = :processing_status ";
				$updateArray['processing_status'] = $this->processingStatus;
			}
			if(count($updateArray)) {
				$updateSql .= implode(', ', $updateSqlArray)." WHERE id = :video_id";
				$updateArray['video_id'] = $this->id;
				if ($schema->tablesExist('osv_videos')){
					$app['db']->executeUpdate($updateSql,$updateArray);
					return $this->get($app);
				}
			}
			return FALSE;
		}
		/*
		* get open street view video  properties if the Id is not null
		*/
		public function get(Application $app, $osvVideoId = null, $status = 'active'){
			if($osvVideoId) $this->id = $osvVideoId; 
			$schema = $app['db']->getSchemaManager();
			if ($schema->tablesExist('osv_videos')) {	
				$osvVideo = $app['db']->fetchAssoc("SELECT *,   DATE_FORMAT(date_added, '%Y-%m-%d % (%H:%i)') AS date_added_f FROM osv_videos
												WHERE id = :id  AND status = '$status'", 
												array(
												 	'id' => $this->id
												));
				if($osvVideo) {
					$this->sequenceId = $osvVideo['sequence_id'];
					$this->sequenceIndex = $osvVideo['sequence_index'];
					$this->videoName = $osvVideo['name'];
					$this->dateAdded = $osvVideo['date_added_f'];
					return $this;
				}		
			}
			return false;
		}
		/*
		* searches if a certain video index is added to a sequence
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
			if ($schema->tablesExist('osv_videos')) {	
				$countIndex = $app['db']->fetchColumn("SELECT COUNT(id) as countIndex FROM osv_videos  $whereSql", $parameters);
				return $countIndex;
			}
			return false;
		}
		public function getSequence(Application $app, $sequenceId, $status = true){
			$schema = $app['db']->getSchemaManager();
			if ($schema->tablesExist('osv_videos')) {
				$fileLocation  = $this->getFileLocation($app, $sequenceId);
				$nameSql = " CONCAT('$fileLocation/video/', name)  AS name ";
				$statusSQL = $status ? "AND status='active'" : '';
				$osvVideos = $app['db']->fetchAll("SELECT id, sequence_id,  sequence_index, $nameSql, 
											DATE_FORMAT(date_added, '%Y-%m-%d % (%H:%i)') AS date_added_f  
									     FROM osv_videos
									     WHERE sequence_id = :sequence_id $statusSQL
									     ORDER BY sequence_index ASC", 
											array( 'sequence_id' => $sequenceId ));
				if($osvVideos) {
					return $osvVideos;
				}		
			}
			return false;
		} 
	 	
		public function deleteSequenceVideos(Application $app, $sequenceId){
			$schema = $app['db']->getSchemaManager();
			$sequenceVideos = $this->getSequence($app, $sequenceId, true, false);
			$path = $this->getFileLocation($app, $sequenceId);
			if( $sequenceVideos && count($sequenceVideos) > 0) {
				foreach ($sequenceVideos as $video) {
					$this->deleteFile($video['name'], $path);
				}
			}
			if ($schema->tablesExist('osv_videos')) {	
				$app['db']->executeUpdate("UPDATE osv_videos SET status = :status "
						. "WHERE sequence_id = :sequence_id", array('sequence_id' => $sequenceId, "status" => 'deleted'));
			}
			return true;
		}
		public function restoreSequenceVideos(Application $app, $sequenceId){
			$schema = $app['db']->getSchemaManager();
			$sequenceVideos = $this->getSequence($app, $sequenceId, false);
			$path = $this->getFileLocation($app, $sequenceId);
			if( $sequenceVideos && count($sequenceVideos) > 0) {
				foreach ($sequenceVideos as $video) {
					$this->restoreFile($video['name'], $path);
				}
			}
			if ($schema->tablesExist('osv_videos')) {	
				$app['db']->executeUpdate("UPDATE osv_videos SET status = :status "
						. "WHERE sequence_id = :sequence_id", array('sequence_id' => $sequenceId, "status" => 'active'));
			}
			return true;
		} 
		
		public function delete(Application $app, $osvVideoId){
			$schema = $app['db']->getSchemaManager();
			if ($schema->tablesExist('osv_videos')) {
				$this->get($app, $osvVideoId);
				$path = $this->getFileLocation($app, $this->sequenceId);
				$this->deleteFile(null, $path);
				$osvPhotos = $app['db']->executeUpdate('UPDATE osv_videos SET status = :status '
						. 'WHERE id = :video_id', array("video_id" => $osvVideoId, "status" => 'deleted'));
			}
			return false;
		} 
		public function restore(Application $app, $osvVideoId){
			$schema = $app['db']->getSchemaManager();
			if ($schema->tablesExist('osv_videos')) {
				$this->get($app, $osvVideoId, 'deleted');
				$path = $this->getFileLocation($app, $this->sequenceId);
				$this->restoreFile(null, $path);
				$osvPhotos = $app['db']->executeUpdate('UPDATE osv_videos SET status = :status '
						. 'WHERE id = :video_id', array("video_id" => $osvVideoId, "status" => 'active'));
			}
			return false;
		} 
		private function deleteFile($filename = null, $path = null){
			if(isset($filename) && !empty($filename)) {
				$this->videoName = basename($filename);
			}
			$path = $path == null ? PATH_FILES_PHOTO : $path;
			try{
				@rename($path. "/video/". $this->videoName, $path. "/del/video/". $this->videoName);	
			} catch (Exception $e) {
				error_log($e->getMessage());
			}
			return true;
		}
		private function restoreFile($filename = null, $path = null){
			if(isset($filename) && !empty($filename)) {
				$this->videoName = basename($filename);
			}
			$path = $path == null ? PATH_FILES_PHOTO : $path;
			try{
				@rename( $path. "/del/video/". $this->videoName, $path. "/video/". $this->videoName);	
			} catch (Exception $e) {
				error_log($e->getMessage());
			}
			return true;
		}
		public function getFileLocation(Application $app, $sequenceId = null){
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
					if (!file_exists($path.'/video')) {
						mkdir($path.'/video', 0777, true);
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
					if (!file_exists($path.'/del/video')) {
						mkdir($path.'/del/video', 0777, true);
					}
				}
			} catch (Exception $e) {
				error_log($e->getMessage());
			}
			return $path;
		} 
	}