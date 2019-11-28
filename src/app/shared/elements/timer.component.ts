import { Component, OnInit, Input, ElementRef, DoCheck } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'osc-timer',
  template: `{{ time }}`
})
export class TimerComponent implements DoCheck {

  public time: string;

  @Input()
  format: string;

  @Input()
  startTime = 0;
  isVisible = false;
  interval = null;
  constructor(private elementRef: ElementRef) { }

  ngDoCheck() {
    if (environment.UIDebug) {
      if (!(this.elementRef.nativeElement.offsetParent !== null)) {
        if (this.isVisible) {
          this.isVisible = false;
          clearInterval(this.interval);
        }
      } else {
        if (!this.isVisible) {
          this.isVisible = true;
          this.startTime = window.performance.now();
          this.interval = setInterval(() => {
            const currentTime = window.performance.now() - this.startTime;
            const date = new Date(currentTime);
            const currentElapsedSeconds = date.getSeconds() + (date.getMilliseconds() / 1000);
            const currentElapsedMinutes = date.getMinutes();
            this.time = this.format.replace('%s', currentElapsedSeconds.toFixed(2) + ' seconds');
            this.time = this.time.replace('%m ',
              (currentElapsedMinutes > 1 ?
                currentElapsedMinutes + ' minutes ' :
                (currentElapsedMinutes > 0 ?
                  currentElapsedMinutes + ' minute ' : ''
                )
              )
            );
          }, 10)
        }
      }
    }
  }
}
