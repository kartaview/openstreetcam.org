import { IAlert } from './alert.interface';

export class Alert implements IAlert {
  id;
  type;
  message;
}
