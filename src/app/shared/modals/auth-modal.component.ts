import { Component, Output, EventEmitter } from '@angular/core';
import { BaseModalComponent } from './base-modal.component';
import { DialogRef, ModalComponent, CloseGuard } from 'ngx-modialog';
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { AuthProviderService } from '../auth/authProvider.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

/**
 * A Sample of how simple it is to create a new window, with its own injects.
 */
export class AuthModalContext extends BSModalContext {
  public showDescription: boolean;
}

@Component({
  selector: 'osc-auth-modal',
  templateUrl: 'auth-modal.component.html',
  styleUrls: ['base-modal.component.css', 'auth-modal.component.css'],
})
export class AuthModalComponent extends BaseModalComponent {
  errorFound = false;
  backButtonEnabled = false;
  showDescription = false;
  constructor(public dialog: DialogRef<AuthModalContext>, protected _auth: AuthProviderService, protected _router: Router) {
    super(dialog);
    this.context = dialog.context;
    if ((this.context as AuthModalContext).showDescription) {
      this.showDescription = true;
    }
    dialog.setCloseGuard(this);
  }

  signIn(providerName) {
    this._auth.login(providerName).then(data => {
      console.log('signing');
      if (data) {
        this.closeModal();
        // this._router.navigate(['/user', this._auth.getUser().username]);
      } else {
        this.errorFound = true;
        console.log('wrong auth');
      }
    }, error => {
      this.errorFound = true;
      console.log('wrong auth');
    });
  }


  closeModal() {
    super.closeModal();
  }
}
