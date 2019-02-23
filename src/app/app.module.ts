import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthService } from './services/auth.service';
import { CommunicationService } from './services/communication.service';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestore } from 'angularfire2/firestore'
import { environment } from '../environments/environment';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { MaterialModule } from './services/material.module.';
import { MomentModule } from 'angular2-moment';
import { NgProgressModule } from 'ngx-progressbar';
import 'firebase/storage';
import 'rxjs-compat';
import { AngularFireStorage } from 'angularfire2/storage';
import { SnotifyModule, SnotifyService, ToastDefaults } from 'ng-snotify';
import { HttpModule } from '@angular/http';
import { TagInputModule } from 'ngx-chips';
import { Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';

@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    MaterialModule,
    AngularFireModule.initializeApp(environment.FIREBASE_CONFIG),
    SnotifyModule,
    HttpModule,
    TagInputModule
  ],
  providers: [
    { provide: 'SnotifyToastConfig', useValue: ToastDefaults },
    AuthService,
    CommunicationService,
    AngularFireAuth,
    AngularFireDatabase,
    MomentModule,
    AngularFireStorage,
    SnotifyService
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
