export interface ICoverage {
    coverageDistance: number;
    coveragePhotosCount: number;
    coveragePoints: number;
    coverageValue: string;

    matchAPIResponseV1(response: any): ICoverage;
    matchAPIResponseV2(response: any): ICoverage;
}
