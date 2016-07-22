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
	
	use OAuth\OAuth1\Service\OpenStreetMap;
	
	class OSVFileAuthController{

		public function index(Application $app){
			$request = $app['request'];
			$filePath = $request->query->get('path');
			if ($this->readFile($app, $filePath)) {
				return;
			}
			die("Access Denied!");
		}

		protected function readFile($app, $filePath)
		{
			if ($filePath) {
				$filePath = ltrim($filePath, '/');
				if (file_exists($filePath) && $this->isValidFile($app, $filePath)) {
					$fp = fopen($filePath, 'r');
					// Set mime type to header
					header('Content-type: '.mime_content_type($filePath));
					// Send the contents of the file the browser
					fpassthru($fp);
					fclose($fp);
					return true;
				}
			}
			return false;
		}

		public function originAuth(Application $app)
		{
			$request = $app['request'];
			$username = $app['request']->server->get('PHP_AUTH_USER', false);
		    $password = $app['request']->server->get('PHP_AUTH_PW');
		    $fileaccessProvider = new OSVFileaccessProvider();
		    $fileaccessProvider->getByUsername($app, $username);
		    if ($fileaccessProvider->id && $fileaccessProvider->password === $password) {
		        $filePath = $request->query->get('path');
				if ($this->readFile($app, $filePath)) {
					return;
				}
				die("Access Denied!");
		    }

		    $response = new Response();
		    $response->headers->set('WWW-Authenticate', sprintf('Basic realm="%s"', 'site_login'));
		    $response->setStatusCode(401, 'Please sign in.');
		    return $response;
		}

		protected function isValidFile($app, $filePath)
		{
			$pathInfo = pathinfo($filePath);
			$fileName = $pathInfo['basename'];
			$extension = $pathInfo['extension'];
			if (in_array(strtolower($extension), array('jpeg', 'jpg', 'png'))) {
				$osvPhoto = new OSVPhotoProvider();
				$osvPhoto->getByName($app, $fileName);
				if ($osvPhoto->getSequenceId()) {
					return true;
				}
			} else if (in_array(strtolower($extension), array('txt'))) {
				$osvSequence = new OSVSequenceProvider();
				$osvSequence->getByMetadataFilename($app, $filename);
				if ($osvSequence->getId()) {
					return true;
				}

			}
			return false;
		}
	}

