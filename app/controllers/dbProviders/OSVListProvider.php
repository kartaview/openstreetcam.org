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


	class OSVListProvider{
		/**
		*@var object
		*/
		public $sequenceList = array();
		public $sequenceCount;
		public $photoInfo = '';
		
		public function __construct() {
			$this->photoInfo = "
				OSV_P.id, 
				OSV_P.sequence_id, 
				OSV_P.sequence_index,
				OSV_P.lat, 
				OSV_P.lng,
				CONCAT('".PATH_FILES_PHOTO."', '/',  YEAR(OSV_S.date_added),'/', MONTH(OSV_S.date_added),'/', DAY(OSV_S.date_added),'/ori/', OSV_P.name) as name, 
				CONCAT('".PATH_FILES_PHOTO."', '/',  YEAR(OSV_S.date_added),'/', MONTH(OSV_S.date_added),'/', DAY(OSV_S.date_added),'/lth/', OSV_P.name) as lth_name, 
				CONCAT('".PATH_FILES_PHOTO."', '/',  YEAR(OSV_S.date_added),'/', MONTH(OSV_S.date_added),'/', DAY(OSV_S.date_added),'/th/', OSV_P.name) as th_name, 
				DATE_FORMAT(OSV_P.date_added, '%Y-%m-%d % (%H:%i)') AS date_added,  
				UNIX_TIMESTAMP(OSV_P.date_added) AS timestamp,  
				OSV_P.match_segment_id,
				OSV_P.match_lat, 
				OSV_P.match_lng, 
				OSV_P.headers AS heading, 
				OSV_P.gps_accuracy ";
		}

		/*
		 * get all sequence values
		 * 
		 * @param  string			username
		 * @param  string			location
		 * @param  string			startDate
		 * @param  string			endDate
		 * @param  float			bbTopLeftLat
		 * @param  float			bbTopLeftLng
		 * @param  float			bbBottomRightLat
		 * @param  float			bbBottomRightLng
		 * @param  string			platformName
		 * @param  bool			obdInfo
		 * @param  int			page
		 * @param  string			ipp
		 *
		 * 
		*/
		public function get(Application $app,  $username = null, $location = null, $startDate = null, $endDate = null,
				$bbTopLeftLat = null, $bbTopLeftLng = null, $bbBottomRightLat = null, $bbBottomRightLng = null,
				$platformName = null, $obdInfo = null,
				$page = null, $ipp = null,  $userId = null){
			
			$schema = $app['db']->getSchemaManager();
			
			if(empty($ipp)) {
				$ipp = 25;
			}
			if(!empty($page)) {
				$offset = ($page - 1) * $ipp;
			} else {
				$offset = 0;
			}
			$queryParameters = array();
			$whereQuery = " WHERE OSV_S.status='active' AND OSV_S.count_active_photos > 0 ";
			$limitQuery = " LIMIT $offset, $ipp ";
			
			if(!empty($username)) {
				$whereQuery .=" AND LOWER(OSV_U.username) LIKE LOWER(:username)";
				$queryParameters['username'] = "%$username%";
			}
			if(!empty($userId)) {
				$whereQuery .=" AND OSV_S.user_id =  :user_id ";
				$queryParameters['user_id'] = "$userId";
			}
			if(!empty($location)) {
				if (strtolower($location) != 'other') {
					$whereQuery .=" AND LOWER(OSV_S.country_code) LIKE LOWER(:location)";
					$queryParameters['location'] = $location;
				} else {
					$whereQuery .=" AND LOWER(OSV_S.country_code) NOT IN ('uk', 'ro', 'de', 'us' )";
				}
			}
			if(!empty($startDate)) {
				$whereQuery .=" AND DATE(OSV_S.date_added) >= :start_date";
				$queryParameters['start_date'] = $startDate;
			}
			if(!empty($endDate)) {
				$whereQuery .=" AND DATE(OSV_S.date_added) <= :end_date";
				$queryParameters['end_date'] = $endDate;
			}
			if(!empty($bbTopLeftLat)) {
				$whereQuery .=" AND OSV_S.current_lat <= :bb_top_left_lat";
				$queryParameters['bb_top_left_lat'] = $bbTopLeftLat;
			}
			if(!empty($bbTopLeftLng)) {
				$whereQuery .=" AND OSV_S.current_lng >= :bb_top_left_lng";
				$queryParameters['bb_top_left_lng'] = $bbTopLeftLng;
			}
			if(!empty($bbBottomRightLat)) {
				$whereQuery .=" AND OSV_S.current_lat >= :bb_bottom_right_lat";
				$queryParameters['bb_bottom_right_lat'] = $bbBottomRightLat;
			}
			if(!empty($bbBottomRightLng)) {
				$whereQuery .=" AND OSV_S.current_lng <= :bb_bottom_right_lng";
				$queryParameters['bb_bottom_right_lng'] = $bbBottomRightLng;
			}
			if(!empty($platformName)) {
				$whereQuery .=" AND OSV_S.platform_name LIKE :platform_name";
				$queryParameters['platform_name'] = $platformName;
			}
			if(!is_null($obdInfo)){
				$whereQuery .=" AND OSV_S.obd_info = :obd_info";
				$queryParameters['obd_info'] = $obdInfo;
			}
			
			$querySelect = "SELECT OSV_S.id, DATE_FORMAT(OSV_S.date_added, '%Y-%m-%d % (%H:%i)') AS date_added, 
				 OSV_S.country_code,  OSV_S.current_lat,  OSV_S.current_lng, 
				 OSV_S.nw_lat, OSV_S.nw_lng, OSV_S.se_lat, OSV_S.se_lng, 
				 OSV_S.address AS location, OSV_S.count_active_photos AS photo_no, OSV_S.distance,
				IF(OSV_S.image_processing_status LIKE 'VIDEO_SPLIT' , 'UPLOAD_FINISHED', OSV_S.image_processing_status) as image_processing_status,
				OSV_S.obd_info, OSV_S.platform_name, OSV_S.platform_version, OSV_S.app_version,
				OSV_S.reviewed, OSV_S.changes, OSV_S.recognitions,
				OSV_S.user_id, 
				CONCAT('".PATH_FILES_PHOTO."', '/',  YEAR(OSV_S.date_added),'/', MONTH(OSV_S.date_added),'/', "
					. "DAY(OSV_S.date_added),'/', OSV_S.meta_data_filename) as meta_data_filename, "
					. "CONCAT('".PATH_FILES_PHOTO."', '/',  YEAR(OSV_S.date_added),'/', MONTH(OSV_S.date_added),'/', "
					. "DAY(OSV_S.date_added), '/th/', OSV_PH.name) as thumb_name ";
				
			$queryBase = " FROM osv_sequence OSV_S 
			INNER JOIN  osv_users OSV_U ON OSV_S.user_id = OSV_U.id  
			";
			$queryCount = "SELECT COUNT(*) AS total " . $queryBase.$whereQuery;

			$query = $querySelect. $queryBase . " LEFT JOIN osv_photos OSV_PH ON OSV_S.id = OSV_PH.sequence_id ".$whereQuery." GROUP BY OSV_S.id ORDER BY OSV_S.id DESC " . $limitQuery;

        if ($schema->tablesExist('osv_sequence')) {
            $this->sequenceCount = $app['db']->fetchArray($queryCount, $queryParameters);
            $this->sequenceList = $app['db']->fetchAll($query, $queryParameters);
        }
        // else empty result
        return $this;
    }

    /*
     * get all sequence tracks values
     *
     * @param  float			bbTopLeftLat
     * @param  float			bbTopLeftLng
     * @param  float			bbBottomRightLat
     * @param  float			bbBottomRightLng
     *
     *
    */
    public function getTracksOld(Application $app, $bbTopLeftLat = null, $bbTopLeftLng = null, $bbBottomRightLat = null, $bbBottomRightLng = null, 
			$obdInfo = null, $page = null, $ipp = null, $requestedParams = null)
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

        $userQuery = "";
        if ($userId) $userQuery = "( user_id = '$userId' AND image_processing_status != 'NEW' AND status = 'active' "
            . "AND :bb_se_lat <= nw_lat AND :bb_nw_lat >= se_lat AND :bb_se_lng >= nw_lng AND :bb_nw_lng <= se_lng ) OR ";

        $queryParameters = array();
        $whereQuery = " WHERE ($userQuery ( image_processing_status = 'PROCESSING_FINISHED' AND status = 'active' "
            . "AND :bb_se_lat <= nw_lat AND :bb_nw_lat >= se_lat AND :bb_se_lng >= nw_lng AND :bb_nw_lng <= se_lng )) ";
		
        $queryParameters['bb_nw_lat'] = $bbTopLeftLat;
        $queryParameters['bb_nw_lng'] = $bbTopLeftLng;
        $queryParameters['bb_se_lat'] = $bbBottomRightLat;
        $queryParameters['bb_se_lng'] = $bbBottomRightLng;

	if(!is_null($obdInfo)) {
		$whereQuery .=" AND obd_info = :obd_info";
		$queryParameters['obd_info'] = $obdInfo;
	}		
        $querySelect = "SELECT id as sequence_id, "
				. "user_id, "
				. "date_added, "
				. "address, "
				. "reviewed, "
				. "changes, "
				. "count_active_photos, "
				. "recognitions, "
				. "obd_info, "
				." CONCAT('".PATH_FILES_PHOTO."', '/',  YEAR(date_added),'/', MONTH(date_added),'/', "
					. "DAY(date_added),'/', meta_data_filename) as meta_data_filename  ";
	if ($requestedParams) {
		 $querySelect .=  ",". $requestedParams;
        }
        $queryBase = " FROM osv_sequence " . $whereQuery;
        $queryCount = "SELECT COUNT(*) AS total " . $queryBase;
        $query = $querySelect . $queryBase . " ORDER BY id ASC ".$limitQuery;
        
        if ($schema->tablesExist('osv_sequence')) {
            $this->sequenceCount = $app['db']->fetchArray($queryCount, $queryParameters);
            $this->sequenceList = $app['db']->fetchAll($query, $queryParameters);
        }

        // else empty result
        return $this;
    }

    public function getTracks(Application $app, $bbTopLeftLat = null, $bbTopLeftLng = null, $bbBottomRightLat = null, $bbBottomRightLng = null, 
			$obdInfo = null, $page = null, $ipp = null, $requestedParams = null)
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

        $userQuery = "";
        if ($userId) $userQuery = "( user_id = '$userId' AND image_processing_status != 'NEW' AND status = 'active' "
            . "AND :bb_se_lat <= nw_lat AND :bb_nw_lat >= se_lat AND :bb_se_lng >= nw_lng AND :bb_nw_lng <= se_lng ) OR ";

        $queryParameters = array();
        $whereQuery = " WHERE ($userQuery ( image_processing_status = 'PROCESSING_FINISHED' AND status = 'active' "
            . "AND :bb_se_lat <= nw_lat AND :bb_nw_lat >= se_lat AND :bb_se_lng >= nw_lng AND :bb_nw_lng <= se_lng )) ";
		
        $queryParameters['bb_nw_lat'] = $bbTopLeftLat;
        $queryParameters['bb_nw_lng'] = $bbTopLeftLng;
        $queryParameters['bb_se_lat'] = $bbBottomRightLat;
        $queryParameters['bb_se_lng'] = $bbBottomRightLng;

		if(!is_null($obdInfo)) {
			$whereQuery .=" AND obd_info = :obd_info";
			$queryParameters['obd_info'] = $obdInfo;
		}		
        $querySelect = "SELECT id as element_id, "
				. "user_id, "
				. "date_added, "
				. "address, "
				. "reviewed, "
				. "changes, "
				. "count_active_photos, "
				. "recognitions, "
				. "obd_info, "
				." CONCAT('".PATH_FILES_PHOTO."', '/',  YEAR(date_added),'/', MONTH(date_added),'/', "
					. "DAY(date_added),'/', meta_data_filename) as meta_data_filename  ";
		if ($requestedParams) {
			$querySelect .=  ",". $requestedParams;
        }
        $queryBase = " FROM osv_sequence " . $whereQuery;
        $queryCount = "SELECT COUNT(*) AS total " . $queryBase;
        $query = $querySelect . $queryBase . " ORDER BY id ASC ".$limitQuery;
        
        if ($schema->tablesExist('osv_sequence')) {
            $this->sequenceCount = $app['db']->fetchArray($queryCount, $queryParameters);
            $this->sequenceList = $app['db']->fetchAll($query, $queryParameters);
        }

        // else empty result
        return $this;
    }

    public function getTrackPoints(Application $app, $sequenceId, $matched = true)
    {
        $schema = $app['db']->getSchemaManager();

        if ($matched) {
        	$query = "SELECT match_lat as lat, match_lng as lng FROM osv_photos WHERE auto_img_processing_status = 'FINISHED' AND sequence_id = :sequenceId AND status = 'active' ORDER BY sequence_index ASC";
        } else {
        	$query = "SELECT lat, lng FROM osv_photos WHERE auto_img_processing_status = 'FINISHED' AND sequence_id = :sequenceId AND status = 'active' ORDER BY sequence_index ASC";
        }
        //$query = "SELECT match_lat AS lat, match_lng AS lng FROM osv_photos WHERE auto_img_processing_status = 'FINISHED' AND sequence_id = :sequenceId AND status = 'active' ORDER BY sequence_index ASC";
        $queryParameters['sequenceId'] = $sequenceId;
        if ($schema->tablesExist('osv_photos')) {
            return $app['db']->fetchAll($query, $queryParameters);
        }
        // else empty result
        return array();
    }


    public function getTracksStatus(Application $app, $userId = null, $status = 'active')
    {

        $schema = $app['db']->getSchemaManager();
        $queryParameters = array();
        $whereQuery = "WHERE s.status= :status  AND count_active_photos > 0   ";
	 	$queryParameters['status'] = "$status";
	 
        if (!empty($userId)) {
            $whereQuery .= " AND s.user_id =  :user_id ";
            $queryParameters['user_id'] = "$userId";
        }
 
        if ($schema->tablesExist('osv_sequence')) {
            $trackStatus = $app['db']->fetchAll("SELECT COUNT(s.id) as no, s.image_processing_status "
                . " FROM osv_sequence s INNER JOIN  osv_users u ON s.user_id = u.id "
                . $whereQuery
                . " GROUP BY s.image_processing_status ", $queryParameters);
            $result = array();
            foreach ($trackStatus as $status) {
                if ($status['image_processing_status'] == 'NEW') $result['uploading'] = $status['no'];
                if ($status['image_processing_status'] == 'UPLOAD_FINISHED') $result['processing'] = $status['no'];
            }
            return $result;
        }
        return false;

    }

    public function getRouteMatchedWay(Application $app, $wayId, $page = null, $ipp = null)
    {
        $schema = $app['db']->getSchemaManager();
        if (empty($ipp)) {
            $ipp = 10;
        }
        if (!empty($page)) {
            $offset = ($page - 1) * $ipp;
        } else {
            $offset = 0;
        }
        $queryParameters = array();
        $whereQuery = "WHERE match_segment_id = :match_segment_id ";
        $queryParameters['match_segment_id'] = $wayId;
        $limitQuery = " LIMIT $offset, $ipp ";
        $querySelect = "SELECT OSV_S.id, DATE_FORMAT(OSV_S.date_added, '%Y-%m-%d % (%H:%i)') AS date_added,  
				OSV_S.nw_lat, OSV_S.nw_lng, OSV_S.se_lat, OSV_S.se_lng, 
				OSV_S.count_active_photos AS photo_no,
				IF(OSV_S.image_processing_status LIKE 'VIDEO_SPLIT' , 'UPLOAD_FINISHED', OSV_S.image_processing_status) as image_processing_status,
				OSV_S.obd_info, OSV_S.platform_name, OSV_S.platform_version, OSV_S.app_version,
				CONCAT('".PATH_FILES_PHOTO."', '/',  YEAR(OSV_S.date_added),'/', MONTH(OSV_S.date_added),'/', "
					. "DAY(OSV_S.date_added),'/', OSV_S.meta_data_filename) as meta_data_filename  ";
				
			$queryBase = " FROM osv_sequence OSV_S INNER JOIN  osv_sequence_segments OSV_SS ON OSV_S.id = OSV_SS.sequence_id  " . $whereQuery;
			$queryCount = "SELECT COUNT(*) AS total " . $queryBase;
			$query = $querySelect. $queryBase . " ORDER BY OSV_S.id DESC " . $limitQuery;
			if ($schema->tablesExist('osv_sequence_segments') && $schema->tablesExist('osv_sequence')) {
				$this->sequenceCount = $app['db']->fetchArray($queryCount,$queryParameters);
				$this->sequenceList = $app['db']->fetchAll($query,$queryParameters);
			}
			return false;
		}

		
		public function getPhotos(Application $app, $bbTopLeftLat = null, $bbTopLeftLng = null, 
				$bbBottomRightLat = null, $bbBottomRightLng = null,  $heading = null, $wayId = null, $page = null, $ipp = null, $userId = null, $dateAdded = null, $returnUsername = null ){
			
			$this->sequenceCount = array();
			$this->sequenceList = 0;
			$schema = $app['db']->getSchemaManager();	
			$queryParameters = array();
			$whereQuery = "WHERE OSV_P.status = 'active' ";
			
			if(!empty($bbTopLeftLat)) {
				$whereQuery .=" AND OSV_P.lat <= :bb_top_left_lat";
				$queryParameters['bb_top_left_lat'] = $bbTopLeftLat;
			}
			if(!empty($bbTopLeftLng)) {
				$whereQuery .=" AND OSV_P.lng >= :bb_top_left_lng";
				$queryParameters['bb_top_left_lng'] = $bbTopLeftLng;
			}
			if(!empty($bbBottomRightLat)) {
				$whereQuery .=" AND OSV_P.lat >= :bb_bottom_right_lat";
				$queryParameters['bb_bottom_right_lat'] = $bbBottomRightLat;
			}
			if(!empty($bbBottomRightLng)) {
				$whereQuery .=" AND OSV_P.lng <= :bb_bottom_right_lng";
				$queryParameters['bb_bottom_right_lng'] = $bbBottomRightLng;
			}
			if(!empty($heading)) {
				$whereQuery .=" AND OSV_P.headers = :headers";
				$queryParameters['headers'] = $heading;
			}
			if(!empty($wayId)) {
				$whereQuery .=" AND OSV_P.match_segment_id = :match_segment_id";
				$queryParameters['match_segment_id'] = $wayId;
			}
			if(!empty($userId)) {
				$whereQuery .=" AND OSV_S.user_id = :user_id";
				$queryParameters['user_id'] = $userId;
			}
			if(!empty($dateAdded)) {
				$whereQuery .=" AND OSV_S.date_added >= :date_added";
				$queryParameters['date_added'] = $dateAdded;
			}
			if(empty($ipp)) {
				$ipp = 1000;
			}
			if(!empty($page)) {
				$offset = ($page - 1) * $ipp;
			} else {
				$offset = 0;
			}
			$limitQuery = " LIMIT $offset, $ipp ";
			$querySelect = "SELECT ".$this->photoInfo;
			$joinQuery = "";
			if ($userId || $returnUsername) {
				$joinQuery = " LEFT JOIN osv_users as OSV_U ON OSV_S.user_id = OSV_U.id ";
				$querySelect .= ", OSV_U.username as username ";
			}
				
			$queryBase = " FROM osv_sequence OSV_S INNER JOIN  osv_photos OSV_P ON OSV_S.id = OSV_P.sequence_id  " .$joinQuery. $whereQuery;
			$queryCount = "SELECT COUNT(*) AS total " . $queryBase;
			$query = $querySelect. $queryBase . " ORDER BY OSV_S.id DESC " . $limitQuery;
			
			if ($schema->tablesExist('osv_sequence_segments') && $schema->tablesExist('osv_sequence')) {
				$this->sequenceCount = $app['db']->fetchArray($queryCount,$queryParameters);
				$this->sequenceList = $app['db']->fetchAll($query,$queryParameters);
			}
			return false;
		}
		
	}