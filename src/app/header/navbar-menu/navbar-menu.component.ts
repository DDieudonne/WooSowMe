import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase/app';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommunicationService } from '../../services/communication.service';
import { ToastManagerService } from '../../toast-manager.service';
import { SnotifyService } from 'ng-snotify';
import { UUID } from 'angular2-uuid';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { ScrollDispatchModule } from '@angular/cdk/scrolling';
import { Observable } from 'rxjs/observable'

@Component({
  selector: 'app-navbar-menu',
  templateUrl: './navbar-menu.component.html',
  styleUrls: ['./navbar-menu.component.css']
})
export class NavbarMenuComponent implements OnInit {

  @Input() profilComponentEvent;
  @ViewChild('inputLive') inputLive: ElementRef;
  @ViewChild('fileInputMessage') fileInputMessage: ElementRef;
  @ViewChild('searchPersonsInput') searchPersonsInput: ElementRef;

  public subscribe: boolean = true;
  public currentData;
  public imgUser;
  public myImg;
  public dataTableMode: boolean;
  public allUsers: any = []
  public searchPers: string;
  public allFreinds: any[] = [];
  public allRequest: any[] = [];
  public allMyFriends: any[] = [];

  public profilIsHere: boolean = true;
  public usersConnected: any[] = [];
  public allConversations: any[] = [];
  public liveInput: string;
  public sawPerson;

  public originalConversation;
  public nameConversation: string;
  public dateConversation;
  public infosUserConversation;
  public iDConversation;
  public writerInfos;
  public messagesConversation;
  public idOtherUserMessage;
  public autorizationSentMess: boolean = true;
  public purcentageNumber: number;
  public urlVideo;
  public creatorIdMess;

  private uploadTaskVideo;
  private mediaMessageIs: string = '';
  private fileMedia;
  public urlImg;
  private basePath: string = '/postImgs';
  private imgPostedReal;
  private basePathVideo: string = '/postVideos';
  private loadingModeBool: boolean;
  private allListSubScription: Subscription;

  public   previewVideoUrl;
  private videoPreview;
  private allPostStories: any[] = [];
  private storyType;

  private imageTypeIsTrue: boolean;
  private videoTypeIsTrue: boolean;

  public personForm: FormGroup;
  public personNameControl: FormControl;
  public personEmailControl: FormControl;;
  public namePerson;
  public personMessageControl: FormControl;;
  public emailValid: boolean;
  public emailReady: boolean;
  public messageSent: boolean;

  private timerVar: Subscription;
  private timerValues;
  private valueCount = 15;
  private isCounting: boolean = true;
  public showCounting: boolean;
  public modifiedName: boolean;
  private okLetsGoScroll: boolean;

  constructor(
    private authService: AuthService,
    private anAuth: AngularFireAuth,
    private communicationService: CommunicationService,
    private db: AngularFireDatabase,
    private router: Router,
    private snotifyService: SnotifyService,
    private sanitizer: DomSanitizer,
    private builder: FormBuilder
  ) { }

  ngOnInit() {
    let newId: any[] = [];
    let UnniqueArrayId: boolean = false;
    // LOAD AUTHENTIFICATED
    this.authService.authenticated();
    this.communicationService.authorizationSource.takeWhile(() => this.subscribe).subscribe(data => {

      this.db.object(`Users/${this.anAuth.auth.currentUser.uid}`).valueChanges().subscribe(data => {
        this.okLetsGoScroll = true;
        this.currentData = data;
        if (this.currentData.banMode) {
          this.authService.logout();
          localStorage.setItem('BAN', 'true');
        }
        this.namePerson = this.currentData.name;
        this.db.list(`Users/` + this.currentData.id + '/Myrequest').valueChanges().subscribe(data => {
          this.allRequest = data;
          this.allRequest.map(request => {
            if (request.requestInfos.hasAvatarSender) {
              firebase.storage().ref().child(`avatars/${request.requestInfos.idSender}/myavatar`).getDownloadURL().then(url => {
                request.requestInfos.myImg = url;
              });
            }
          });
        });
        this.getImage();
      });
      this.communicationService.profilEventSource.takeWhile(() => this.subscribe).subscribe(data => {
        this.profilIsHere = data;
      });
      this.getAllFriendsOrUsers();
    });
    this.personNameControl = new FormControl('', Validators.required)
    this.personEmailControl = new FormControl('', Validators.compose([Validators.required]))
    this.personMessageControl = new FormControl('', Validators.required)

    this.personForm = this.builder.group({
      personNameControl: this.personNameControl,
      personEmailControl: this.personEmailControl,
      personMessageControl: this.personMessageControl
    });
    this.scrollUp();
  }


