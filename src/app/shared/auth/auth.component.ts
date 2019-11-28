import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from 'environments/environment';
import { AuthProviderService } from './authProvider.service';

@Component({
  moduleId: module.id,
  selector: 'osc-auth-component',
  templateUrl: 'auth.component.html'
})
export class AuthComponent implements OnInit {
  constructor() { }

  ngOnInit() {
    opener.authComplete(window.location.href);
    setTimeout(() => {
      window.close();
    }, 100);
  }
}
