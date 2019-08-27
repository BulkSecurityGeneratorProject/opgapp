import { Injectable } from '@angular/core';
import { AccountService } from 'app/core/auth/account.service';
import { AuthServerProvider } from 'app/core/auth/auth-jwt.service';
import {SessionStorageService} from "ngx-webstorage";
import {EventService} from "app/core/event/event.service";

@Injectable({ providedIn: 'root' })
export class LoginService {
  constructor(private accountService: AccountService, private sessionStorageService: SessionStorageService,
              private authServerProvider: AuthServerProvider, private eventService: EventService) {}

  login(credentials, callback?) {
    const cb = callback || function() {};

    return new Promise((resolve, reject) => {
      this.authServerProvider.login(credentials).subscribe(
        data => {
          this.accountService.identity(true).then(account => {
            this.eventService.loginCompleted.emit();
            resolve(data);
          });
          return cb();
        },
        err => {
          this.logout();
          reject(err);
          return cb(err);
        }
      );
    });
  }

  loginWithToken(jwt, rememberMe) {
    return this.authServerProvider.loginWithToken(jwt, rememberMe);
  }

  logout() {
    this.authServerProvider.logout().subscribe(null, null, () => this.accountService.authenticate(null));
  }
}
