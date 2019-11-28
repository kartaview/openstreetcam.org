import { Component, HostBinding, Input, NgZone, ElementRef, ViewChild } from '@angular/core';
import { Router, RoutesRecognized } from '@angular/router';

import { overlayConfigFactory } from 'ngx-modialog';
import { Modal, BSModalContext } from 'ngx-modialog/plugins/bootstrap';

import { GetAppModalComponent } from '../modals/get-app.component';

import { environment } from '../../../environments/environment';

/**
 * This class represents the navigation bar component.
 */
@Component({
  moduleId: module.id,
  selector: 'osc-navbar',
  templateUrl: 'navbar.component.html',
  styleUrls: ['navbar.component.css'],
})
export class NavbarComponent {
  signDetectionsEnabled = true;

  public windowWidth = 0;
  public windowHeight = 0;
  public processedTracks = false;

  @Input() preventHide = false;
  @Input() showLogout = false;
  private _forceBlueBackground = false;
  @Input()
  set forceBlueBackground(value) {
    this._forceBlueBackground = value;
    if (value) {
      this.blueBackground = true;
    }
  }
  get forceBlueBackground() {
    return this._forceBlueBackground;
  }
  @HostBinding('class.blue') public blueBackground = false;
  @HostBinding('class.hidden') public isHidden = false;
  @ViewChild('navBarMobile') navBarMobile: ElementRef

  uniqueId = Math.random().toString(36).substring(2);

  constructor(private router: Router, ngZone: NgZone, public modal: Modal) {
    this.signDetectionsEnabled = environment.apollo.signDetectionsEnabled;
    router.events.subscribe(val => {
      if (val instanceof RoutesRecognized) {
        // console.log(val.state.root.children[0].data);
        this.blueBackground = val.state.root.children[0].data['pageTheme'] === 'dark'
          || val.state.root.children[0].data['pageTheme'] === 'dark-custom' || this.forceBlueBackground;
        this.isHidden = (val.state.root.children[0].data['topBarVisible'] === false && !this.preventHide);
        this.processedTracks = val.state.root.children[0].data['pageTheme'] === 'dark-custom';
      }
    });
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;

    $(window).resize((e) => {
      ngZone.run(() => {
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;
      });
    });
  }

  showGetAppModal() {
    const dialog = this.modal.open(GetAppModalComponent, overlayConfigFactory({ size: 'lg' }, BSModalContext));
    dialog.result
      .then((r) => {
      }, (error) => {
        console.log('Dialog ended with failure: ', error);
      });
  }


  closeMenu() {
    this.navBarMobile.nativeElement.classList.remove('show');
  }
}
