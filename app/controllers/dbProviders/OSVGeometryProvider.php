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
	
	class OSVGeometryProvider{
		public $from;
		public $to;
		public $wayId;
		public $nwLat;
		public $index;
		public $lat;
		public $lng;
		public $sequenceCount;
		public $elementsList;


		public function getTracks(Application $app, $bbTopLeftLat = null, $bbTopLeftLng = null, $bbBottomRightLat = null, $bbBottomRightLng = null, $obdInfo = null, $page = null, $ipp = null, $requestedParams = null, $excludeBbTopLeftLat = null, $excludeBbTopLeftLng = null, $excludeBbBottomRightLat = null, $excludeBbBottomRightLng = null)
    	{
    		$schema = $app['db']->getSchemaManager();

	        if (isset($app['user']) && !empty($app['user']) && $app['user']->isLogged()) $userId = $app['user']->getId();
	        else $userId = false;

	        $limitQuery = "";
	        $offset = 0;
	        if (!empty($page) && !empty($ipp)) {
	            $offset = ($page - 1) * $ipp;
	            $limitQuery = " LIMIT $offset, $ipp ";
	        }

	        $queryParameters = array();
	        $whereQuery = " WHERE (:bb_se_lat <= osg.nw_lat AND :bb_nw_lat >= osg.se_lat AND :bb_se_lng >= osg.nw_lng AND :bb_nw_lng <= osg.se_lng ) ";

	        if ($excludeBbTopLeftLat && $excludeBbTopLeftLng && $excludeBbBottomRightLat && $excludeBbBottomRightLng) {
	         	$whereQuery .= " AND !(:exclude_bb_se_lat <= osg.nw_lat AND :exclude_bb_nw_lat >= osg.se_lat AND :exclude_bb_se_lng >= osg.nw_lng AND :exclude_bb_nw_lng <= osg.se_lng ) ";
 		        $queryParameters['exclude_bb_nw_lat'] = $excludeBbTopLeftLat;
		        $queryParameters['exclude_bb_nw_lng'] = $excludeBbTopLeftLng;
		        $queryParameters['exclude_bb_se_lat'] = $excludeBbBottomRightLat;
		        $queryParameters['exclude_bb_se_lng'] = $excludeBbBottomRightLng;
	        }

	        $queryParameters['bb_nw_lat'] = $bbTopLeftLat;
	        $queryParameters['bb_nw_lng'] = $bbTopLeftLng;
	        $queryParameters['bb_se_lat'] = $bbBottomRightLat;
	        $queryParameters['bb_se_lng'] = $bbBottomRightLng;

	        $querySelect = "SELECT 
	        	CONCAT(osg.from, osg.to, osg.way_id) AS element_id, 
	        	osg.from, 
	        	osg.to,
	        	osg.way_id,
	        	osg.nw_lat,
	        	osg.nw_lng,
	        	osg.se_lat,
	        	osg.se_lng
	        ";
        	$from = " FROM osv_segments osg ";

        	if ($requestedParams) {
				$querySelect .=  ",". $requestedParams;
	        }
	        $queryCount = "SELECT COUNT(*) AS total " . $from . $whereQuery ;
	        $query = $querySelect .$from . $whereQuery . $limitQuery;
	        $this->sequenceCount = $app['db']->fetchArray($queryCount, $queryParameters);
	        $this->sequenceList = $app['db']->fetchAll($query, $queryParameters);

	        // else empty result
	        return $this;
    	}

	    public function getTrackPoints(Application $app, $from, $to, $wayId)
	    {
	        $schema = $app['db']->getSchemaManager();

	        $query = "SELECT lat, lng FROM osv_geometry og 
	        WHERE og.from = :from and og.to = :to and og.way_id = :wayId ORDER BY og.index";
	        $queryParameters['from'] = $from;
	        $queryParameters['to'] = $to;
	        $queryParameters['wayId'] = $wayId;
	       	return $app['db']->executeQuery($query, $queryParameters)->fetchAll(PDO::FETCH_NUM);
	    }

	public function getUnmatchedPoints(Application $app, $sequenceId) {
	        $schema = $app['db']->getSchemaManager();
	        $query = "SELECT lat, lng FROM osv_photos WHERE match_lat is NULL AND match_lng is NULL AND auto_img_processing_status = 'FINISHED' AND sequence_id = :sequenceId AND status = 'active' ORDER BY sequence_index ASC";
	        $queryParameters['sequenceId'] = $sequenceId;
		return $app['db']->fetchAll($query, $queryParameters);
	 }

	    public function getSequences($app, $from, $to, $wayId, $userId = null, $obdInfo = null) {
	    	$sql = "SELECT GROUP_CONCAT(oss.sequence_id) as sequence_ids FROM osv_sequence_segment oss";
	    	$join = "";
	    	$where = " WHERE oss.from = :from AND oss.to = :to AND oss.way_id = :way_id ";
	    	$queryParameters['from'] = $from;
	    	$queryParameters['to'] = $to;
	    	$queryParameters['way_id'] = $wayId;
	    	if ($userId || $obdInfo) {
	    		$join = " LEFT JOIN osv_sequence AS os ON oss.sequence_id = os.id ";
	    		
	    	}
	    	if ($userId) {
	    		$where .= " AND os.user_id = :user_id";
	    		$queryParameters['user_id'] = $userId;
	    	}
	    	if ($obdInfo) {
	    		$where .= " AND os.obd_info = :obd_info";
	    		$queryParameters['obd_info'] = $obdInfo;
	    	}
	    	$query = $sql.$join.$where;
	    	$result = $app['db']->fetchAll($query, $queryParameters);
	    	if ($result && count($result)) {
	    		return explode(',',$result[0]['sequence_ids']);
	    	}
	    	return array();
	    }

		public function getNears($app, $lat, $lng, $distance) 
		{
			$resultGeometry = array();
			$resultSegment = array();
			$result = false;
			if(!empty($lat) && !empty($lng) && !empty($distance)) {
				$bbox = $this->getBoundingBox($lat, $lng, $distance);
				$sql ="SELECT
				OSV_G.from,
				OSV_G.to,
				OSV_G.way_id,
				match_lat as lat,
				match_lng as lng,
				3956 * 2 * ASIN(SQRT( POWER(SIN((:lat - abs(OSV_G.lat)) * 
				pi()/180 / 2),2) + COS(:lat * pi()/180 ) * COS(abs(OSV_G.lat) *  pi()/180) * POWER(SIN((:lng - OSV_G.lng) *  pi()/180 / 2), 2))) as distance
				FROM osv_photos OSV_G
				WHERE OSV_G.lat <= :nw_lat AND OSV_G.lat >= :se_lat AND OSV_G.lng >= :nw_lng AND OSV_G.lng <= :se_lng AND OSV_G.status = 'active' AND match_lat IS NOT NULL AND match_lng IS NOT NULL
				";
				$queryParameters['lat'] = $lat;
				$queryParameters['lng'] = $lng;
				$queryParameters['distance'] = $distance;
				$queryParameters['nw_lat'] = $bbox['nw_lat'];
				$queryParameters['nw_lng'] = $bbox['nw_lng'];
				$queryParameters['se_lat'] = $bbox['se_lat'];
				$queryParameters['se_lng'] = $bbox['se_lng'];
				$sql .= " ORDER BY distance ASC LIMIT 1";
				
				$resultGeometry = $app['db']->fetchAll($sql, $queryParameters);
				$resultGeometry = count($resultGeometry)?$resultGeometry[0]:false;
				if ($resultGeometry) {
					$result['lat'] = $resultGeometry['lat'];
					$result['lng'] = $resultGeometry['lng'];
					$result['from'] = $resultGeometry['from'];
					$result['to'] = $resultGeometry['to'];
					$result['way_id'] = $resultGeometry['way_id'];
					$sql = " SELECT 
					OSV_S.count_active_photos as photo_no,
					OSV_S.distance as distance,
					OSV_S.address as address,
					OSV_U.username AS author,
					OSV_S.date_added AS date,
					CONCAT('".PATH_FILES_PHOTO."', '/',  YEAR(OSV_S.date_added),'/', MONTH(OSV_S.date_added),'/', DAY(OSV_S.date_added),'/lth/') as photo_path,
					OSV_SS.sequence_id
					FROM osv_sequence_segment OSV_SS ";
					$sql .= " LEFT JOIN osv_sequence AS OSV_S ON OSV_S.id = OSV_SS.sequence_id ";
					$sql .= " LEFT JOIN osv_users AS OSV_U ON OSV_U.id = OSV_S.user_id ";
					$sql .= " WHERE OSV_SS.from = :from AND OSV_SS.to = :to AND OSV_SS.way_id = :way_id ";
					$sql .= " GROUP BY OSV_SS.sequence_id ";
					$queryParameters['from'] = $resultGeometry['from'];
					$queryParameters['to'] = $resultGeometry['to'];
					$queryParameters['way_id'] = $resultGeometry['way_id'];
					$resultSegment = $app['db']->fetchAll($sql, $queryParameters);
					if (count($resultSegment)) {
						$sequences = array();
						foreach($resultSegment as $segment) {
							$sql = "
							SELECT
								sequence_index as sequence_index,
								IF(match_lat IS NOT NULL, match_lat, lat) AS lat,
								IF(match_lng IS NOT NULL, match_lng, lng) AS lng,
								name,
								sequence_id,
								sequence_index, 
								3956 * 2 * ASIN(SQRT( POWER(SIN((:lat - abs(lat)) * pi()/180 / 2),2) + COS(:lat * pi()/180 ) * COS(abs(lat) *  pi()/180) * POWER(SIN((:lng - lng) *  pi()/180 / 2), 2))) as distance
							FROM osv_photos
							WHERE sequence_id = :sequence_id
							ORDER BY distance ASC 
							LIMIT 1";
							$queryParameters['sequence_id'] = $segment['sequence_id'];
							$photoResult = $app['db']->fetchAll($sql, $queryParameters);
							$photoResult = count($photoResult)?$photoResult[0]:false;
							$sequence = array();
							$sequence['sequence_id'] = $segment['sequence_id'];
							$sequence['photo'] = $segment['photo_path'].$photoResult['name'];
							$sequence['sequence_index'] = $photoResult['sequence_index'];
							$sequence['lat'] = $photoResult['lat'];
							$sequence['lng'] = $photoResult['lng'];
							$sequence['author'] = $segment['author'];
							$sequence['date'] = $segment['date'];
							$sequence['photo_no'] = $segment['photo_no'];
							$sequences[] = $sequence;
						}
						
						$result['sequences'] = $sequences;
					} else {
						return false;
					}
				}
			}
			return $result;
		}

		public function getNear($app, $lat, $lng, $distance) 
		{
			$resultGeometry = array();
			$resultSegment = array();
			$result = false;
			if(!empty($lat) && !empty($lng) && !empty($distance)) {
				$bbox = $this->getBoundingBox($lat, $lng, $distance);
				$sql ="SELECT
				OSV_G.from,
				OSV_G.to,
				OSV_G.way_id,
				OSV_G.lat,
				OSV_G.lng,
				3956 * 2 * ASIN(SQRT( POWER(SIN((:lat - abs(OSV_G.lat)) * 
				pi()/180 / 2),2) + COS(:lat * pi()/180 ) * COS(abs(OSV_G.lat) *  pi()/180) * POWER(SIN((:lng - OSV_G.lng) *  pi()/180 / 2), 2))) as distance
				FROM osv_geometry OSV_G
				WHERE OSV_G.lat <= :nw_lat AND OSV_G.lat >= :se_lat AND OSV_G.lng >= :nw_lng AND OSV_G.lng <= :se_lng
				";
				$queryParameters['lat'] = $lat;
				$queryParameters['lng'] = $lng;
				$queryParameters['distance'] = $distance;
				$queryParameters['nw_lat'] = $bbox['nw_lat'];
				$queryParameters['nw_lng'] = $bbox['nw_lng'];
				$queryParameters['se_lat'] = $bbox['se_lat'];
				$queryParameters['se_lng'] = $bbox['se_lng'];
				$sql .= " ORDER BY distance ASC LIMIT 1";
				
				$resultGeometry = $app['db']->fetchAll($sql, $queryParameters);

				$resultGeometry = count($resultGeometry)?$resultGeometry[0]:false;
				if ($resultGeometry) {
					
					$result['from'] = $resultGeometry['from'];
					$result['to'] = $resultGeometry['to'];
					$result['way_id'] = $resultGeometry['way_id'];
					$sql = " SELECT 
					OSV_S.count_active_photos as photo_no,
					OSV_S.distance as distance,
					OSV_S.address as address,
					OSV_U.username AS author,
					OSV_S.date_added AS date,
					CONCAT('".PATH_FILES_PHOTO."', '/',  YEAR(OSV_S.date_added),'/', MONTH(OSV_S.date_added),'/', DAY(OSV_S.date_added),'/lth/') as photo_path,
					OSV_SS.sequence_id
					FROM osv_sequence_segment OSV_SS ";
					$sql .= " LEFT JOIN osv_sequence AS OSV_S ON OSV_S.id = OSV_SS.sequence_id ";
					$sql .= " LEFT JOIN osv_users AS OSV_U ON OSV_U.id = OSV_S.user_id ";
					$sql .= " WHERE OSV_SS.from = :from AND OSV_SS.to = :to AND OSV_SS.way_id = :way_id ";
					$sql .= " GROUP BY OSV_SS.sequence_id ";
					$queryParameters['from'] = $resultGeometry['from'];
					$queryParameters['to'] = $resultGeometry['to'];
					$queryParameters['way_id'] = $resultGeometry['way_id'];
					$resultSegment = $app['db']->fetchAll($sql, $queryParameters);
					 if (count($resultSegment)) {
						$sequences = array();
						foreach($resultSegment as $segment) {
							$sql = "
							SELECT
								sequence_index as sequence_index,
								IF(match_lat IS NOT NULL, match_lat, lat) AS lat,
								IF(match_lng IS NOT NULL, match_lng, lng) AS lng,
								name,
								sequence_id,
								sequence_index, 
								3956 * 2 * ASIN(SQRT( POWER(SIN((:lat - abs(lat)) * pi()/180 / 2),2) + COS(:lat * pi()/180 ) * COS(abs(lat) *  pi()/180) * POWER(SIN((:lng - lng) *  pi()/180 / 2), 2))) as distance
							FROM osv_photos
							WHERE sequence_id = :sequence_id
							ORDER BY distance ASC 
							LIMIT 1";
							$queryParameters['sequence_id'] = $segment['sequence_id'];
							$photoResult = $app['db']->fetchAll($sql, $queryParameters);
							$photoResult = count($photoResult)?$photoResult[0]:false;
							$sequence = array();
							$sequence['sequence_id'] = $segment['sequence_id'];
							$sequence['photo'] = $segment['photo_path'].$photoResult['name'];
							$sequence['sequence_index'] = $photoResult['sequence_index'];
							$sequence['lat'] = $photoResult['lat'];
							$sequence['lng'] = $photoResult['lng'];
							$sequence['distance'] = $segment['distance'];
							$sequence['address'] = $segment['address'];
							$sequence['author'] = $segment['author'];
							$sequence['date'] = date('m.d.Y', strtotime($segment['date']));
							$sequence['hour'] = date('h:i A', strtotime($segment['date']));
							$sequence['photo_no'] = $segment['photo_no'];
							$sequences[] = $sequence;
						}
						$result['lat'] = $sequences[0]['lat'];
						$result['lng'] = $sequences[0]['lng'];
						$result['sequences'] = $sequences;
					} else {
						return false;
					}
				}
			}
			return $result;
		}

		 function getBoundingBox($lat, $lng, $distance) {
			// distance is in km.
			$radius = 6378.1;
			//North West latitude
			$boundingBox['nw_lat']= rad2deg(asin(sin(deg2rad($lat)) * cos($distance / $radius) + cos(deg2rad($lat)) * sin($distance / $radius) * cos(deg2rad(315))));
			//North West longitude 
			$boundingBox['nw_lng'] = rad2deg(deg2rad($lng) + atan2(sin(deg2rad(315)) * sin($distance / $radius) * cos(deg2rad($lat)), cos($distance / $radius) - sin(deg2rad($lat)) * sin(deg2rad($boundingBox['nw_lat']))));
			//South Est  latitude
			$boundingBox['se_lat']= rad2deg(asin(sin(deg2rad($lat)) * cos($distance / $radius) + cos(deg2rad($lat)) * sin($distance / $radius) * cos(deg2rad(135))));
			//South East longitude 
			$boundingBox['se_lng'] = rad2deg(deg2rad($lng) + atan2(sin(deg2rad(135)) * sin($distance / $radius) * cos(deg2rad($lat)), cos($distance / $radius) - sin(deg2rad($lat)) * sin(deg2rad($boundingBox['se_lat']))));
			//print_r($boundingBox); die();
			return $boundingBox;
	  
	  	}

	}