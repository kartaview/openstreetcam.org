<?php 

/*
 * This file is part of the openstreetview.org
 *
 * Copyright ©2016, Telenav, Inc.  All Rights Reserved
 *
 * The code is licensed under the LGPL Version 3 license 
 *  http://www.gnu.org/licenses/lgpl-3.0.en.html.
 */
	define('API_CODE_OK', '600: The request has been processed without incidents ');
	define('API_CODE_EMPTY_RESULT', '601: The request has an empty response ');
	define('API_CODE_POSSIBLY_INACCURATE', '602: The request has been processed but there have been incidents');
	
	define('API_CODE_MISSING_ARGUMENT' , '610: A required argument is missing ');
	define('API_CODE_INVALID_ARGUMENT' , '611: An argument has the wrong type ');
	define('API_CODE_OUT_OF_RANGE_ARGUMENT', '612: An argument is out of range ');
	define('API_CODE_INVALID_REQUEST_BODY', '613: Invalid request body.');
	define('API_CODE_ACCESS_DENIED', '618: You are not allowed to perform this operation.');
	define('API_CODE_DUPLICATE_ENTRY', '660: You are not allowed to add a duplicate entry ');
	
	define('API_CODE_INCORRECT_STATUS', '671: The status is incorrect.');

	define('AUTHENTICATION_REQUIRED', '401: You have to be authenticated in order to access this method');
	define('API_CODE_UNEXPECTED_SERVER_ERROR', '690: An unexpected server error has occurred');
	
	define('HTTP_CODE_BAD_REQUEST', 'Bad Request');
	define('HTTP_CODE_SUCCESS', 'Success');

	define('OSM_API_KEY',		'******************************62L*****');
	define('OSM_API_SECRET',    '******************************duixu****');
	define('API_VERSION', 		'1.0');
	define('PATH_FILES_PHOTO', 'files/photo');