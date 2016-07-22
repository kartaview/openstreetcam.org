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
use Symfony\Component\Intl\Intl;

class OSVMapController
{
    const NEAR_DISTANCE = 0.5;
    public function index(Application $app)
    {
        $request = $app['request'];
        if (is_null($request->get('form', null))) {
            $postData = array(
                'bbTopLeft' => $request->request->get('bbTopLeft', null),
                'bbBottomRight' => $request->request->get('bbBottomRight', null),
                'drawTracks' => $request->request->get('drawTracks', null),
                'platform' => $request->request->get('platform', null),
	            'obdInfo' => $request->request->get('obdInfo', null),
                'page' => $request->request->get('page', null),
                'ipp' => $request->request->get('ipp', null),
                'action' => $request->request->get('action', 'segments'),
                'excludeBbTopLeft' => $request->request->get('excludeBbTopLeft', null),
                'excludeBbBottomRight' => $request->request->get('excludeBbBottomRight', null),
                'requestedParams' => $request->request->get('requestedParams', null),
            );
        } else {
            $postData = $request->get('form');
        }
        $response = null;
        $error = null;
        /*****VALIDATION***/
        $constraint = new Assert\Collection(array(
            "fields" => array(
                'bbTopLeft' => new Assert\NotBlank(),
                'bbBottomRight' => new Assert\NotBlank(),
	            'obdInfo' => array(new Assert\Optional(), new Assert\Choice(array('choices'=>array( '0', '1'), 'message' => API_CODE_INVALID_ARGUMENT ))),
                'drawTracks' => new Assert\Optional(),
                'platform' => new Assert\Optional(),
                'page' => new Assert\Optional(),
                'ipp' => new Assert\Optional(),
                'action' => new Assert\Optional(),
                'requestedParams' => array(
                    new Assert\Optional()
                 //  new Assert\Choice(array('choices'=>array('date_added', 'address', 'reviewed', 'changed', 'obd_info', 'count_active_photos', 'recognitions'), 'message' => API_CODE_INVALID_ARGUMENT, 'multiple' => true ))
                ),
                'excludeBbTopLeft' => new Assert\Optional(),
                'excludeBbBottomRight' => new Assert\Optional(),
            )
        ));
        $action = in_array($postData['action'], array('segments', 'matched', 'unmatched'))?$postData['action']:'segments';

        $errors = $app['validator']->validateValue($postData, $constraint);
        if (count($errors) > 0) {
            foreach ($errors as $error) {
                $frc = new OSVResponseController($app, null, $error);
                return $frc->jsonResponse;
            }
        }

        $bbTopLeft = explode(",", $postData['bbTopLeft']);
        $bbTopLeftLat = (isset($bbTopLeft[0]) ? $bbTopLeft[0] : null);
        $bbTopLeftLng = (isset($bbTopLeft[1]) ? $bbTopLeft[1] : null);

        $bbBottomRight = explode(",", $postData['bbBottomRight']);
        $bbBottomRightLat = (isset($bbBottomRight[0]) ? $bbBottomRight[0] : null);
        $bbBottomRightLng = (isset($bbBottomRight[1]) ? $bbBottomRight[1] : null);

        $tracksId = !empty($postData['drawTracks']) && is_string($postData['drawTracks']) ? array_flip(explode(',', $postData['drawTracks'])) : null;

        $excludeBbTopLeft = explode(",", $postData['excludeBbTopLeft']);
        $excludeBbTopLeftLat = (isset($excludeBbTopLeft[0]) ? $excludeBbTopLeft[0] : null);
        $excludeBbTopLeftLng = (isset($excludeBbTopLeft[1]) ? $excludeBbTopLeft[1] : null);

        $excludeBbBottomRight = explode(",", $postData['excludeBbBottomRight']);
        $excludeBbBottomRightLat = (isset($excludeBbBottomRight[0]) ? $excludeBbBottomRight[0] : null);
        $excludeBbBottomRightLng = (isset($excludeBbBottomRight[1]) ? $excludeBbBottomRight[1] : null);
        $platform = empty($postData['platform']) ? false : (in_array($postData['platform'], array('web')) ? $postData['platform'] : false);
        /*****END VALIDATION***/
        try {
            $zoomLevel = 13;
            $latDiff = max($bbBottomRightLat, $bbTopLeftLat) - min($bbBottomRightLat, $bbTopLeftLat);
            $lngDiff = max($bbTopLeftLng,$excludeBbTopLeftLng) - min($bbTopLeftLng,$excludeBbTopLeftLng);

            $maxDiff = ($lngDiff > $latDiff) ? $lngDiff : $latDiff;
            if ($maxDiff < 360 / pow(2, 20)) {
                $zoomLevel = 21;
            } else {
                $zoomLevel = (int) (-1*( (log($maxDiff)/log(2)) - (log(360)/log(2))));
                if ($zoomLevel < 1)
                    $zoomLevel = 1;
            }
            $osvList = new OSVGeometryProvider();
            $osvListSequence = new OSVListProvider();
            $osvSequence = new OSVSequenceProvider();
            $photo = new OSVPhotoProvider();
            if ($action || $action == "segments") {
                $osvList = new OSVGeometryProvider();
            }
            if ($action == 'unmatched' || $action == 'matched') {
                $osvList = new OSVListProvider();
            }
            $userId = false;
            if (isset($app['user']) && !empty($app['user']) && $app['user']->isLogged()) $userId = $app['user']->getId();
            $osvMap = $osvList->getTracks($app, $bbTopLeftLat, $bbTopLeftLng, $bbBottomRightLat, $bbBottomRightLng, 
                        $postData['obdInfo'], $postData['page'], $postData['ipp'], $postData['requestedParams'], $excludeBbTopLeftLat, $excludeBbTopLeftLng, $excludeBbBottomRightLat, $excludeBbBottomRightLng);

            $pageItems = array();
            $bboxWidth = abs($bbTopLeftLat - $bbBottomRightLat);
            $bboxHeight = abs($bbTopLeftLng - $bbBottomRightLng);
            foreach ($osvMap->sequenceList as $oneSequenceTrack) {
                if ($this->simplyfyBbox($bboxWidth, $bboxHeight, $oneSequenceTrack) == false) {
                    continue;
                }
                $points = array();
                if ($action == 'segments') {
                    $points = $osvList->getTrackPoints($app, $oneSequenceTrack['from'], $oneSequenceTrack['to'], $oneSequenceTrack['way_id']);
                } 
                if (!count($points)) {
                    continue;
                }
                if ($zoomLevel <= 10 && count($points) > 2) {
                    $points = array($points[0], $points[count($points) -1]);
                }
                if ($zoomLevel > 10) {
                    $points = $this->simplify($points, $zoomLevel);
                }
                $oneSequenceTrack['track'] = $points;

                if (isset($oneSequenceTrack['user_id'])) unset($oneSequenceTrack['user_id']);
                array_push($pageItems, $oneSequenceTrack);
            }
            
            $response = array(
                'currentPageItems' => $pageItems,
                'totalFilteredItems' => $osvMap->sequenceCount,
                'removeTracks' => isset($tracksId) && !empty($tracksId) && is_array($tracksId) && count($tracksId) > 0 ? implode(',', array_flip($tracksId)) : ''
            );
        } catch (Exception $ex) {
            echo $ex->getMessage();
            error_log($ex->getMessage());
            $error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_UNEXPECTED_SERVER_ERROR, 690);
        }
        $frc = new OSVResponseController($app, $response, $error);
        return $frc->jsonResponse;
    }

    protected function simplyfyBbox($bboxWidth, $bboxHeight, $oneSequenceTrack){
        if (abs(($oneSequenceTrack['nw_lat'] - $oneSequenceTrack['se_lat'])/$bboxWidth) < 0.001 && abs(($oneSequenceTrack['nw_lng'] - $oneSequenceTrack['se_lng'])/$bboxHeight) < 0.001) {
            return false;
        }
        return true;
    }

    protected function simplify($points, $zoomLevel) {
        $pointCount = count($points);
        $result = [];
        if ($pointCount > 2) {
            $start = [$points[0][0], $points[0][1]];
            $end = [$points[1][0], $points[1][1]];
            $somePoint;
            for($i = 2; $i < $pointCount; $i++) {
                $somePoint = [$points[$i][0], $points[$i][1]];
                $dx1 = $start[0] - $end[0];
                $dy1 = $start[1] - $end[1];
                // if (abs($dx1) < 0.00001 && abs($dy1) < 0.0000001) {
                //     $end = $somePoint;
                //     continue;
                // }
                if ($dx1 == 0) {
                    $panta1 = 0;
                } else {
                    $panta1 = $dy1/$dx1;
                }
                
                $dx2 = $start[0] - $somePoint[0];
                $dy2 = $start[1] - $somePoint[1];
                // if (abs($dx2) < 0.00001 && abs($dy2) < 0.0000001) {
                //     $end = $somePoint;
                //     continue;
                // }
        
                if ($dx2 == 0) {
                    $panta2 = 0;
                } else {
                    $panta2 = $dy2/$dx2;
                }
                if (abs($panta1 - $panta2) < 1/($zoomLevel*3)) {
                    $end = $somePoint;
                } else {
                    $result[] = $start;          
                    $start = $end;
                    $end = $somePoint;
                }
            }
            $result[] = $start;
            $result[] = $end;
        }
        return $result;
    }

    public function near(Application $app) 
    {
        $request = $app['request'];
        if (is_null($request->get('form', null))) {
            $postData = array(
                'lat' => $request->request->get('lat', null),
                'lng' => $request->request->get('lng', null),
                'distance' => $request->request->get('distance', null),
            );
        } else {
            $postData = $request->get('form');
        }
        $response = null;
        $error = null;
        $constraint = new Assert\Collection(array(
            "fields" => array(
                'lat' => new Assert\NotBlank(),
                'lng' => new Assert\NotBlank(),
                'distance' => new Assert\Optional(),
            )
        ));
        $errors = $app['validator']->validateValue($postData, $constraint);
        if (count($errors) > 0) {
            foreach ($errors as $error) {
                $frc = new OSVResponseController($app, null, $error);
                return $frc->jsonResponse;
            }
        }
        try {
            $geometry = new OSVGeometryProvider();
            $bbBox = $geometry->getNear($app, $postData['lat'], $postData['lng'], $postData['distance']);
            $response = array();
            if ($bbBox && isset($bbBox['sequences'])) {
                $response = $bbBox;
            }
        } catch (Exception $ex) {
            echo $ex->getMessage();
            $error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_UNEXPECTED_SERVER_ERROR, 690);
        }
        $frc = new OSVResponseController($app, $response, $error);
        return $frc->jsonResponse;
    }   

    public function tracksDeprecated(Application $app)
    {
        $request = $app['request'];
        if (is_null($request->get('form', null))) {
            $postData = array(
                'bbTopLeft' => $request->request->get('bbTopLeft', null),
                'bbBottomRight' => $request->request->get('bbBottomRight', null),
                'drawTracks' => $request->request->get('drawTracks', null),
                'platform' => $request->request->get('platform', null),
                'obdInfo' => $request->request->get('obdInfo', null),
                'page' => $request->request->get('page', null),
                'ipp' => $request->request->get('ipp', null),
                'action' => $request->request->get('action', 'unmatched'),
                'requestedParams' => $request->request->get('requestedParams', null),
            );
        } else {
            $postData = $request->get('form');
        }
        $response = null;
        $error = null;
        /*****VALIDATION***/
        $constraint = new Assert\Collection(array(
            "fields" => array(
                'bbTopLeft' => new Assert\NotBlank(),
                'bbBottomRight' => new Assert\NotBlank(),
          'obdInfo' => array(new Assert\Optional(), new Assert\Choice(array('choices'=>array( '0', '1'), 'message' => API_CODE_INVALID_ARGUMENT ))),
                'drawTracks' => new Assert\Optional(),
                'platform' => new Assert\Optional(),
                'page' => new Assert\Optional(),
                'ipp' => new Assert\Optional(),
                'action' => new Assert\Optional(),
                'requestedParams' => array(
                    new Assert\Optional()
                 //  new Assert\Choice(array('choices'=>array('date_added', 'address', 'reviewed', 'changed', 'obd_info', 'count_active_photos', 'recognitions'), 'message' => API_CODE_INVALID_ARGUMENT, 'multiple' => true ))
                ),
            )
        ));
        $action = in_array($postData['action'], array('segments', 'matched', 'unmatched'))?$postData['action']:'segments';

        $errors = $app['validator']->validateValue($postData, $constraint);
        if (count($errors) > 0) {
            foreach ($errors as $error) {
                $frc = new OSVResponseController($app, null, $error);
                return $frc->jsonResponse;
            }
        }

        $bbTopLeft = explode(",", $postData['bbTopLeft']);
        $bbTopLeftLat = (isset($bbTopLeft[0]) ? $bbTopLeft[0] : null);
        $bbTopLeftLng = (isset($bbTopLeft[1]) ? $bbTopLeft[1] : null);

        $bbBottomRight = explode(",", $postData['bbBottomRight']);
        $bbBottomRightLat = (isset($bbBottomRight[0]) ? $bbBottomRight[0] : null);
        $bbBottomRightLng = (isset($bbBottomRight[1]) ? $bbBottomRight[1] : null);

        $tracksId = !empty($postData['drawTracks']) && is_string($postData['drawTracks']) ? array_flip(explode(',', $postData['drawTracks'])) : null;
        $platform = empty($postData['platform']) ? false : (in_array($postData['platform'], array('web')) ? $postData['platform'] : false);
        /*****END VALIDATION***/
        try {
            $osvList = new OSVGeometryProvider();
            $osvListSequence = new OSVListProvider();
            $osvSequence = new OSVSequenceProvider();
            $photo = new OSVPhotoProvider();
            if ($action || $action == "segments") {
                $osvList = new OSVGeometryProvider();
            }
            if ($action == 'unmatched' || $action == 'matched') {
                $osvList = new OSVListProvider();
            }
            $userId = false;
            if (isset($app['user']) && !empty($app['user']) && $app['user']->isLogged()) $userId = $app['user']->getId();
            $osvMap = $osvList->getTracks($app, $bbTopLeftLat, $bbTopLeftLng, $bbBottomRightLat, $bbBottomRightLng, 
                        $postData['obdInfo'], $postData['page'], $postData['ipp'], $postData['requestedParams']);

            $pageItems = array();
            foreach ($osvMap->sequenceList as $oneSequenceTrack) {
                if (isset($tracksId[$oneSequenceTrack['element_id']])) {
                    unset($tracksId[$oneSequenceTrack['element_id']]);
                    continue;
                }
                if ($platform != 'web') {
                    $oneSequenceTrack['track'] = $osvList->getTrackPoints($app, $oneSequenceTrack['from'], $oneSequenceTrack['to'], $oneSequenceTrack['way_id']);
                    if (count($oneSequenceTrack['track']) > 0) {
                        $track = array();
                        foreach ($oneSequenceTrack['track'] as $point) {
                            array_push($track, $point['lat'], $point['lng']);
                        }
                        $oneSequenceTrack['track'] = $track;
                    }
                } else {
                    if ($action == 'segments') {
                        $points = $osvList->getTrackPoints($app, $oneSequenceTrack['from'], $oneSequenceTrack['to'], $oneSequenceTrack['way_id']);
                       $oneSequenceTrack['sequenceIds'] = $osvList->getSequences($app, $oneSequenceTrack['from'], $oneSequenceTrack['to'], $oneSequenceTrack['way_id'], $userId, $postData['obdInfo']);
                    } else if ($action == 'unmatched') {
                        $oneSequenceTrack['sequenceIds'] = (array)$oneSequenceTrack['element_id'];
                        $points = $osvList->getTrackPoints($app, $oneSequenceTrack['element_id'], false);
                    } else if ($action == 'matched') {
                        $oneSequenceTrack['sequenceIds'] = (array)$oneSequenceTrack['element_id'];
                        $points = $osvList->getTrackPoints($app, $oneSequenceTrack['element_id']);
                    }
                    if (!count($points)) {
                        continue;
                    }
                    $group = 0;
                    $prev = false;
                    // $oneSequenceTrack['track'][0] = $points;
                    foreach($points as $point) {
                        if ($prev) {
                            $dst = sqrt(pow($point['lat'] - $prev['lat'], 2) + pow($point['lng'] - $prev['lng'], 2)) * 10000;
                            if ($dst > 20) {
                                $group++;
                            }
                        }
                        $oneSequenceTrack['track'][$group][] = $point;
                        $prev = $point;
                    }
                }

                if (isset($oneSequenceTrack['user_id'])) unset($oneSequenceTrack['user_id']);
                array_push($pageItems, $oneSequenceTrack);
            }

            if ($postData['page'] && $postData['ipp']) {
                $currentOffset = ($postData['page'] - 1) * $postData['ipp'] + count($pageItems);
                if ($osvMap->sequenceCount[0] >  $currentOffset) {
                    $tracksId = '';
                } else {
                    $osvMap = $osvList->getTracks($app, $bbTopLeftLat, $bbTopLeftLng, $bbBottomRightLat, $bbBottomRightLng, 
                    $postData['obdInfo'], null, null, $postData['requestedParams']);
                    foreach ($osvMap->sequenceList as $oneSequenceTrack) {
                        if (isset($tracksId[$oneSequenceTrack['element_id']])) {
                            unset($tracksId[$oneSequenceTrack['element_id']]);
                            continue;
                        }
                    }
                }
            }
            
            $response = array(
                'currentPageItems' => $pageItems,
                'totalFilteredItems' => $osvMap->sequenceCount,
                'removeTracks' => isset($tracksId) && !empty($tracksId) && is_array($tracksId) && count($tracksId) > 0 ? implode(',', array_flip($tracksId)) : ''
            );
        } catch (Exception $ex) {
            error_log($ex->getMessage());
            $error = new \Symfony\Component\Config\Definition\Exception\Exception(API_CODE_UNEXPECTED_SERVER_ERROR, 690);
        }
        $frc = new OSVResponseController($app, $response, $error);
        return $frc->jsonResponse;
    }

}