import { IUploadHistory } from './uploadHistory.interface';

export enum ESequenceType {
    PHOTO = 'PHOTO',
    VIDEO = 'VIDEO',
    VDB = 'VDB',
}

export interface ISequence {
    id: number;
    userId: number;
    thumbName: string;
    dateAdded: string;
    dateAddedDay: string;
    dateProcessed: string;
    dateProcessedDay: string;
    imageProcessingStatus: string;
    currentLat: number;
    currentLng: number;
    nwLat: number;
    nwLng: number;
    seLat: number;
    seLng: number;
    countryCode: string;
    stateCode: string;
    address: string;
    sequenceType: ESequenceType;
    cameraFocus: number;
    status: string;
    countActivePhotos: number;
    distance: number;
    metaDataFilename: string;
    detectedSignsFilename: string;
    clientTotal: number;
    clientTotalDetails: number;
    obdInfo: boolean;
    deviceName: string;
    platformName: string;
    platformVersion: string;
    appVersion: string;
    reviewed: number;
    changes: number;
    recognitions: number;
    matched: string;
    uploadSource: string;
    storage: string;
    clearCache: number;
    syncStatus: string;
    countMetadata_photos: number;
    uploadStatus: string;
    processingStatus: string;
    metadataStatus: string;
    hasRawData: number;
    countMetadataPhotos: number;
    countMetadataVideos: number;
    isRotating: boolean;
    owner: boolean;
    username: string;
    uploadHistory: IUploadHistory;

    data?: any;

    attachment?: any; // ISequenceAttachment Circular Issue
    attachments?: any[]; // ISequenceAttachment Circular Issue

    photo?: any; // IPhoto Circular Issue
    photos?: any[]; // IPhoto Circular Issue


    matchAPIResponseV1(response: any): ISequence;
    matchAPIResponseV2(response: any): ISequence;
}

export interface ISequenceMetadata {
    hasMoreData: boolean;
    data: ISequence[];

    matchAPIResponseV2(response: any[]): ISequenceMetadata;
}
