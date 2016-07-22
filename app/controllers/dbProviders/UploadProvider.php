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


	class UploadProvider{
		/**
		 * @var string|null
		 */
		public $type = null;
		/**
		 * @var file|null
		 */
		public $file = null;
		/**
		 * @var string|null
		 */
		public $unicFileName = null;
		
		public function __construct($file = null, $type = 'photo'){
			$this->setFile($file);
			$this->setType($type);
		}


		public function setType($value = null){
			if(isset($value) && !empty($value)){
				if ($value == 'photo' || $value == 'voice' || $value == 'meta' || $value == 'video') {
					$this->type  = $value;
				}
			}
			return true;
		}
		public function setFile($value = null){
			if(isset($value) && !empty($value)){
			}
			$this->file  = $value;
			return true;
		}
		
		public function upload($path, $identifier = null) {
			//TODO: refactor this script for duplicate code 
			$filename = "";
			$filenameThumb = "";
			$filenameLThumb = "";
			if( !is_null($identifier)) {
				$filename = $identifier."_";
				$filenameThumb = $identifier."_";
				$filenameLThumb = $identifier."_";
			}
			if ($this->type == 'photo' ) {
				/*if(!in_array($this->file->getClientMimeType(), array('image/jpeg',  'image/pjpeg'))){
					throw new Exception(API_CODE_INVALID_REQUEST_BODY, 613);
				}*/
				$pathOri =  $path.'/ori';
				$pathTh =  $path.'/th';
				$pathLTh =  $path.'/lth';
				try{
					$ext = strtolower( $this->file->getClientOriginalExtension());
					$uniqId = uniqid();
					$filename .= substr(md5($this->file->getClientOriginalName()),0 , 5) .'_' . $uniqId . '.'.$ext;
					$filenameThumb .= substr(md5($this->file->getClientOriginalName()),0 , 5) .'_' . $uniqId . '.'.$ext;
					$filenameLThumb .= substr(md5($this->file->getClientOriginalName()),0 , 5) .'_' . $uniqId . '.'.$ext;
					//$filenameBlurred = substr(md5($this->file->getClientOriginalName()),0 , 5) .'_' . $uniqId . '_bl.'.$ext;
					$this->file->move($pathOri,$filename);
					// Get new dimensions
					list($width, $height) = getimagesize($pathOri.'/'.$filename);
					$newWidth = 200;
					$newHeight = floor( $height * ( $newWidth / $width ) );
					$newLWidth = 1280;
					$newLHeight = floor( $height * ( $newLWidth / $width ) );
					$imageP = imagecreatetruecolor($newWidth, $newHeight);
					$imageLP = imagecreatetruecolor($newLWidth, $newLHeight);
					$image = imagecreatefromjpeg($pathOri.'/'.$filename);
					imagecopyresampled($imageP, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
					imagecopyresampled($imageLP, $image, 0, 0, 0, 0, $newLWidth, $newLHeight, $width, $height);
					
					//TBD: refactoring - rotate only original 
					// fix orientation
					$exif = exif_read_data($pathOri.'/'.$filename);
					if($exif && !empty($exif['Orientation'])) {
						switch($exif['Orientation']) {
						case 8:
					            $imageP = imagerotate($imageP,90,0);
					            $imageLP = imagerotate($imageLP,90,0);
					            $image = imagerotate($image,90,0);
					            break;
					          case 3:
					            $imageP = imagerotate($imageP,180,0);
					            $imageLP = imagerotate($imageLP,180,0);
					            $image = imagerotate($image,180,0);
					            break;
					         case 6:
					            $imageP = imagerotate($imageP,-90,0);
					            $imageLP = imagerotate($imageLP,-90,0);
					            $image = imagerotate($image,-90,0);
					            break;
					    }
					}
					
					imagejpeg($imageP, $pathTh.'/'.$filenameThumb, 100);
					imagejpeg($imageLP, $pathLTh.'/'.$filenameLThumb, 100);
					imagejpeg($image, $pathOri.'/'.$filename, 100);
					imagedestroy($image);
					imagedestroy($imageLP);
					imagedestroy($imageP);
					return $filename;
				} catch(Exception $e) {
					throw new Exception($e->getMessage(), 613);
				}
			} elseif($this->type == 'meta' ){ 
				try{
					$uniqId = uniqid();
					if( strpos($this->file->getClientMimeType(), 'zip') !==false){
						$tmpDir = $path."/tmp_".$filename.$uniqId;
						mkdir($tmpDir, 0777, true);
						$ext = strtolower( $this->file->getClientOriginalExtension());
						$filenameZip = $filename.substr(md5($this->file->getClientOriginalName()),0 , 5) .'_' . $uniqId . '.'.$ext;
						$filename .= substr(md5($this->file->getClientOriginalName()),0 , 5) .'_' . $uniqId . '.txt';
						$this->file->move($tmpDir,$filenameZip);
						//unzip
						$result = array();
						$zd = gzopen($tmpDir."/".$filenameZip, "rb");
						$fp = fopen($tmpDir."/".$filename, "wb");
						while(!gzeof($zd)){
							$contents = gzread($zd, 4096);
							fwrite($fp, $contents);
						}
						gzclose($zd);
						fclose($fp);
						$objects = scandir($tmpDir);
						foreach ($objects as $object) {
								if( 'txt' == substr($object, strrpos($object, '.')+1)){
									rename($tmpDir."/".$object, $path."/".$filename);
							}
						}
						$this->rrmdir($tmpDir);
					}
					elseif( strpos($this->file->getClientMimeType(), 'text') !== false) {
						$ext = strtolower( $this->file->getClientOriginalExtension());
						$filename .= substr(md5($this->file->getClientOriginalName()),0 , 5) .'_' . $uniqId . '.'.$ext;
						$this->file->move($path,$filename);
					} else {
						throw new Exception(API_CODE_INVALID_REQUEST_BODY, 613);
					}
					return $filename;
				} catch(Exception $e) {
					throw new Exception($e->getMessage(), 613);
				}
			}elseif($this->type == 'video' ){ 
				try{
					$uniqId = uniqid();
					if( strpos($this->file->getClientMimeType(), 'video/mp4') !==false){
						$ext = strtolower( $this->file->getClientOriginalExtension());
						$filename = $filename.substr(md5($this->file->getClientOriginalName()),0 , 5) .'_' . $uniqId . '.'.$ext;
						$this->file->move($path.'/video',$filename);
					} else {
						throw new Exception(API_CODE_INVALID_REQUEST_BODY, 613);
					}
					return $filename;
				} catch(Exception $e) {
					throw new Exception($e->getMessage(), 613);
				}
			}else{
				throw new Exception(API_CODE_INVALID_REQUEST_BODY, 613);
			}
			return;
		}
		private function rrmdir($dir) {
			if (is_dir($dir)) {
				$objects = scandir($dir);
				foreach ($objects as $object) {
					if ($object != "." && $object != "..") {
						if (filetype($dir."/".$object) == "dir"){
							$this->rrmdir($dir."/".$object);
						}else{
							unlink($dir."/".$object);
						}
					}
				}
				reset($objects);
				rmdir($dir);
			}
		}
}