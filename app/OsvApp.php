<?php 
	
/*
 * This file is part of the openstreetview.org
 *
 * Copyright ©2016, Telenav, Inc.  All Rights Reserved
 *
 * The code is licensed under the LGPL Version 3 license 
 *  http://www.gnu.org/licenses/lgpl-3.0.en.html.
 */

class OsvApp {
	static private $_app;

	static public function setApp(&$app)
	{
		self::$_app = $app;
	}

	static public function getApp()
	{
		return self::$_app?self::$_app:null;
	}

	static public function getResource($key)
	{
		if (isset(self::$_app[$key])) {
			return self::$_app[$key];
		}
		return false;
	}
}