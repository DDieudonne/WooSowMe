import { Component, NgModule, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CommunicationService } from '../services/communication.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  private subscribe: boolean = true;

  public homeIsActive: boolean = true;
  public profilIsActive: boolean = false;
  private requestIsActive: boolean = false;
  public messengerIsActive: boolean = false;
  public friendsIsActive: boolean = false;
  public allProfilsActive: boolean = false;

  private dataSent;
  private currentData;


  constructor(
    private authService: AuthService,
    private anAuth: AngularFireAuth,
    private communicationService: CommunicationService,
    private db: AngularFireDatabase,
    private router: Router
  ) { }
  ngOnInit() {
    // LOAD AUTHENTIFICATED
    this.authService.authenticated();
    this.communicationService.authorizationSource.takeWhile(() => this.subscribe).subscribe(data => {
      this.communicationService.changePageEvent.takeWhile(() => this.subscribe).subscribe(data => {

        if (data != null) {

          if (data == "acceuil") {

            this.homeIsActive = true;
            this.profilIsActive = false;
            this.requestIsActive = false;
            this.messengerIsActive = false;
            this.allProfilsActive = false;
            this.friendsIsActive = false;

          } else if (data == "profil") {

            this.homeIsActive = false;
            this.profilIsActive = true;
            this.requestIsActive = false;
            this.messengerIsActive = false;
            this.friendsIsActive = false;
            this.allProfilsActive = false;
            this.dataSent = null;
          } else if (data == "conversations") {

            this.homeIsActive = false;
            this.profilIsActive = false;
            this.requestIsActive = false;
            this.messengerIsActive = true;
            this.allProfilsActive = false;
            this.friendsIsActive = false;

          } else if (data == "friends") {

            this.homeIsActive = false;
            this.profilIsActive = false;
            this.requestIsActive = false;
            this.messengerIsActive = false;
            this.allProfilsActive = false;
            this.friendsIsActive = true;

          }  else if (data.route == "profils") {

            this.homeIsActive = false;
            this.profilIsActive = false;
            this.requestIsActive = false;
            this.messengerIsActive = false;
            this.friendsIsActive = false;
            this.allProfilsActive = true;
            this.dataSent = data;
          }

        }
      });
    });
    this.router.navigate(['/app/application/acceuil']);
  }

  ngOnDestroy() {

  }


}
