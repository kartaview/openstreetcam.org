-- This file is part of the openstreetview.org
-- Copyright ©2016, Telenav, Inc.  All Rights Reserved
--
-- The code is licensed under the LGPL Version 3 license 
-- http://www.gnu.org/licenses/lgpl-3.0.en.html.


-- SQL Dump
--
-- Host: localhost
-- Generation Time: Jul 22, 2016 at 03:56 PM
-- Server version: 5.5.44-MariaDB
-- PHP Version: 5.4.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `openstreetview`
--

-- --------------------------------------------------------

--
-- Table structure for table `osv_fileaccess`
--

CREATE TABLE IF NOT EXISTS `osv_fileaccess` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `status` varchar(45) NOT NULL DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `osv_geometry`
--

CREATE TABLE IF NOT EXISTS `osv_geometry` (
  `from` int(11) unsigned NOT NULL,
  `to` int(11) unsigned NOT NULL,
  `way_id` int(11) unsigned NOT NULL,
  `index` int(11) DEFAULT NULL,
  `lat` decimal(9,6) DEFAULT NULL,
  `lng` decimal(9,6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `osv_ip2location`
--

CREATE TABLE IF NOT EXISTS `osv_ip2location` (
  `ip_from` int(10) unsigned DEFAULT NULL,
  `ip_to` int(10) unsigned DEFAULT NULL,
  `country_code` char(2) COLLATE utf8_bin DEFAULT NULL,
  `country_name` varchar(64) COLLATE utf8_bin DEFAULT NULL,
  `region_name` varchar(128) COLLATE utf8_bin DEFAULT NULL,
  `city_name` varchar(128) COLLATE utf8_bin DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `osv_ip_monitor`
--

CREATE TABLE IF NOT EXISTS `osv_ip_monitor` (
  `id` int(11) NOT NULL,
  `date_added` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `algorithm` varchar(225) NOT NULL,
  `count_pictures` int(11) NOT NULL,
  `delta_t` int(11) NOT NULL COMMENT 'seconds',
  `reference_id` int(11) NOT NULL,
  `status` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `osv_photos`
--

CREATE TABLE IF NOT EXISTS `osv_photos` (
  `id` bigint(20) unsigned NOT NULL,
  `sequence_id` bigint(20) unsigned NOT NULL,
  `video_id` bigint(20) unsigned DEFAULT NULL COMMENT 'Source video id (key from osv_videos)',
  `date_added` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_added_day` date DEFAULT NULL,
  `date_processed` timestamp NULL DEFAULT NULL,
  `date_processed_day` date DEFAULT NULL,
  `name` varchar(30) NOT NULL,
  `sequence_index` int(11) unsigned DEFAULT '0',
  `lat` decimal(9,6) NOT NULL,
  `lng` decimal(9,6) NOT NULL,
  `headers` varchar(255) DEFAULT NULL,
  `visibility` enum('private','public') NOT NULL DEFAULT 'private',
  `auto_img_processing_status` enum('NEW','COPY_FAILD','PROCESSING','FINISHED','UNCLEAR') DEFAULT 'NEW',
  `status` enum('active','deleted') NOT NULL DEFAULT 'active',
  `gps_accuracy` decimal(10,4) DEFAULT NULL,
  `auto_img_processing_result` enum('BLURRED','ORIGINAL') DEFAULT NULL,
  `match_lat` float(18,15) DEFAULT NULL COMMENT 'Matching service response - returned lat ',
  `match_lng` float(18,15) DEFAULT NULL COMMENT 'Matching service response - returned lng',
  `match_segment_id` bigint(20) DEFAULT NULL COMMENT 'Matching service response - OSM segment id ',
  `from` int(11) unsigned DEFAULT NULL,
  `to` int(11) unsigned DEFAULT NULL,
  `way_id` int(11) unsigned DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `osv_segments`
--

CREATE TABLE IF NOT EXISTS `osv_segments` (
  `from` int(11) unsigned NOT NULL,
  `to` int(11) unsigned NOT NULL,
  `way_id` int(11) unsigned NOT NULL,
  `nw_lat` decimal(9,6) DEFAULT NULL,
  `nw_lng` decimal(9,6) DEFAULT NULL,
  `se_lat` decimal(9,6) DEFAULT NULL,
  `se_lng` decimal(9,6) DEFAULT NULL,
  `length` float(40,15) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `osv_sequence`
--

CREATE TABLE IF NOT EXISTS `osv_sequence` (
  `id` bigint(20) unsigned NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `date_added` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_added_day` date DEFAULT NULL,
  `date_processed` timestamp NULL DEFAULT NULL,
  `date_processed_day` date DEFAULT NULL,
  `image_processing_status` enum('NEW','VIDEO_SPLIT','UPLOAD_FINISHED','PROCESSING_FINISHED','PROCESSING_FAILED') NOT NULL DEFAULT 'NEW',
  `is_video` enum('0','1') NOT NULL DEFAULT '0' COMMENT 'If the sequence was uploaded as a set of videos this value is 1 ',
  `client_token` varchar(65) NOT NULL,
  `current_lat` decimal(9,6) DEFAULT NULL,
  `current_lng` decimal(9,6) DEFAULT NULL,
  `nw_lat` decimal(9,6) DEFAULT NULL,
  `nw_lng` decimal(9,6) DEFAULT NULL,
  `se_lat` decimal(9,6) DEFAULT NULL,
  `se_lng` decimal(9,6) DEFAULT NULL,
  `country_code` varchar(4) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `status` enum('active','deleted') NOT NULL DEFAULT 'active',
  `count_active_photos` int(11) DEFAULT NULL COMMENT 'number of not deleted photos from the trip',
  `track` longtext,
  `match_track` longtext COMMENT 'Encoded track from matching server results (match_lat, match_lng)',
  `distance` decimal(10,2) DEFAULT NULL,
  `meta_data_filename` varchar(30) DEFAULT NULL,
  `obd_info` tinyint(1) DEFAULT NULL,
  `platform_name` varchar(100) DEFAULT NULL,
  `platform_version` varchar(25) DEFAULT NULL,
  `app_version` varchar(25) DEFAULT NULL,
  `reviewed` int(11) DEFAULT NULL COMMENT 'Sequence info - how many photos were reviewed. Set by QT editor ',
  `changes` int(11) DEFAULT NULL COMMENT 'Sequence info from QT editor',
  `recognitions` int(11) DEFAULT NULL COMMENT 'Sequence info from QT editor',
  `matched` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `osv_sequence_segment`
--

CREATE TABLE IF NOT EXISTS `osv_sequence_segment` (
  `from` int(11) unsigned NOT NULL,
  `to` int(11) unsigned NOT NULL,
  `way_id` int(11) unsigned NOT NULL,
  `sequence_id` bigint(20) unsigned DEFAULT NULL,
  `index` int(11) DEFAULT NULL,
  `start_offset` float(9,6) DEFAULT NULL,
  `end_offset` float(9,6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `osv_sequence_segments`
--

CREATE TABLE IF NOT EXISTS `osv_sequence_segments` (
  `sequence_id` bigint(20) unsigned NOT NULL,
  `match_segment_id` bigint(20) unsigned NOT NULL COMMENT 'Routing server respons - osm segment id '
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Relation table between a stored sequence and an osm segment id ';

-- --------------------------------------------------------

--
-- Table structure for table `osv_sequence_tracks`
--

CREATE TABLE IF NOT EXISTS `osv_sequence_tracks` (
  `id` bigint(20) unsigned NOT NULL,
  `sequence_id` bigint(20) NOT NULL,
  `current_lat` decimal(9,6) NOT NULL,
  `current_lng` decimal(9,6) NOT NULL,
  `nw_lat` decimal(9,6) NOT NULL,
  `nw_lng` decimal(9,6) NOT NULL,
  `se_lat` decimal(9,6) NOT NULL,
  `se_lng` decimal(9,6) NOT NULL,
  `track` longtext CHARACTER SET utf8 NOT NULL,
  `date_added` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf16;

-- --------------------------------------------------------

--
-- Table structure for table `osv_users`
--

CREATE TABLE IF NOT EXISTS `osv_users` (
  `id` bigint(20) unsigned NOT NULL,
  `type` enum('sko','osm','anonymous') COLLATE utf8_unicode_ci NOT NULL,
  `external_user_id` bigint(20) unsigned DEFAULT NULL COMMENT 'IR user_id or OSM user_id or null',
  `username` varchar(100) CHARACTER SET utf8 DEFAULT NULL,
  `email` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'User account email',
  `email_date_request` datetime DEFAULT NULL,
  `role` varchar(100) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'ROLE_USER',
  `status` enum('active','deleted') COLLATE utf8_unicode_ci NOT NULL DEFAULT 'active',
  `status1` enum('active','deleted') COLLATE utf8_unicode_ci NOT NULL DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `osv_user_tokens`
--

CREATE TABLE IF NOT EXISTS `osv_user_tokens` (
  `id` int(11) unsigned NOT NULL,
  `username` varchar(100) NOT NULL,
  `token` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `osv_videos`
--

CREATE TABLE IF NOT EXISTS `osv_videos` (
  `id` bigint(20) unsigned NOT NULL,
  `sequence_id` bigint(20) NOT NULL,
  `date_added` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `name` varchar(30) CHARACTER SET utf8 NOT NULL,
  `sequence_index` int(10) unsigned NOT NULL,
  `status` enum('active','deleted') CHARACTER SET utf8 NOT NULL DEFAULT 'active',
  `processing_status` enum('NEW','SPLIT_FINISHED') NOT NULL DEFAULT 'NEW',
  `processing_split_result` enum('success','failed') CHARACTER SET utf8 DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf16;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `osv_fileaccess`
--
ALTER TABLE `osv_fileaccess`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `osv_geometry`
--
ALTER TABLE `osv_geometry`
  ADD KEY `SEGMENTS_FK_idx` (`from`,`to`,`way_id`),
  ADD KEY `LOCATION_IDX` (`lat`,`lng`);

--
-- Indexes for table `osv_ip2location`
--
ALTER TABLE `osv_ip2location`
  ADD KEY `idx_ip_from` (`ip_from`),
  ADD KEY `idx_ip_to` (`ip_to`),
  ADD KEY `idx_ip_from_to` (`ip_from`,`ip_to`);

--
-- Indexes for table `osv_ip_monitor`
--
ALTER TABLE `osv_ip_monitor`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `osv_photos`
--
ALTER TABLE `osv_photos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sequence_id` (`sequence_id`,`match_segment_id`),
  ADD KEY `SEQUENCE_ID_IDX` (`sequence_id`),
  ADD KEY `lat` (`lat`,`lng`),
  ADD KEY `LOCATION_IDX` (`sequence_id`,`lat`,`lng`),
  ADD KEY `name` (`name`),
  ADD KEY `date_added_day_index` (`date_added_day`),
  ADD KEY `date_processed_day_index` (`date_processed_day`);

--
-- Indexes for table `osv_segments`
--
ALTER TABLE `osv_segments`
  ADD PRIMARY KEY (`from`,`to`,`way_id`),
  ADD UNIQUE KEY `FROMTOWAYID_UQ` (`from`,`to`,`way_id`),
  ADD KEY `BBOX_IDX` (`nw_lat`,`nw_lng`,`se_lat`,`se_lng`);

--
-- Indexes for table `osv_sequence`
--
ALTER TABLE `osv_sequence`
  ADD PRIMARY KEY (`id`),
  ADD KEY `current_lat` (`current_lat`,`current_lng`),
  ADD KEY `LOCATION_IDX` (`nw_lat`,`nw_lng`,`se_lat`,`se_lng`),
  ADD KEY `meta_data_filename` (`meta_data_filename`),
  ADD KEY `date_added_day_index` (`date_added_day`),
  ADD KEY `date_processed_day_index` (`date_processed_day`);

--
-- Indexes for table `osv_sequence_segment`
--
ALTER TABLE `osv_sequence_segment`
  ADD KEY `SEQUENCE_SEGMENTS_IDX` (`from`,`to`,`way_id`),
  ADD KEY `SEQUENCE_ID_IDX_idx` (`sequence_id`);

--
-- Indexes for table `osv_sequence_segments`
--
ALTER TABLE `osv_sequence_segments`
  ADD PRIMARY KEY (`sequence_id`,`match_segment_id`);

--
-- Indexes for table `osv_sequence_tracks`
--
ALTER TABLE `osv_sequence_tracks`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `osv_users`
--
ALTER TABLE `osv_users`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `osv_user_tokens`
--
ALTER TABLE `osv_user_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `USERID_FK_idx` (`username`);

--
-- Indexes for table `osv_videos`
--
ALTER TABLE `osv_videos`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `osv_ip_monitor`
--
ALTER TABLE `osv_ip_monitor`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `osv_photos`
--
ALTER TABLE `osv_photos`
  MODIFY `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `osv_sequence`
--
ALTER TABLE `osv_sequence`
  MODIFY `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `osv_sequence_tracks`
--
ALTER TABLE `osv_sequence_tracks`
  MODIFY `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `osv_users`
--
ALTER TABLE `osv_users`
  MODIFY `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `osv_user_tokens`
--
ALTER TABLE `osv_user_tokens`
  MODIFY `id` int(11) unsigned NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `osv_videos`
--
ALTER TABLE `osv_videos`
  MODIFY `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `osv_geometry`
--
ALTER TABLE `osv_geometry`
  ADD CONSTRAINT `SEGMENTS_FK` FOREIGN KEY (`from`, `to`, `way_id`) REFERENCES `osv_segments` (`from`, `to`, `way_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `osv_photos`
--
ALTER TABLE `osv_photos`
  ADD CONSTRAINT `SEQUENCE_ID_FK` FOREIGN KEY (`sequence_id`) REFERENCES `osv_sequence` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `osv_sequence_segment`
--
ALTER TABLE `osv_sequence_segment`
  ADD CONSTRAINT `SEQUENCE_ID_IDX` FOREIGN KEY (`sequence_id`) REFERENCES `osv_sequence` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `SEQUENCE_SEGMENTS_FK` FOREIGN KEY (`from`, `to`, `way_id`) REFERENCES `osv_segments` (`from`, `to`, `way_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
