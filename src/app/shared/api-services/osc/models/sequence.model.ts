import { IUserSequencesStatuses } from './userSequencesStatuses.interface';
import { UserSequencesStatuses } from './userSequencesStatuses.model';

import { ISequence, ESequenceType, ISequenceMetadata } from './sequence.interface';
import { UploadHistory } from './uploadHistory.model';

import { environment } from 'environments/environment';
import { SequenceAttachment } from './sequenceAttachment.model';
import { Photo } from './photo.model';

export class Sequence implements ISequence {
    id;
    userId;
    thumbName;
    dateAdded;
    dateAddedDay;
    dateProcessed;
    dateProcessedDay;
    imageProcessingStatus;
    currentLat;
    currentLng;
    nwLat;
    nwLng;
    seLat;
    seLng;
    countryCode;
    stateCode;
    address;
    sequenceType = ESequenceType.PHOTO;
    cameraFocus;
    status;
    countActivePhotos;
    distance;
    metaDataFilename;
    detectedSignsFilename;
    clientTotal;
    clientTotalDetails;
    obdInfo;
    deviceName;
    platformName;
    platformVersion;
    appVersion;
    reviewed;
    changes;
    recognitions;
    matched;
    uploadSource;
    storage;
    clearCache;
    syncStatus;
    countMetadata_photos;
    uploadStatus;
    processingStatus;
    metadataStatus;
    hasRawData = 0;
    countMetadataPhotos = 0;
    countMetadataVideos = 0;
    isRotating = false;
    owner = false;
    username;

    uploadHistory = undefined;

    data: any = undefined;

    attachment;
    attachments;
    photo;
    photos;

    matchAPIResponseV1(response: any): ISequence {
        this.address = response.address ? response.address : (response.location ? response.location : null);
        this.appVersion = response.app_version;
        this.id = parseInt(response.id, 10);
        this.userId = parseInt(response.user_id, 10);
        this.changes = response.changed;
        this.clientTotal = response.client_total;
        this.countryCode = response.country_code;
        this.countActivePhotos = response.photo_no ? response.photo_no : response.count_active_photos;
        this.currentLat = response.current_lat;
        this.currentLng = response.current_lng;
        this.dateAdded = response.date_added;
        this.distance = response.distance;
        this.imageProcessingStatus = response.image_processing_status;
        this.isRotating = response.is_rotatinc;
        this.metaDataFilename = environment.baseUrl + '/' + response.meta_data_filename;
        this.nwLat = response.nw_lat;
        this.nwLng = response.nw_lng;
        this.obdInfo = response.obd_info;
        this.owner = response.owner;
        this.platformName = response.platform_name ? response.platform_name : response.platform;
        this.platformVersion = response.platform_version;
        this.recognitions = response.recognitions;
        this.reviewed = response.reviewed;
        this.seLat = response.se_lat;
        this.seLng = response.se_lng;
        this.username = response.user;
        this.thumbName = environment.baseUrl + '/' + response.thumb_name;
        this.uploadHistory = null;

        if (response.upload_history) {
            this.uploadHistory = new UploadHistory();
            this.uploadHistory.matchAPIResponseV1(response.upload_history);
        }

        return this;
    }

    matchAPIResponseV2(response: any): ISequence {
        this.id = parseInt(response.id, 10);
        this.userId = parseInt(response.userId, 10);
        this.dateAdded = response.dateAdded;
        this.currentLat = response.currentLat;
        this.currentLng = response.currentLng;
        this.countryCode = response.countryCode;
        this.stateCode = response.stateCode;
        this.address = response.address;
        this.sequenceType = response.sequenceType === 'vdb' ? ESequenceType.VDB : (response.isVideo === '1' ?
            ESequenceType.VIDEO : ESequenceType.PHOTO);
        this.countActivePhotos = parseInt(response.countActivePhotos, 10);
        this.distance = parseFloat(response.distance);

        this.metaDataFilename = response.metaDataFilename;
        this.obdInfo = response.obdInfo === '1' ? true : false;


        this.deviceName = response.deviceName;
        this.platformName = response.platformName;
        this.platformVersion = response.platformVersion;
        this.appVersion = response.appVersion;
        this.matched = response.matched === 'yes' ? true : false;
        this.uploadSource = response.uploadSource;
        this.storage = response.storage;
        this.countMetadataPhotos = parseInt(response.countMetadataPhotos, 10);
        this.uploadStatus = response.uploadStatus;
        this.processingStatus = response.processingStatus;
        this.metadataStatus = response.metadataStatus;
        this.countMetadataVideos = parseInt(response.countMetadataVideos, 10);
        this.status = response.status;

        return this;
    }
}

export class SequenceMetadata implements ISequenceMetadata {
    hasMoreData;
    data = [];
    sequencesStatus: IUserSequencesStatuses;

    matchAPIResponseV1(json: any, itemsPerPage: number, page: number): ISequenceMetadata {
        this.data = [];
        this.hasMoreData = false;
        if (json) {
            json.currentPageItems.forEach((responseItem) => { // requestOptions['ipp']
                const sequence = new Sequence();
                this.data.push(sequence.matchAPIResponseV1(responseItem));
            });
            this.hasMoreData = (json.totalFilteredItems - (itemsPerPage * page)) > 0;
            this.sequencesStatus = new UserSequencesStatuses();
            this.sequencesStatus.uploading = json.tracksStatus.uploading;
            this.sequencesStatus.processing = json.tracksStatus.processing;

        }
        return this;
    }

    matchAPIResponseV2(response: any): ISequenceMetadata {
        this.data = [];
        this.hasMoreData = false;
        if (response) {
            response.result.forEach((responseItem) => {
                const sequence = new Sequence();
                this.data.push(sequence.matchAPIResponseV2(responseItem));
            });
            this.hasMoreData = response.hasMoreData;
        }
        return this;
    }
}
