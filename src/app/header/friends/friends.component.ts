import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { Router } from '@angular/router';
import { CommunicationService } from '../../services/communication.service';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent implements OnInit {

  public allMyFriends: any[] = [];
  public currentData;

  constructor(
    private authService: AuthService,
    private anAuth: AngularFireAuth,
    private db: AngularFireDatabase,
    private router: Router,
    private communicationService: CommunicationService
  ) { }

  ngOnInit() {
    this.authService.authenticated();
    this.db.list(`Users/${this.anAuth.auth.currentUser.uid}/Myfriends`).valueChanges().subscribe(data => {
      this.allMyFriends = data;
      this.allMyFriends.map(friend => {
        if (friend.infosFriend.hasAvatarFriend) {
          firebase.storage().ref().child(`avatars/${friend.infosFriend.idUserFriend}/myavatar`).getDownloadURL().then(url => {
            friend.infosFriend.urlImg = url;
          });
        }
      })
    });
    this.db.object(`Users/${this.anAuth.auth.currentUser.uid}`).valueChanges().subscribe(data => {
      this.currentData = data;
      if (this.currentData.banMode) {
        this.authService.logout();
        localStorage.setItem('BAN', 'true');
      }
    });
  }

  finalStep(state, user) {

    switch (state) {

      case 'del':
        this.db.list(`Users/${this.anAuth.auth.currentUser.uid}/Myfriends`).remove(user.infosFriend.idUserFriend).then(_ => {
          this.db.list(`Users/${user.infosFriend.idUserFriend}/Myfriends`).remove(this.anAuth.auth.currentUser.uid)
        });
        this.db.list(`Users/${this.anAuth.auth.currentUser.uid}/checkRequest`).remove(user.infosFriend.idUserFriend).then(_ => {
          this.db.list(`Users/${user.infosFriend.idUserFriend}/checkRequest`).remove(this.anAuth.auth.currentUser.uid)
        });

        this.db.list(`Users/${this.anAuth.auth.currentUser.uid}/inprogressChat/`).remove(user.infosFriend.idUserFriend)
        this.db.list(`Users/${user.infosFriend.idUserFriend}/inprogressChat/`).remove(this.anAuth.auth.currentUser.uid)

        break;
    }

  }

}
