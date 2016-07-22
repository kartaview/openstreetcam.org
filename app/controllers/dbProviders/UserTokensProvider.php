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


	class UserTokensProvider{
		/**
		*@var int
		*/
		public $id;
		/**
		 * @var string|null
		 */
		public $username = null;
		/**
		 * @var int|null
		 */
		public $token = null;
		/**
		 * @var string|null
		 */
		public $createdAt = null;

		/**
		 * @var string|null
		 */
		public $updatedAt = null;
			
		static public function loadValidatorMetadata(ClassMetadata $metadata) {
			//$metadata->addPropertyConstraint('id', new Assert\Type(array('type' => 'numeric', 'message'=> API_CODE_INVALID_ARGUMENT)));
			$metadata->addPropertyConstraint('username', new Assert\NotBlank(array('message' => API_CODE_MISSING_ARGUMENT)));
			$metadata->addPropertyConstraint('token', new Assert\Type(array('type' => 'string', 'message'=> API_CODE_INVALID_ARGUMENT)));
		}

		public function setId($value = null){
			if(isset($value) && !empty($value)){
				$this->id = $value;
			}
			return true;
		}

		public function setUsername($value = null){
			if(isset($value) && !empty($value)){
				$this->username = $value;
			}
			return true;
		}
		
		public function setToken($value = null){
			if(isset($value) && !empty($value)){
				$this->token  = $value;
			}
			return true;
		}
		
		public function isLogged(){
			return !empty($this->id) ? true : false;
		}
		
		public function add(){
			$schema = OsvApp::getResource('db')->getSchemaManager();
			if ($schema->tablesExist('osv_user_tokens')) {	
				if ($this->get($this->token)) return $this->id;
				$result = OsvApp::getResource('db')->insert('osv_user_tokens', array(
				  'username' => $this->username,
				  'token' => $this->token,
				  'created_at' => date('Y-m-d H:i:s'),
				  'updated_at' => date('Y-m-d H:i:s'),
				));
				if($result) {
					$this->id = OsvApp::getResource('db')->lastInsertId('osv_user_tokens');
					return $this->id;
				}
			}
			return false;
		}
		
		/*
		* get user properties if the Id is not null
		*/
		public function get($token = null) {
			$schema = OsvApp::getResource('db')->getSchemaManager();
			if ($schema->tablesExist('osv_user_tokens')) {	
				$userToken = OsvApp::getResource('db')->fetchAssoc(
					"SELECT username, token, created_at, updated_at FROM osv_user_tokens  AS UT WHERE token = :token", 
					array(
					 	'token' => $token
					)
				);
				if($userToken) {
					$this->username = $userToken['username'];
					$this->token = $userToken['token'];
					$this->created_at = $userToken['created_at'];
					$this->updated_at = $userToken['updated_at'];
					return $this;
				}		
			}
			return false;
		}
		
	}