import { Component, Input } from '@angular/core';


/**
 * This class represents the lazy loaded UserComponent.
 */
@Component({
  moduleId: module.id,
  selector: 'osc-user-gamification-topbar',
  templateUrl: 'gamification-topbar.component.html',
  styleUrls: ['gamification-topbar.component.css']
})
export class UserGamificationTopBarComponent {
  _userData: any = {};
  userDataLoaded = false;
  levelPercentage = 0;
  levelGaugeRadius = 40;

  @Input()
  set userData(userData) {
    this._userData = userData || {};
    this.userDataLoaded = (userData && !(Object.keys(userData).length === 0) ? true : false);
    if (this.userDataLoaded && userData.gamification) {
      let val = parseInt(userData.gamification.levelProgressPercent, 10);

      if (val < 0) { val = 0; }
      if (val > 100) { val = 100; }

      const percentage = ((100 - val) / 100) * (Math.PI * (this.levelGaugeRadius * 2));
      this.levelPercentage = parseFloat(percentage.toFixed(3));
    }
  }
  get userData() { return this._userData; };


  /**
   * Creates an instance of the UserGamificationTopBarComponent
   */
  constructor() {

  }
}