  getAllFriendsOrUsers() {
    this.allListSubScription = this.db.list(`Users/`).valueChanges().subscribe(data => {
      this.allUsers = data;
      // CHECK ONE IF IS ALREADY MY FRIEND
      this.allListSubScription = this.db.list(`Users/` + this.currentData.id + '/Myfriends').valueChanges().subscribe(data => {
        this.allMyFriends = data;
        this.allMyFriends.map(myFriend => {
          this.allUsers.map(user => {
            if (myFriend.infosFriend.idUserFriend == user.id) {
              return user.friendly = true;
            }
          });
        });
      });
      // CHECK ONE IF IS ALREADY MY FRIEND

      // CHECK IF IS ADDED
      this.allListSubScription = this.db.list(`Users/` + this.anAuth.auth.currentUser.uid + '/checkRequest').valueChanges().subscribe(data => {
        this.allMyFriends = data;
        this.allMyFriends.map(myFriend => {
          this.allUsers.map(user => {
            if (myFriend.requestCheck.idReceiver == user.id) {
              return user.Added = true;
            }
          });
        });
      });
      // CHECK IF IS ADDED


      // CHECK IF IS IS CHATING
      this.allListSubScription = this.db.list(`Users/` + this.anAuth.auth.currentUser.uid + '/inprogressChat').valueChanges().subscribe((data: any) => {
        data.map(myChater => {
          this.allUsers.map(user => {
            if (myChater.idChatter == user.id) {
              return user.isChating = true;
            }
          });
        });
      });
      // CHECK IF IS IS CHATING


      // CHECK IF IS WAITINGREQUEST
      this.allListSubScription = this.db.list(`Users/` + this.anAuth.auth.currentUser.uid + '/Myrequest').valueChanges().subscribe((data: any) => {
        data.map(myWaiter => {
          this.allUsers.map(user => {
            if (myWaiter.requestInfos.idSender == user.id) {
              return user.isWaitingYou = true;
            }
          });
        });
      });
      // CHECK IF IS WAITINGREQUEST

      // CHECK IF IS WAITINGREQUEST
      this.allListSubScription = this.db.list(`Users/` + this.anAuth.auth.currentUser.uid + '/checkRequest').valueChanges().subscribe((data: any) => {
        data.map(ImWaitingFor => {
          this.allUsers.map(user => {
            if (ImWaitingFor.requestCheck.idReceiver == user.id) {
              return user.ImWaiting = true;
            }
          });
        });
      });
      // CHECK IF IS WAITINGREQUEST

    });
    this.getAllConversation();
  }

  getImage() {
    if (this.currentData.hasAvatar && this.okLetsGoScroll) {
      let image: string = this.anAuth.auth.currentUser.uid;
      this.imgUser = firebase.storage().ref().child(`avatars/${image}/myavatar`).getDownloadURL().then(url => {
        this.myImg = url;
      });
    }
  }

  getAllConversation() {
    this.db.list(`Users/` + this.anAuth.auth.currentUser.uid + '/MyConversation').valueChanges().subscribe((data: any) => {
      this.allConversations = Array.from(new Set(data));
      this.allConversations.map(conversation => {
        if (conversation.conversation.userid) {
          firebase.storage().ref().child(`avatars/${conversation.conversation.userid}/myavatar`).getDownloadURL().then(url => {
            if (url != null) {
              conversation.conversation.urlImg = url;
            }
          });
        }
      })
    });
  }

  addFriends(userAdd) {

    this.db.list('/Users/' + userAdd.id + '/Myrequest/' + this.currentData.id).update('requestInfos', {
      nameReceiver: userAdd.name,
      hasAvatarSender: this.currentData.hasAvatar,
      nameSender: this.currentData.name,
      idReceiver: userAdd.id,
      idSender: this.currentData.id,
    }).then(_ => {

      this.snotifyService.success(`Vous avez envoyé une demande d'amis a ${userAdd.name}`, 'Requête envoyée');

      // CHECK IF I HAVE ADDED FRIEND
      this.db.list('/Users/' + this.currentData.id + '/checkRequest/' + userAdd.id).update('requestCheck', {
        idReceiver: userAdd.id,
        idName: userAdd.name,
      });
      // CHECK IF I HAVE ADDED FRIEND

    });

  }

