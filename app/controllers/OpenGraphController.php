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
	class OpenGraphController{
		public function index(Application $app){
			$request = $app['request'];
			$sequenceId = $request->query->get('sequence');
			$index = $request->query->get('index');
			if ($sequenceId && $index >= 0) {
				$osvSequence = new OSVSequenceProvider();
				$photo = new OSVPhotoProvider();
				$osvUser = new UserProvider();
				$sequence = $osvSequence->get($app, $sequenceId);
				if ($sequence->userId) {
					$photos = $photo->getByIndexes($app, $sequenceId, (array)$index);
					$owner = $osvUser->get($app, $sequence->userId);
					$photo = (isset($photos[0]) && isset($photos[0]['lth_name']))?$photos[0]['lth_name']:'';
					$lat = (isset($photos[0]) && isset($photos[0]['lat']))?$photos[0]['lat']:'';
					$lng = (isset($photos[0]) && isset($photos[0]['lng']))?$photos[0]['lng']:'';
					$dateAdded = (isset($photos[0]) && isset($photos[0]['date_added']))?$photos[0]['date_added']:'';
					return $app['twig']->render('opengraph.html.twig', array(
						'author' => $owner->getUsername(),
						'title' => 'OpenStreetView photo',
						'description' => 'Track:'.$sequenceId.'/'.$index.', '.date('d.m.Y', strtotime($dateAdded)).'. Latitude:'.$lat.' Longitude:'.$lng.' Author: '.$owner->getUsername(),
						'image' => $request->getBaseUrl().'/'.$photo,
						'url' => $request->getBaseUrl().'/details/'.$sequenceId.'/'.$index
						)
					);
				}
			}
			return '';
		}
	}