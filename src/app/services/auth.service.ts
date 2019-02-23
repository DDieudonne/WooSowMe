import { Injectable, Output, EventEmitter } from '@angular/core';
import { RouterConfigLoader } from '@angular/router/src/router_config_loader';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs/internal/Subject';
import { CommunicationService } from './communication.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs';
import { AngularFireDatabase } from 'angularfire2/database';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private user;

    constructor(
        private anAuth: AngularFireAuth,
        private router: Router,
        private communicationService: CommunicationService,
        private http: Http,
        private db: AngularFireDatabase,
    ) { }

    authenticated() {
        this.anAuth.authState.subscribe(data => {
            if (data != null) {
                this.communicationService.authorizationSource.next(true);
            } else {
                this.router.navigate(['authentification']);
            }
        });
    }

    authSuccessfully(loadingState) {
        this.router.navigate(['app/application/acceuil']).then(_ => {
            loadingState = false;
            this.connectedState(true);
        });
    };

    logout() {
        this.anAuth.auth.signOut();
        this.connectedState(false);
    }



    connectedState(mode) {
        switch (mode) {
            case true:
                this.db.list('/Users/').update(this.anAuth.auth.currentUser.uid, {
                    connectionSate: true
                });
                break;

            case false:
                this.db.list('/Users/').update(this.anAuth.auth.currentUser.uid, {
                    connectionSate: false
                }).then(_ => {
                    this.router.navigate(['authentification']);
                });
                break;
        }
    }

    getAllLocalisationData(textName) {
        return this.http.get('https://geo.api.gouv.fr/departements?nom=' + textName)
            .map(res => res.json())
            .catch(this.handleError);
    }

    private handleError(error: Response) {
        return Observable.throw(error.json().error || 'Server error');
    }

}
