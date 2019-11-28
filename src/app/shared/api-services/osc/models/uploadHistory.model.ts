import { IUploadHistory } from './uploadHistory.interface';
import { ICoverage } from './coverage.interface';
import { IPoints } from './points.interface';
import { Coverage } from './coverage.model';
import { Points } from './points.model';

export class UploadHistory implements IUploadHistory {
    coverage;
    distance;
    hasObd;
    id;
    points;
    sequenceId;
    signs;
    userCategory;
    userId;

    matchAPIResponseV1(response: any): IUploadHistory {
        this.coverage = [];
        if (response.coverage) {
            response.coverage.forEach(responseItem => {
                const coverage = new Coverage();
                coverage.matchAPIResponseV1(responseItem);
                if (coverage.coverageValue === '-') {
                    this.coverage.unshift(coverage);
                } else {
                    this.coverage.push(coverage);
                }

            });
        }
        this.distance = response.distance;
        this.hasObd = response.has_obd;
        this.id = response.id;
        this.points = null;
        if (response.points) {
            this.points = new Points();
            this.points.matchAPIResponseV1(response.points);
        }
        this.sequenceId = response.sequence_id;
        this.signs = response.signs;
        this.userCategory = response.user_category;
        this.userId = parseInt(response.user_id, 10);
        return this;
    }
    matchAPIResponseV2(response: any): IUploadHistory {
        return this;
    }

}
