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


	class UserProvider{
	    const ROLE_USER = 'ROLE_USER';
    	const ROLE_SUPER_ADMIN = 'ROLE_SUPER_ADMIN';
		/**
		*@var int
		*/
		public $id;
		/**
		 * @var string|null
		 */
		public $type = null;
		/**
		 * @var int|null
		 */
		public $externalUserId = null;
		/**
		 * @var string|null
		 */
		public $username = null;
		/**
		 * @var string|null
		 */
		public $email = null;

		public $role = null;
		/**
		 * @var string|null
		 */
		public $status = null;
			
		static public function loadValidatorMetadata(ClassMetadata $metadata) {
			//$metadata->addPropertyConstraint('id', new Assert\Type(array('type' => 'numeric', 'message'=> API_CODE_INVALID_ARGUMENT)));
			$metadata->addPropertyConstraint('externalUserId', new Assert\NotBlank(array('message' => API_CODE_MISSING_ARGUMENT)));
			$metadata->addPropertyConstraint('externalUserId', new Assert\Type(array('type' => 'numeric', 'message'=> API_CODE_INVALID_ARGUMENT)));
			$metadata->addPropertyConstraint('externalUserId', new Assert\Range(array('min' => 0, 'max' => 10000000000, 'minMessage' => API_CODE_OUT_OF_RANGE_ARGUMENT, 'maxMessage' => API_CODE_OUT_OF_RANGE_ARGUMENT)));
			$metadata->addPropertyConstraint('type', new Assert\NotBlank(array('message' => API_CODE_MISSING_ARGUMENT)));
			$metadata->addPropertyConstraint('type', new Assert\Choice(array('choices' => array('osm', 'anonymous'), 'message' => API_CODE_INVALID_ARGUMENT)));
			$metadata->addPropertyConstraint('username', new Assert\NotBlank(array('message' => API_CODE_MISSING_ARGUMENT)));
			$metadata->addPropertyConstraint('username', new Assert\Type(array('type' => 'string', 'message' => API_CODE_INVALID_ARGUMENT)));
			$metadata->addPropertyConstraint('username', new Assert\Length(array('max' => '65', 'maxMessage' => API_CODE_OUT_OF_RANGE_ARGUMENT. "[65]")));
		}

		public function setId($value = null){
			if(isset($value) && !empty($value)){
				$this->id = $value;
			}
			return true;
		}

		public function setType($value = null){
			if(isset($value) && !empty($value)){
				$this->type = $value;
			}
			return true;
		}
		
		public function setExternalUserId($value = null){
			if(isset($value) && !empty($value)){
				$this->externalUserId  = $value;
			}
			return true;
		}
		
		public function setUsername($value = null){
			//TBD: check if this is a real osm user account
			if(isset($value) && !empty($value)){
				$this->username  = $value;
			} 
			return true;
		}

		public function setRole($value) {
			if(isset($value) && !empty($value)){
				$this->role  = $value;
			} 
		}
		
		public function setStatus($value = null){
			if(isset($value) && !empty($value)){
				$this->status  = $value;
			} 
			return true;
		}
		public function setEmail($value = null){
			if(isset($value) && !empty($value)){
				$this->email  = $value;
			} 
			return true;
		}
		public function getId(){
			return $this->id;
		}

		public function getType(){
			return $this->type;
		}
		
		public function getExternalUserId(){
			return $this->externalUserId;
		}
		
		public function getUsername(){
			return $this->username;
		}
		public function getStatus(){
			return $this->status;
		}
		public function getEmail(){
			return $this->email;
		}
		public function isLogged(){
			return !empty($this->id) ? true : false;
		}
		
		public function add(Application $app){
			$schema = $app['db']->getSchemaManager();
			if ($schema->tablesExist('osv_users')) {	
				if($this->exists($app)) return $this->id;
				$result = $app['db']->insert('osv_users', array(
				  'external_user_id' => $this->externalUserId,
				  'type' => $this->type,
				  'username' => $this->username,
				  'role' => $this->role?$this->role:self::ROLE_USER
				));
				if($result) {
					$this->id = $app['db']->lastInsertId('osv_users');
					$this->status = 'active';
					return $this->id;
				}
			}
			return false;
		}
		
		/*
		* get user properties if the Id is not null
		*/
		public function get(Application $app, $userId = null){
			if($userId) $this->setId($userId); 
			$schema = $app['db']->getSchemaManager();
			if ($schema->tablesExist('osv_users')) {	
				$user = $app['db']->fetchAssoc(
					"SELECT external_user_id, type, IF(FU.username <> '', FU.username, 'Anonymous') AS username, "
						. "status, role, email FROM osv_users  AS FU WHERE id = :id",
					array(
					 	'id' => $this->getId()
					)
				);
				if($user) {
					$this->externalUserId = $user['external_user_id'];
					$this->type = $user['type'];
					$this->username = $user['username'];
					$this->status = $user['status'];
					$this->role = $user['role'];
					$this->email = $user['email'];
					return $this;
				}		
			}
			return false;
		}

		/*
		* get user properties if the Id is not null
		*/
		public function getByUsername(Application $app, $username = null){
			$schema = $app['db']->getSchemaManager();
			if ($schema->tablesExist('osv_users')) {	
				$user = $app['db']->fetchAssoc(
					"SELECT id, external_user_id, type, IF(FU.username <> '', FU.username, 'Anonymous') AS username, "
						. "role, email FROM osv_users  AS FU WHERE username = :username", 
					array(
					 	'username' => $username
					)
				);
				if($user) {
					$this->id = $user['id'];
					$this->externalUserId = $user['external_user_id'];
					$this->type = $user['type'];
					$this->username = $user['username'];
					$this->role = $user['role'];
					$this->email = $user['email'];
					return $this;
				}		
			}
			return false;
		}
		public function delete(Application $app, $userId = null){
			if($userId) $this->setId($userId); 
			$this->get($app);
			$this->updateStatus($app, $this->externalUserId, $this->type, 'deleted' );
			return false;
		}
		public function restore(Application $app, $userId = null){
			if($userId) $this->setId($userId); 
			$this->get($app);
			$this->updateStatus($app, $this->externalUserId, $this->type, 'active' );
			return false;
		}
		/*
		* get user properties if the Id is not null
		*/
		public function updateStatus(Application $app, $externalUserId = null, $userType =null,  $status = 'active'){
			if( !empty($externalUserId)) {
				$this->setExternalUserId($externalUserId);
			}
			if( !empty($userType)) {
				$this->setType($userType);
			}
			if( !empty($userName)) {
				$this->setUsername($userName);
			}
			if( !empty($status)) {
				$this->setStatus($status);
			}
			$schema = $app['db']->getSchemaManager();
		
			if ($schema->tablesExist('osv_users')) {
				$app['db']->executeUpdate(
					"UPDATE osv_users SET status = :status WHERE external_user_id = :external_user_id AND type = :type", 
					array(
						'external_user_id' => $this->externalUserId,
						'type' => $this->type, 
						'status' => $this->status
					)
				);
			}
			return true;
		}
		
		public function updateEmail(Application $app, $externalUserId = null, $userType = null,  $email = null){
			if( !empty($externalUserId)) {
				$this->setExternalUserId($externalUserId);
			}
			if( !empty($userType)) {
				$this->setType($userType);
			}
			if( !empty($email)) {
				$this->setEmail($email);
			}
			 
			$schema = $app['db']->getSchemaManager();
		
			if ($schema->tablesExist('osv_users')) {
				$app['db']->executeUpdate(
					"UPDATE osv_users SET email = :email WHERE external_user_id = :external_user_id AND type = :type", 
					array(
						'external_user_id' => $this->externalUserId,
						'type' => $this->type, 
						'email' => $this->email
					)
				);
			}
			return true;
		}
		public function collectEmail(Application $app, $externalUserId = null, $userType = null){
			if( !empty($externalUserId)) {
				$this->setExternalUserId($externalUserId);
			}
			if( !empty($userType)) {
				$this->setType($userType);
			}
			$schema = $app['db']->getSchemaManager();
			$user = $app['db']->fetchAssoc(
					"SELECT email,  ABS(DATEDIFF(email_date_request, NOW())) AS days, email_date_request "
					. "FROM osv_users  "
					. "WHERE external_user_id = :external_user_id AND type = :type",
					array(
					 	'external_user_id' => $externalUserId,
						'type' => $userType
					)
				);
				if($user) {
					if (is_null($user['email']) && ( $user['days'] >=7 || is_null($user['email_date_request']))){
						$app['db']->executeUpdate( "UPDATE osv_users SET "
								. "email_date_request = NOW() "
								. "WHERE external_user_id = :external_user_id AND type = :type", 
						array(
							'external_user_id' => $externalUserId,
							'type' => $userType
						));
						return true;
					}
				}		
			return false;
		}
		
		public function exists(Application $app, $externalUserId = null, $userType = null, $userName = null){
			if( !empty($externalUserId)) {
				$this->setExternalUserId($externalUserId);
			}
			if( !empty($userType)) {
				$this->setType($userType);
			}
			if( !empty($userName)) {
				$this->setUsername($userName);
			}
			
			$schema = $app['db']->getSchemaManager();
			if ($schema->tablesExist('osv_users')) {
				$user = $app['db']->fetchAssoc(
					"SELECT * FROM osv_users WHERE external_user_id = :external_user_id AND type = :type ", 
					array(
					 	'external_user_id' 	=> $this->externalUserId,
						'type'			=> $this->type
					)
				);
				if($user) {
					$this->setId($user['id']);
					$this->setExternalUserId($user['external_user_id']);
					$this->setStatus($user['status']);
					$this->setType($user['type']);
					$this->setUsername($user['username']);
					$this->setStatus($user['status']);
					$this->setEmail($user['email']);
					$this->role = $user['role'];
					//osmUser has changed it's username
					if( !empty($this->username) && $this->username != $user['username']) {
						$app['db']->executeUpdate(
							"UPDATE osv_users SET username = :username "
								. "WHERE external_user_id = :external_user_id AND type = :type", 
							array(
								'username' => $this->username,
								'external_user_id' => $this->externalUserId,
								'type' => $this->type
							)
						);
					}
					return true;
				}		
			}
			return false;
		}

		public function getUserPosition(Application $app) {
			$ip = $this->ipToNumber($_SERVER['REMOTE_ADDR']);
			
			if(!$ip) return false;
			
			$schema = $app['db']->getSchemaManager();
			
			$query = "SELECT * FROM osv_ip2location WHERE ip_from <= $ip AND ip_to >= $ip";
			if ($schema->tablesExist("osv_ip2location")) {
				$response = $app['db']->fetchAssoc($query);
			} else {
				return false;
			}
			
			if(isset($response['latitude']) and $response['latitude'] > 0) {
				return $response;
			} else {
				return false;
			}
		}
		public function leaderboard(Application $app, $startDate = null) {
			$schema = $app['db']->getSchemaManager();
			$queryParameters = array();
			$whereQuery = " WHERE OSV_U.status='active' AND  OSV_S.status = 'active' "; //user and sequences are not deleted
			$whereQuery .= " AND OSV_S.image_processing_status = 'PROCESSING_FINISHED' ";
			$whereQuery .= " AND OSV_S.distance IS NOT NULL";
			
			if(!empty($startDate)) {
				$whereQuery .=" AND OSV_S.date_added > (:start_date)";
				$queryParameters['start_date'] = $startDate;
			}
			$query = "SELECT OSV_U.id, OSV_U.username, "
					. " SUM(OSV_S.distance) as total_km, "
					. " SUM( IF(OSV_S.obd_info = '1', OSV_S.distance ,0)) as total_km_obd, "
					. " SUM(OSV_S.count_active_photos) AS total_photos, "
					. " COUNT(OSV_S.id) as total_tracks FROM"
					. " osv_users OSV_U INNER JOIN  osv_sequence OSV_S ON OSV_U.id = OSV_S.user_id "
					. " $whereQuery GROUP BY  OSV_S.user_id ORDER BY total_km DESC";
			if ($schema->tablesExist("osv_sequence") && $schema->tablesExist("osv_users")) {
				$response = $app['db']->fetchAll($query);
			}

			return $response;
		}
		private function ipToNumber($ip) {
			if(empty($ip)) return false;
		    
			$ip = split("\.", "$ip");
			return ($ip[3] + $ip[2] * 256 + $ip[1] * 256 * 256 + $ip[0] * 256 * 256 * 256);
		}

		public function getRole()
		{
			return $this->role;
		}

		public function getRanks(Application $app, $userId, $startDate = null) 
		{
			$whereQuery = " WHERE OSV_S.status = 'active' "; //user and sequences are not deleted
			$whereQuery .= " AND OSV_S.image_processing_status = 'PROCESSING_FINISHED' ";
			$whereQuery .= " AND OSV_S.distance IS NOT NULL";
			if(!empty($startDate)) {
				$whereQuery .=" AND OSV_S.date_added >= (".$startDate.")";
			}
			$query = " SELECT
						OSV_R.total_km,
						OSV_R.total_photos,
						OSV_R.total_tracks,
						OSV_R.rank
						FROM (SELECT 
							OSV_S.user_id,
							SUM(OSV_S.distance) as total_km, 
							SUM(OSV_S.count_active_photos) AS total_photos, 
							COUNT(OSV_S.id) as total_tracks,
							@rownum := @rownum + 1 AS rank
							FROM osv_sequence OSV_S
							JOIN (SELECT @rownum := 0) r
							$whereQuery GROUP BY  OSV_S.user_id ORDER BY total_km DESC
						) AS OSV_R WHERE OSV_R.user_id = ".$userId;
			$result = $app['db']->fetchAll($query);
			return $result?$result[0]:array();
		}
	}