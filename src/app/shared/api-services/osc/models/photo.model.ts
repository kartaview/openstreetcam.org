import { IPhoto } from './photo.interface';
import { Sequence } from './sequence.model';
import { environment } from 'environments/environment';

export class Photo implements IPhoto {
    lthUrl;
    thUrl;
    procUrl;
    oriUrl;
    wrappedUrl;
    id;
    sequenceId;
    videoId;
    dateAdded;
    dateProcessed;
    dateProcessedDay;
    name;
    sequenceIndex;
    lat;
    lng;
    heading;
    visibility;
    autoImgProcessingStatus;
    status;
    gpsAccuracy;
    autoImgProcessingResult;
    matchLat;
    matchLng;
    matchSegmentId;
    from;
    to;
    wayId;
    storage;
    projection;
    fieldOfView;
    isUnwrapped;
    unwrapVersion;
    shotDate;
    videoIndex;
    hasObd;
    rawDataId;

    sequence;

    matchAPIResponseV1(response: any): IPhoto {
        this.dateAdded = response.date_added;
        /* if (typeof this.dateAdded === 'string') {
          this.dateAdded = this.dateAdded.replace(/-/g, '/');
        } */
        this.name = response.fileName;
        this.gpsAccuracy = response.gps_accuracy;
        this.heading = parseFloat(response.heading);
        this.id = parseInt(response.id, 10);
        this.lat = response.lat;
        this.lng = response.lng;
        this.lthUrl = environment.baseUrl + '/' + response.lth_name;
        this.matchLat = response.match_lat;
        this.matchLng = response.match_lng;
        this.procUrl = environment.baseUrl + '/' + (response.proc_name ? response.proc_name : response.lth_name.replace('lth', 'proc'));
        this.oriUrl = environment.baseUrl + '/' + (response.proc_name ? response.proc_name : response.lth_name.replace('lth', 'ori'));
        this.projection = response.projection;
        this.fieldOfView = parseInt(response.field_of_view, 10);
        this.isUnwrapped = parseInt(response.is_unwrapped, 10) === 1 ? true : false;
        this.unwrapVersion = response.unwrap_version;
        this.sequenceId = parseInt(response.sequence_id, 10);
        this.sequenceIndex = parseInt(response.sequence_index, 10);
        this.shotDate = response.shot_date;
        if (this.isUnwrapped) {
            this.wrappedUrl = environment.baseUrl + '/' + response.lth_name.replace('lth', 'wrapped_lth');
        }
        if (this.shotDate === '0000-00-00 00:00:00') {
            this.shotDate = null;
        }
        if (this.shotDate) {
            this.shotDate = this.shotDate.replace(/-/g, '/')
        }
        this.storage = response.storage;
        this.thUrl = environment.baseUrl + '/' + response.th_name;
        this.wayId = response.way_id;
        return this;
    }

    matchAPIResponseV2(response: any): IPhoto {
        this.dateAdded = response.dateAdded;
        /* if (typeof this.dateAdded === 'string') {
          this.dateAdded = this.dateAdded.replace(/-/g, '/');
        } */
        this.name = response.name;
        this.gpsAccuracy = response.gpsAccuracy;
        this.heading = parseFloat(response.heading);
        this.id = parseInt(response.id, 10);
        this.lat = response.lat;
        this.lng = response.lng;
        this.lthUrl = response.fileurlLTh;
        this.matchLat = response.matchLat;
        this.matchLng = response.matchLng;
        this.procUrl = response.fileurlProc;
        this.oriUrl = response.fileurlLTh ? response.fileurlLTh.replace('lth', 'ori') : undefined;
        this.projection = response.projection;
        this.fieldOfView = parseInt(response.fieldOfView, 10) || 0;
        this.isUnwrapped = parseInt(response.isUnwrapped, 10) === 1 ? true : false;
        this.unwrapVersion = response.unwrapVersion;
        this.sequenceId = typeof response.sequenceId === 'undefined' && response.sequence && response.sequence.id ?
            parseInt(response.sequence.id, 10) : parseInt(response.sequenceId, 10);
        this.sequenceIndex = parseInt(response.sequenceIndex, 10);
        this.shotDate = response.shotDate;
        if (this.isUnwrapped) {
            this.wrappedUrl = response.fileurlLTh ? response.fileurlLTh.replace('lth', 'wrapped_lth') : undefined;
        }
        if (this.shotDate === '0000-00-00 00:00:00') {
            this.shotDate = null;
        }
        if (this.shotDate) {
            this.shotDate = this.shotDate.replace(/-/g, '/')
        }
        this.storage = response.storage;
        this.thUrl = response.fileurlTh;
        this.wayId = response.wayId;
        if (response.sequence) {
            this.sequence = new Sequence();
            this.sequence.matchAPIResponseV2(response.sequence);
        }
        return this;
    }
}
