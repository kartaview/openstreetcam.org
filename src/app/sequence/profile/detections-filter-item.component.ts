import {
  Component, Input, Output, EventEmitter
} from '@angular/core';

@Component({
  selector: 'osc-detections-filter-item',
  templateUrl: './detections-filter-item.component.html',
  styleUrls: ['./detections-filter-item.component.css']
})
export class DetectionsFilterItemComponent {
  @Input() disabled = false;
  @Input() autoDisable = false;
  @Input() notVerifiedCount = false;
  @Input() value = false;
  @Input() partialValue = false;
  @Input() hasPartialValue = false;
  @Input() label = '';
  @Input() hasCount = true;
  @Input() hint = null;

  private _count = 0;
  @Input()
  set count(count) {
    this._count = count;
    if (this.autoDisable) {
      this.disabled = (this._count === 0);
    }
  }
  get count() {
    return this._count;
  }

  @Output() change = new EventEmitter();

  @Input() hasExpand = false;
  @Input() expandStatus = false;
  @Output() expandCallback = new EventEmitter();

  constructor() { }

  checkboxClick() {
    if (!this.disabled) {
      this.change.emit();
    }
  }

}