  addConversation(userConversation) {
    const newId = UUID.UUID();

    this.db.list('/Users/' + this.currentData.id + '/MyConversation/' + newId).update('conversation', {
      creatorId: this.currentData.id,
      id: newId,
      nameUser: userConversation.name,
      userid: userConversation.id,
      dateCreation: new Date()
    }).then(_ => {
      this.db.list('/Users/' + this.currentData.id + '/inprogressChat').update(userConversation.id, {
        idChatter: userConversation.id
      });
    });

    this.db.list('/Users/' + userConversation.id + '/MyConversation/' + newId).update('conversation', {
      creatorId: this.currentData.id,
      id: newId,
      nameUser: this.currentData.name,
      userid: this.currentData.id,
      dateCreation: new Date()
    }).then(_ => {
      this.snotifyService.info(`Conversation avec ${userConversation.name} ajouté`, 'Nouvelle conversation');
    }).then(_ => {
      this.db.list('/Users/' + userConversation.id + '/inprogressChat').update(userConversation.id, {
        idChatter: this.currentData.id
      });
    });

  }

  sendMessageLive() {
    if (this.inputLive.nativeElement.value.trim() != '') {

      if (this.mediaMessageIs == '') {

        this.db.list('/Users/' + this.currentData.id + '/MyConversation/' + this.originalConversation.conversation.id + '/AllMessages/').push({
          messageConversation: '',
          message: this.inputLive.nativeElement.value,
        }).then(data => {
          this.db.list('/Users/' + this.currentData.id + '/MyConversation/' + this.originalConversation.conversation.id + '/AllMessages/' + data.key).update('messageConversation', {
            id: data.key,
            nameSender: this.currentData.name,
            idSender: this.currentData.id,
            dateCreation: new Date()
          });
        });

        this.db.list('/Users/' + this.originalConversation.conversation.userid + '/MyConversation/' + this.originalConversation.conversation.id + '/AllMessages/').push({
          messageConversation: '',
          message: this.inputLive.nativeElement.value,
        }).then(data => {
          this.db.list('/Users/' + this.originalConversation.conversation.userid + '/MyConversation/' + this.originalConversation.conversation.id + '/AllMessages/' + data.key).update('messageConversation', {
            id: data.key,
            nameSender: this.currentData.name,
            idSender: this.currentData.id,
            dateCreation: new Date()
          });
        });


        this.db.list('/Users/' + this.currentData.id + '/MyConversation/' + this.originalConversation.conversation.id).update('lastMessage', {
          message: this.inputLive.nativeElement.value,
          date: new Date(),
          idUser: this.currentData.id
        });

        this.db.list('/Users/' + this.originalConversation.conversation.userid + '/MyConversation/' + this.originalConversation.conversation.id).update('lastMessage', {
          message: this.inputLive.nativeElement.value,
          date: new Date(),
          idUser: this.currentData.id
        });

      } else {

        this.purcentageNumber = 0;

        if (this.mediaMessageIs == 'image') {

          localStorage.setItem('MSGCVRS', this.inputLive.nativeElement.value)
          let msgC = localStorage.getItem('MSGCVRS');
          const idMedia = UUID.UUID();

          this.uploadTaskVideo = firebase.storage().ref(this.basePath + '/' + idMedia + "/" + this.fileMedia.name).put(this.fileMedia).then((result) => {
            this.purcentageNumber = 25;
            firebase.storage().ref().child(this.basePath + '/' + idMedia + "/" + this.fileMedia.name).getDownloadURL().then(url => {
              this.imgPostedReal = url;
              this.purcentageNumber = 50;
              // DATA DB
              this.db.list('/Users/' + this.currentData.id + '/MyConversation/' + this.originalConversation.conversation.id + '/AllMessages/').push({
                messageConversation: '',
                message: msgC,
                mediaIsHere: true,
                urlImg: this.imgPostedReal
              }).then(data => {
                this.db.list('/Users/' + this.currentData.id + '/MyConversation/' + this.originalConversation.conversation.id + '/AllMessages/' + data.key).update('messageConversation', {
                  id: data.key,
                  nameSender: this.currentData.name,
                  idSender: this.currentData.id,
                  dateCreation: new Date()
                }).then(_ => {
                  this.purcentageNumber = 75;
                  if (this.purcentageNumber == 75) {
                    this.purcentageNumber = 100;
                  }
                });
              });

              this.db.list('/Users/' + this.originalConversation.conversation.userid + '/MyConversation/' + this.originalConversation.conversation.id + '/AllMessages/').push({
                messageConversation: '',
                message: msgC,
                mediaIsHere: true,
                urlImg: this.imgPostedReal
              }).then(data => {
                this.db.list('/Users/' + this.originalConversation.conversation.userid + '/MyConversation/' + this.originalConversation.conversation.id + '/AllMessages/' + data.key).update('messageConversation', {
                  id: data.key,
                  nameSender: this.currentData.name,
                  idSender: this.currentData.id,
                  dateCreation: new Date()
                }).then(_ => {
                  this.purcentageNumber = 75;
                  if (this.purcentageNumber == 75) {
                    this.purcentageNumber = 100;
                    if (this.purcentageNumber == 100) {
                      this.snotifyService.success(`fichier media envoyé avec succès`, 'Fichier chargé');
                    }
                  }
                });
              });
              // DATA DB
            });
          });
        } else {


          localStorage.setItem('MSGCVRS', this.inputLive.nativeElement.value)
          let msgC = localStorage.getItem('MSGCVRS');
          const idMedia = UUID.UUID();

          this.uploadTaskVideo = firebase.storage().ref(this.basePathVideo + '/' + idMedia + "/" + this.videoPreview.name).put(this.videoPreview).then((result) => {
            this.purcentageNumber = 25;
            firebase.storage().ref().child(this.basePathVideo + '/' + idMedia + "/" + this.videoPreview.name).getDownloadURL().then(url => {
              this.urlVideo = url;
              // DATA DB
              this.db.list('/Users/' + this.currentData.id + '/MyConversation/' + this.originalConversation.conversation.id + '/AllMessages/').push({
                messageConversation: '',
                message: msgC,
                mediaIsHere: true,
                urlVid: this.urlVideo
              }).then(data => {
                this.db.list('/Users/' + this.currentData.id + '/MyConversation/' + this.originalConversation.conversation.id + '/AllMessages/' + data.key).update('messageConversation', {
                  id: data.key,
                  nameSender: this.currentData.name,
                  idSender: this.currentData.id,
                  dateCreation: new Date()
                }).then(_ => {
                  this.purcentageNumber = 75;
                  if (this.purcentageNumber == 75) {
                    this.purcentageNumber = 100;
                  }
                });
              });

              this.db.list('/Users/' + this.originalConversation.conversation.userid + '/MyConversation/' + this.originalConversation.conversation.id + '/AllMessages/').push({
                messageConversation: '',
                message: msgC,
                mediaIsHere: true,
                urlVid: this.urlVideo
              }).then(data => {
                this.db.list('/Users/' + this.originalConversation.conversation.userid + '/MyConversation/' + this.originalConversation.conversation.id + '/AllMessages/' + data.key).update('messageConversation', {
                  id: data.key,
                  nameSender: this.currentData.name,
                  idSender: this.currentData.id,
                  dateCreation: new Date()
                }).then(_ => {
                  this.purcentageNumber = 75;
                  if (this.purcentageNumber == 75) {
                    this.purcentageNumber = 100;
                    if (this.purcentageNumber == 100) {
                      this.snotifyService.success(`fichier media envoyé avec succès`, 'Fichier chargé');
                    }
                  }
                });
              });
              // DATA DB
            });
          });
        }
      }

      this.inputLive.nativeElement.value = '';
      this.autorizationSentMess = true;
      this.urlImg = '';
      this.mediaMessageIs = '';
      this.previewVideoUrl = '';
      // OTHER USER

    } else {
      this.snotifyService.error(`Veuillez écrire quelques chose`, 'Erreur envoi')
    }


  }

