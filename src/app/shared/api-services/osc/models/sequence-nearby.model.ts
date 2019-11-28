import { ISequenceNearby } from './sequence-nearby.interface';
import { Sequence } from './sequence.model';

import { environment } from 'environments/environment';

export class SequenceNearby implements ISequenceNearby {
  from;
  lat;
  lng;
  to;
  way_id;
  sequences = [];

  matchAPIResponseV1(response: any): ISequenceNearby {
    this.from = response.from;
    this.lat = response.lat;
    this.lng = response.lng;
    this.to = response.to;
    this.way_id = response.way_id;
    response.sequences.forEach((seqRes) => {
      const seq = new Sequence();
      seq.id = parseInt(seqRes.sequence_id, 10);
      seq.thumbName = environment.baseUrl + '/' + seqRes.photo;
      seq.address = seqRes.address;
      seq.username = seqRes.author;
      seq.dateAdded = seqRes.date + ' ' + seqRes.hour;
      seq.currentLat = seqRes.lat;
      seq.currentLng = seqRes.lng;
      seq.distance = seqRes.distance;
      seq.countActivePhotos = seqRes.photo_no,
        seq.data = {
          sequenceIndex: seqRes.sequence_index,
        }
        this.sequences.push(seq);
    });

    return this;
  }
  matchAPIResponseV2(response: any): ISequenceNearby {
    return this;
  }

}
