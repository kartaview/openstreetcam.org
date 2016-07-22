<?php

/*
 * This file is part of the openstreetview.org
 *
 * Copyright ©2016, Telenav, Inc.  All Rights Reserved
 *
 * The code is licensed under the LGPL Version 3 license 
 *  http://www.gnu.org/licenses/lgpl-3.0.en.html.
 */

class OSVFileaccessProvider{
	public $id;
	public $username;
	public $password;
	public $createdAt;
	public $status;

	public function getByUsername($app, $username, $status = 'active') 
	{
		$osvUser = $app['db']->fetchAssoc("SELECT * FROM osv_fileaccess
			WHERE username = :username AND status = :status",
			array(
			 	'username' => $username,
			 	'status' => $status
			));
		if($osvUser) {
			$this->id = $osvUser['id'];
			$this->username = $osvUser['username'];
			$this->password = $osvUser['password'];
			$this->created_at = $osvUser['created_at'];
			$this->status = $osvUser['status'];
			return $this;
		}
		return false;	
	}
}