  scrollDown() {
    setTimeout(() => {
      var theDiv = document.getElementsByClassName('chat-box-live');
      theDiv.item(0).scrollTop = theDiv.item(0).scrollHeight;
    }, 200);
  }

  openChatMessage(converse) {
    this.creatorIdMess = converse.conversation.creatorId;
    this.dateConversation = converse.conversation.dateCreation;
    this.idOtherUserMessage = converse.conversation.userid;
    this.originalConversation = converse;
    this.iDConversation = converse.conversation.id;
    this.nameConversation = converse.conversation.nameUser;
    this.infosUserConversation = converse.conversation;
    this.db.object(`Users/` + this.anAuth.auth.currentUser.uid + '/MyConversation/' + this.iDConversation + '/writerInfos/').valueChanges().subscribe(data => {
      this.writerInfos = data;
    });

    this.messagesConversation = this.db.list(`Users/` + this.anAuth.auth.currentUser.uid + '/MyConversation/' + this.iDConversation + '/AllMessages/').valueChanges().subscribe(data => {
      this.messagesConversation = data;
      this.messagesConversation.map(messConversation => {
        firebase.storage().ref().child(`avatars/${messConversation.messageConversation.idSender}/myavatar`).getDownloadURL().then(url => {
          if (url != null) {
            messConversation.messageConversation.myImg = url;
          }
        });
      });
      this.scrollDown();
    });

    // SAW FOR ME
    this.db.list('/Users/' + this.currentData.id + '/MyConversation/' + this.iDConversation).update(
      'saw', {
        idsees: this.currentData.id,
        dataSees: new Date()
      }
    );
    // SAW FOR ME

    this.db.object(`Users/` + this.currentData.id + '/MyConversation/' + this.iDConversation + '/saw/').valueChanges().subscribe(data => {
      this.sawPerson = data;
    });

  }

