import { ISequence } from './sequence.interface';

export interface IPhoto {
    id: number;
    sequenceId: number;
    videoId: number;
    dateAdded: string;
    dateProcessed: string;
    dateProcessedDay: string;
    name: string;
    sequenceIndex: number;
    lat: number;
    lng: number;
    heading: number;
    visibility: string;
    autoImgProcessingStatus: string;
    status: string;
    gpsAccuracy: number;
    autoImgProcessingResult: string;
    matchLat: number;
    matchLng: number;
    matchSegmentId: number;
    from: number;
    to: number;
    wayId: number;
    storage: string;
    projection: string;
    fieldOfView: number;
    isUnwrapped: boolean;
    unwrapVersion: number;
    shotDate: string;
    videoIndex: number;
    hasObd: boolean;
    rawDataId: number;
    lthUrl: string;
    thUrl: string;
    procUrl: string;
    oriUrl: string;
    wrappedUrl: string;

    sequence: ISequence;

    matchAPIResponseV1(response: any): IPhoto;
    matchAPIResponseV2(response: any): IPhoto;
}
