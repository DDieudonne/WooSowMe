import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthService } from '../../services/auth.service';
import { CommunicationService } from '../../services/communication.service';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.css']
})
export class MessengerComponent implements OnInit {

  private subscribe: boolean = true;
  public allMessengers: any[] = [];
  public currentData;

  constructor(
    private authService: AuthService,
    private anAuth: AngularFireAuth,
    private communicationService: CommunicationService,
    private db: AngularFireDatabase,
  ) { }

  ngOnInit() {

    this.authService.authenticated();
    this.communicationService.authorizationSource.takeWhile(() => this.subscribe).subscribe(data => {
      this.db.object(`Users/${this.anAuth.auth.currentUser.uid}`).valueChanges().subscribe(data => {
        this.currentData = data;
        if (this.currentData.banMode) {
          this.authService.logout();
          localStorage.setItem('BAN', 'true');
        }
      });
    });
    this.db.list(`Users/` + this.anAuth.auth.currentUser.uid + '/MyConversation').valueChanges().subscribe((data: any) => {
      this.allMessengers = Array.from(new Set(data));
      this.allMessengers.map(messager => {
        if (messager.conversation.userid) {
          firebase.storage().ref().child(`avatars/${messager.conversation.userid}/myavatar`).getDownloadURL().then(url => {
            if (url != null) {
              messager.conversation.urlImg = url;
            }
          });
        }
      });
    });
  }


  showMessenger(messenger) {
    this.db.list('/Users/' + this.currentData.id + '/MyConversation/' + messenger.conversation.id).update(
      'conversation', { conversationIsClose: false }
    );
  }

}

