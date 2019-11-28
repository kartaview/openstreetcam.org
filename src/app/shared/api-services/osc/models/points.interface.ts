export interface IPoints {
    clientTotal: number;
    countryCode: string;
    coverageTotal: number;
    id: number;
    obdMultiple: number;
    sequenceDate: string;
    signsTotal: number;
    stateCode: string;
    total: number;
    uploadHistoryId: number;

    matchAPIResponseV1(response: any): IPoints;
    matchAPIResponseV2(response: any): IPoints;
}
