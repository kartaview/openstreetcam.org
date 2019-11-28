export interface ISequenceRequest {
  userId?: number;
  lat?: number;
  lng?: number;
  distance?: number;
  myTracks?: boolean;
  filterUserNames?: string;
  userName?: string;
  join?: string;
  page?: number;
  ipp?: number;
}
