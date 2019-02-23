import { Component, OnInit, Input } from '@angular/core';
import { CommunicationService } from '../../services/communication.service';
import * as firebase from 'firebase/app';
import { AngularFireDatabase } from 'angularfire2/database';
import { SnotifyService } from 'ng-snotify';
import { AngularFireAuth } from 'angularfire2/auth';

@Component({
  selector: 'app-profils',
  templateUrl: './profils.component.html',
  styleUrls: ['./profils.component.css']
})
export class ProfilsComponent implements OnInit {

  @Input() dataSent;

  private subscribe = true;
  private firstOpen: boolean = true;
  public dataGet;
  private allPostUser: any[] = [];
  private itemsAsObjectsList;

  constructor(
    private communicationService: CommunicationService,
    private db: AngularFireDatabase,
    private snotifyService: SnotifyService,
    private anAuth: AngularFireAuth,
  ) { }

  ngOnInit() {

    if (this.firstOpen) {
      this.dataGet = this.dataSent.data;
      this.itemsAsObjectsList = this.dataGet.hobbies;
      if (this.dataGet.hasAvatar) {
        firebase.storage().ref().child(`avatars/${this.dataGet.id}/myavatar`).getDownloadURL().then(url => {
          this.dataGet.urlImg = url;
        });
      }
    } else {
      this.dataGet = null;
    }

    this.communicationService.changeViewEvent.takeWhile(() => this.subscribe).subscribe(data => {
      this.dataGet = null;
      this.firstOpen = false;
      this.dataGet = data;
      this.itemsAsObjectsList = this.dataGet.hobbies;
      firebase.storage().ref().child(`avatars/${this.dataGet.id}/myavatar`).getDownloadURL().then(url => {
        this.dataGet.urlImg = url;
      });
    });

    this.db.list(`Posts/`).valueChanges().subscribe((data: any) => {
      data.map(post => {
        if (post.infos.idUser == this.dataGet.id) {
          this.allPostUser.push(post);
        }
      });
    });
  }


  ngOnDestry() {
    this.subscribe = false;
  }

}