  closeConversation() {
    this.db.list('/Users/' + this.currentData.id + '/MyConversation/' + this.iDConversation).update(
      'conversation', { conversationIsClose: true }
    );
  }

  writeEvent(event) {
    if (event.target.value.trim()) {
      this.db.list('/Users/' + this.currentData.id + '/MyConversation/' + this.iDConversation).update(
        'writerInfos', {
          writerName: this.currentData.name,
          writerID: this.currentData.id
        }
      );
      this.db.list('/Users/' + this.idOtherUserMessage + '/MyConversation/' + this.iDConversation).update(
        'writerInfos', {
          writerName: this.currentData.name,
          writerID: this.currentData.id
        }
      );
      this.autorizationSentMess = false;
    } else {
      this.autorizationSentMess = true;
    }
  }


  onKey(event) {
    if (event.target.value.trim()) {
      setTimeout(() => {
        this.db.list('/Users/' + this.currentData.id + '/MyConversation/' + this.iDConversation).remove('writerInfos');
      }, 5000)

      setTimeout(() => {
        this.db.list('/Users/' + this.idOtherUserMessage + '/MyConversation/' + this.iDConversation).remove('writerInfos');
      }, 5000)

    } else {
      setTimeout(() => {
        this.db.list('/Users/' + this.currentData.id + '/MyConversation/' + this.iDConversation).remove('writerInfos');
      }, 5000)

      setTimeout(() => {
        this.db.list('/Users/' + this.idOtherUserMessage + '/MyConversation/' + this.iDConversation).remove('writerInfos');
      }, 5000)

    }
  }

