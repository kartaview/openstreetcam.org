import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { overlayConfigFactory } from 'ngx-modialog';
import { Modal, BSModalContext } from 'ngx-modialog/plugins/bootstrap';


import { AuthService } from 'angular2-social-login';

import { AuthModalComponent } from '../modals/auth-modal.component';
import { AuthProviderService } from '../auth/authProvider.service';

/**
 * This class represents the navigation bar component.
 */
@Component({
  moduleId: module.id,
  selector: 'osc-navbar-account-block',
  templateUrl: 'navbar-account-block.component.html',
  styleUrls: ['navbar-account-block.component.css'],
})
export class NavbarAccountBlockComponent {
  @Input() mobile = false;
  @Input() switchToLogout = false;

  constructor(private router: Router, public auth: AuthProviderService, public modal: Modal) {
  }

  showLoginModal() {
    const dialog = this.modal.open(AuthModalComponent, overlayConfigFactory({ size: 'sm' }, BSModalContext));
    dialog.result
      .then((r) => {
      }, (error) => {
        console.log('Dialog ended with failure: ', error);
      });
  }

  logout() {
    this.auth.logout().then(data => {
      this.router.navigate(['/']);
    });
  }

}
