import { IPoints } from './points.interface';

export class Points implements IPoints {
    clientTotal;
    countryCode;
    coverageTotal;
    id;
    obdMultiple;
    sequenceDate;
    signsTotal;
    stateCode;
    total;
    uploadHistoryId;

    matchAPIResponseV1(response: any): IPoints {
        this.clientTotal = response.client_total;
        this.countryCode = response.country_code;
        this.coverageTotal = response.coverage_total;
        this.id = response.id;
        this.obdMultiple = response.obd_multiple;
        this.sequenceDate = response.sequence_date;
        this.signsTotal = response.signs_total;
        this.stateCode = response.state_code;
        this.total = response.total;
        this.uploadHistoryId = response.upload_history_id;
        return this;
    }
    matchAPIResponseV2(response: any): IPoints {
        return this;
    }
}