  getMedia(event) {

    this.fileMedia = event.target.files[0];
    if (this.fileMedia.size > 5500000) {
      this.snotifyService.error('Fichier trop lourd', 'Fichier lourd');
    } else {

      let extensionStr: string = event.target.files[0].type;
      let strFinal = extensionStr.substr(extensionStr.indexOf('/') + 1);

      if (event.target.value != null) {

        event.target.files[0].type

        switch (event.target.files[0].type) {
          case 'image/' + strFinal:
            this.mediaMessageIs = 'image';
            var reader = new FileReader();
            reader.onload = (event: any) => {
              this.urlImg = event.target.result;
            }
            reader.readAsDataURL(this.fileMedia);
            break;
          case 'video/' + strFinal:
            this.mediaMessageIs = 'video';
            var URL = window.URL;
            this.videoPreview = event.target.files[0];
            this.previewVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(this.videoPreview));
            break;
        }

      }
    }

  }

  openUrlWindow(url) {
    window.open(url)
  }

  deleteRequest(user) {
    // DELETE REQUEST OTHER USER
    this.db.list('/Users/' + user.id + '/Myrequest/').remove(this.currentData.id)
    // DELETE REQUEST OTHER USER
    // DELETE MY SENT REQUEST
    this.db.list('/Users/' + this.currentData.id + '/checkRequest/').remove(user.id)
    // DELETE MY SENT REQUEST
  }

  acceptRequest(user) {

    this.db.list('/Users/' + this.currentData.id + '/Myfriends/' + user.id).update('infosFriend', {
      Myid: this.currentData.id,
      idUserFriend: user.id,
      hasAvatarFriend: user.hasAvatar,
      nameFriend: user.name,
    }).then(_ => {
      this.db.list('/Users/' + this.currentData.id + '/Myrequest/').remove(user.id).then(_ => {
        this.db.list('/Users/' + this.currentData.id + '/checkRequest/').remove(user.id)
      });
    });

    this.db.list('/Users/' + user.id + '/Myfriends/' + this.currentData.id).update('infosFriend', {
      Myid: user.id,
      idUserFriend: this.currentData.id,
      hasAvatarFriend: this.currentData.hasAvatar,
      nameFriend: this.currentData.name,
    }).then(_ => {
      this.db.list('/Users/' + user.id + '/Myrequest/').remove(this.currentData.id).then(_ => {
        this.db.list('/Users/' + user.id + '/checkRequest/').remove(this.currentData.id)
      })
    });

    this.searchPersonsInput.nativeElement.value = "";
    this.dataTableMode = false;
  }

  seeProfil(user) {
    setTimeout(() => {
      let infos = { route: 'profils', data: user }
      this.router.navigate(['app/application/profils/' + user.name]);
      this.communicationService.changePageEvent.next(infos);
      this.communicationService.changeViewEvent.next(user);
    }, 1);
  }

  showRequest(user) {
    this.searchPersonsInput.nativeElement.value = user.requestInfos.nameSender;
    this.dataTableMode = true;
  }

  showNotification() {
    let mode = 'notif';
    let infos = { route: 'demandes', data: 'user' }
    this.router.navigate(['app/application/demandes&notifications']);
    this.communicationService.changePageEvent.next(infos);
    this.communicationService.requestModeEvent.next(mode)
  }

  home() {
    this.router.navigate(['app/application/acceuil'], );
    this.communicationService.changePageEvent.next('acceuil');
    this.communicationService.postModeEvent.next(true);
  }

  messengers() {
    this.router.navigate(['app/application/conversations']);
    this.communicationService.changePageEvent.next('conversations');
  }

  MyFirends() {
    this.router.navigate(['app/application/friends']);
    this.communicationService.changePageEvent.next('friends');
  }

  myFriendPost() {
    this.router.navigate(['app/application/acceuil'], );
    this.communicationService.changePageEvent.next('acceuil');
    this.communicationService.postModeEvent.next(false);
  }

  profile() {
    this.router.navigate(['app/application/profil']);
    this.communicationService.changePageEvent.next('profil');
  }

  logOut() {
    this.authService.logout();
  }



  ngOnDestroy() {
    this.subscribe = false;
    if (this.allListSubScription != undefined) { this.allListSubScription.unsubscribe() };
  }

  searchMode(event) {
    if (event.target.value.trim() != '') {
      this.searchPers = event.target.value.trim();
      this.dataTableMode = true;
    } else {
      this.dataTableMode = false;
    }
  }



  checkEmail(e) {
    let EMAIL_REGEXP = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
    if (e.target.value.trim()) {
      if (EMAIL_REGEXP.test(e.target.value.trim())) {
        this.emailValid = true;
      } else {
        this.emailValid = false;
      }
    }
  }

  sendMessageToDieudo(form: FormGroup) {


    if (this.emailValid) {

      if (this.isCounting) {

        if (this.currentData.name == this.namePerson) {
          this.modifiedName = false;
          this.db.list('messagesAdmin/').update(this.currentData.id, {
            idMess: this.currentData.id,
            name: this.personNameControl.value,
            email: this.personEmailControl.value,
            message: this.personMessageControl.value,
            date: Date.now()
          });
          this.personForm.reset();
          this.messageSent = true;
          this.refreshNotif();
        } else {
          this.modifiedName = true;
        }
      }
    } else {
      this.snotifyService.error(`Veuillez remplir corretement le formulaire`, 'Erreur formulaire')
    }
  }

  scrollUp() {
    if (this.okLetsGoScroll) {
      setTimeout(() => {
        var theDiv = document.getElementsByClassName('modal');
        theDiv.item(0).scrollTop = theDiv.item(0).scrollHeight;
      }, 200);
    }
  }


  private refreshNotif() {
    setTimeout(() => {
      this.messageSent = false;
    }, 5000);
    this.timerVar = Observable.interval(1000).subscribe(x => {
      if (this.valueCount != 0) {
        this.valueCount -= 1;
        this.isCounting = false;
        this.showCounting = true;
        this.namePerson = this.currentData.name;
      } else {
        this.valueCount = 0;
        this.showCounting = false;
        this.timerVar.unsubscribe();
        this.valueCount = 15;
        this.isCounting = true;
      }
    });
  }


}





