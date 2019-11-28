import { ICoverage } from './coverage.interface';
import { IPoints } from './points.interface';

export interface IUploadHistory {
    coverage: ICoverage[];
    distance: number;
    hasObd: number;
    id: number;
    points: IPoints;
    sequenceId: number;
    signs: any[];
    userCategory: string;
    userId: number;

    matchAPIResponseV1(response: any): IUploadHistory;
    matchAPIResponseV2(response: any): IUploadHistory;
}
