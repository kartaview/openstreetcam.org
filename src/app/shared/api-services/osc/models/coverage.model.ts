import { ICoverage } from './coverage.interface';

export class Coverage implements ICoverage {
    coverageDistance;
    coveragePhotosCount;
    coveragePoints;
    coverageValue;

    matchAPIResponseV1(response: any): ICoverage {
        this.coverageDistance = response.coverage_distance;
        this.coveragePhotosCount = response.coverage_photos_count;
        this.coveragePoints = response.coverage_points;
        this.coverageValue = response.coverage_value;
        return this;
    }
    matchAPIResponseV2(response: any): ICoverage {
        return this;
    }
}
