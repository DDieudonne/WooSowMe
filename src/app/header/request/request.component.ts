import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireStorage } from 'angularfire2/storage';
import { CommunicationService } from '../../services/communication.service';
import { AngularFireDatabase } from 'angularfire2/database';
import { SnotifyService } from 'ng-snotify';

@Component({
  selector: 'app-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.css']
})
export class RequestComponent implements OnInit {

  @Input() dataSent;

  public subscribe: boolean = true;
  public currentData;
  public notifMode: boolean = true;

  constructor(
    private authService: AuthService,
    private anAuth: AngularFireAuth,
    private storage: AngularFireStorage,
    private communicationService: CommunicationService,
    private db: AngularFireDatabase,
    private snotifyService: SnotifyService
  ) { }

  ngOnInit() {
    // LOAD AUTHENTIFICATED
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
  }

}
