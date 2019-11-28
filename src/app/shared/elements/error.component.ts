import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Location } from '@angular/common';

/**
 * This class represents the navigation bar component.
 */
@Component({
  moduleId: module.id,
  selector: 'osc-error',
  templateUrl: 'error.component.html',
  styleUrls: ['error.component.css'],
})
export class AppErrorComponent implements OnInit {
  @Input() title = 'Invalid error';
  @Input() backButtonEnabled = true;
  @Input() reloadButtonEnabled = true;
  @Input() level = 'fatal'; // debug/info/warning/error/fatal
  @Output() reload = new EventEmitter();
  public hasReload = false;
  public hasBack = true;

  constructor(private location: Location) {
    if (this.title !== 'fatal' && this.title !== 'error' && this.title !== 'warning' && this.title !== 'info' && this.title !== 'debug') {
      this.title = 'fatal';
    }
  }
  ngOnInit() {
    this.hasReload = this.reloadButtonEnabled && this.reload.observers.length > 0;
    this.hasBack = this.backButtonEnabled;
  }
  reloadCallback() {
    this.reload.emit();
  }
  goBack() {
    this.location.back();
  }
}
