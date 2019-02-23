import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase/app';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as moment from 'moment';
import { AuthService } from 'src/app/services/auth.service';
import { CommunicationService } from 'src/app/services/communication.service';
import { DomSanitizer } from '@angular/platform-browser';
import { v4 as uuid } from 'uuid';
import { AngularFireStorage } from 'angularfire2/storage';
import { ViewChild, OnInit, Component, ElementRef } from '@angular/core';
import { PostServiceService } from '../../services/post-service.service';
import { UUID } from 'angular2-uuid';
import { SnotifyService } from 'ng-snotify';
import { DatePipe } from '@angular/common';
import * as CryptoJS from 'crypto-js';
import 'rxjs/add/observable/interval';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  @ViewChild('myInput')
  myInputVariable: ElementRef;

  private subscribe: boolean = true;
  private currentData;

  private imgUser;
  private myImg;
  private postModeTrue: boolean = true;

  private allPostBox: any[] = []
  private allPostFriendsBox: any[] = []
  private messgeInput: string;

  private isPhotoBtn: boolean = false;
  private isVideoBtn: boolean = false;

  private imgPreview;
  private url;
  private isMediaOK: boolean = false;
  private isMediaVideoOK: boolean;
  private previewVideoUrl;

  private videoPreview;
  private urlVideo;

  private basePath: string = '/postImgs';
  private basePathVideo: string = '/postVideos';
  private basePathStory: string = "/postImgsVideoStories"

  private imgPostedReal;
  private uploadTaskVideo;

  private photoMode: boolean;
  private videoMode: boolean;
  private writeMode: boolean;
  private isFinishLoading: boolean;

  public detailImg;
  public detailVideos;
  private dateImgOrVideo;
  private detailCreatorImg;
  public detailCreatorName;
  private detailsMessageId;
  private allMessDetails;
  private allMessFriendsDetails;
  private allLikesDetails;
  public creatorhasAvatar: boolean;
  private messageDetail;

  private forms: FormGroup;
  public messageForm: FormGroup;
  public myGroup: FormGroup;
  private messageTextControl: FormControl;
  private postControl: FormControl;

  private allReadyLiked: boolean;
  public isUploadVideoOK: boolean;
  private purcentageNumber: number = 0;

  public postModeWorld: boolean = true;
  private showMessInfos: boolean;
  public allMyFriends;
  private likeShow: boolean;

  private maxFileFault: boolean;

  constructor(
    private authService: AuthService,
    private anAuth: AngularFireAuth,
    private storage: AngularFireStorage,
    private router: Router,
    private communicationService: CommunicationService,
    private db: AngularFireDatabase,
    private builder: FormBuilder,
    private sanitizer: DomSanitizer,
    private PostService: PostServiceService,
    private snotifyService: SnotifyService,
  ) { }

  ngOnInit() {
    // LOAD AUTHENTIFICATED
    this.authService.authenticated();
    this.communicationService.authorizationSource.takeWhile(() => this.subscribe).subscribe(data => {
      this.db.object(`Users/${this.anAuth.auth.currentUser.uid}`).valueChanges().subscribe(data => {
        this.currentData = data;
        this.getImage();
        this.getPostFirends(this.currentData);
        if (this.currentData.banMode) {
          this.authService.logout();
          localStorage.setItem('BAN', 'true');
        }
      });
      this.getPosts();
      this.communicationService.postModeEvent.takeWhile(() => this.subscribe).subscribe(data => {
        if (data != null) {
          data ? this.postModeWorld = true : this.postModeWorld = false;
        }
      })
    });
    this.initForm();
  }

  scrollDown() {
    setTimeout(() => {
      var theDiv = document.getElementsByClassName('chat-box');
      theDiv.item(0).scrollTop = theDiv.item(0).scrollHeight;
    }, 200);
  }

  scrollDownMessagesBox() {
    setTimeout(() => {
      var theDiv = document.getElementsByClassName('final-post-section"');
      theDiv.item(0).scrollTop = theDiv.item(0).scrollHeight;
    }, 200);
  }



  initForm() {
    this.postControl = new FormControl('', Validators.required);
    this.myGroup = new FormGroup({
      postControl: this.postControl
    });

    this.messageTextControl = new FormControl('', Validators.required);
    this.messageForm = new FormGroup({
      messageTextControl: this.messageTextControl
    });

    this.forms = this.builder.group({
      myGroup: this.myGroup,
      messageForm: this.messageForm
    });
  }

  getPosts() {
    this.PostService.getAllPosts().subscribe(data => {
      this.allPostBox = data;
      this.allPostBox.map(post => {
        if (post.infos.hasAvatar) {
          firebase.storage().ref().child(`avatars/${post.infos.idUser}/myavatar`).getDownloadURL().then(url => {
            if (url != null) {
              post.infos.avatarUser = url;
            }
          });
        }
      });
    });
  }

  getPostFirends(MyUser) {
    this.db.list('/Users/' + MyUser.id + '/PostsFriends/').valueChanges().subscribe(data => {
      this.allPostFriendsBox = data;
      this.allPostFriendsBox.map(postFriend => {
        if (postFriend.infos.hasAvatar) {
          firebase.storage().ref().child(`avatars/${postFriend.infos.idUser}/myavatar`).getDownloadURL().then(url => {
            postFriend.infos.avatarUser = url;
          });
        }
      });
    });
  }

  getImage() {
    if (this.currentData.hasAvatar) {
      let image: string = this.currentData.id;
      this.imgUser = firebase.storage().ref().child(`avatars/${image}/myavatar`).getDownloadURL().then(url => {
        this.myImg = url;
      });
    }
  }

  postMode() {
    this.postModeTrue = true;
  }


  checkInput(e) {
    if (e.target.value.trim()) {
      this.writeMode = true;
      this.isFinishLoading = true;
    } else {
      this.writeMode = false;
      this.isFinishLoading = false;
    }
  }

  sendPost(myGroup: FormGroup) {

    const newid = UUID.UUID();


    if (this.postModeTrue) {

      // POST THE WORLD ////////////////
      if (this.postModeWorld) {

        // JUST WORD
        if (this.writeMode) {
          // EVERYONE
          this.db.list('/Posts/' + newid).update('infos', {
            id: newid,
            idUser: this.anAuth.auth.currentUser.uid,
            hasAvatar: this.currentData.hasAvatar,
            namePoster: this.currentData.name,
            message: this.messgeInput,
            date: Date.now(),
          });
          // EVERYONE

          // ADMIN
          this.db.list('/AllPostsAdmin/' + newid).update('infos', {
            id: newid,
            idUser: this.anAuth.auth.currentUser.uid,
            hasAvatar: this.currentData.hasAvatar,
            namePoster: this.currentData.name,
            message: this.messgeInput,
            date: Date.now(),
          });
          // ADMIN

          this.messgeInput = "";
          this.writeMode = false;

        }
        // JUST WORD

        else {
          // JUST MEDIA
          if (this.photoMode) {

            this.purcentageNumber = 0;
            this.isUploadVideoOK = true;

            const idMedia = uuid();

            this.uploadTaskVideo = firebase.storage().ref(this.basePath + '/' + idMedia + "/" + this.imgPreview.name).put(this.imgPreview).then((result) => {
              this.purcentageNumber = 25;
              firebase.storage().ref().child(this.basePath + '/' + idMedia + "/" + this.imgPreview.name).getDownloadURL().then(url => {
                this.imgPostedReal = url;
                this.purcentageNumber = 50;
                if (this.imgPostedReal) {
                  this.purcentageNumber = 75;

                  // EVERYONE
                  this.db.list('/Posts/' + newid).update('infos', {
                    id: newid,
                    idUser: this.anAuth.auth.currentUser.uid,
                    hasAvatar: this.currentData.hasAvatar,
                    namePoster: this.currentData.name,
                    date: Date.now(),
                    imagePostName: this.imgPreview.name,
                    imgPosted: this.imgPostedReal,
                  }).then(_ => {
                    this.purcentageNumber = 100;
                    if (this.purcentageNumber == 100) {
                      this.isUploadVideoOK = false;
                    }
                  });
                  // EVERYONE


                  // ADMIN
                  this.db.list('/AllPostsAdmin/' + newid).update('infos', {
                    id: newid,
                    idUser: this.anAuth.auth.currentUser.uid,
                    hasAvatar: this.currentData.hasAvatar,
                    namePoster: this.currentData.name,
                    date: Date.now(),
                    imagePostName: this.imgPreview.name,
                    imgPosted: this.imgPostedReal,
                  });
                  // ADMIN

                }
              })
            });

            this.photoMode = false;
            this.videoMode = false;
            this.isMediaVideoOK = false;
            this.myGroup.reset();
            this.isFinishLoading = false;
          } else {
            this.purcentageNumber = 0;
            this.isUploadVideoOK = true;

            const idMedia = uuid();

            this.uploadTaskVideo = firebase.storage().ref(this.basePathVideo + '/' + idMedia + "/" + this.videoPreview.name).put(this.videoPreview).then((result) => {
              this.purcentageNumber = 25;
              firebase.storage().ref().child(this.basePathVideo + '/' + idMedia + "/" + this.videoPreview.name).getDownloadURL().then(url => {
                this.urlVideo = url;
                if (this.urlVideo) {
                  this.purcentageNumber = 75;

                  // EVERYONE
                  this.db.list('/Posts/' + newid).update('infos', {
                    id: newid,
                    idUser: this.anAuth.auth.currentUser.uid,
                    hasAvatar: this.currentData.hasAvatar,
                    namePoster: this.currentData.name,
                    date: Date.now(),
                    videoPostName: this.videoPreview.name,
                    videoPosted: this.urlVideo,
                  }).then(_ => {
                    this.purcentageNumber = 100;
                    if (this.purcentageNumber == 100) {
                      this.isUploadVideoOK = false;
                    }
                  });
                  // EVERYONE

                  //  ADMIN
                  this.db.list('/AllPostsAdmin/' + newid).update('infos', {
                    id: newid,
                    idUser: this.anAuth.auth.currentUser.uid,
                    hasAvatar: this.currentData.hasAvatar,
                    namePoster: this.currentData.name,
                    date: Date.now(),
                    videoPostName: this.videoPreview.name,
                    videoPosted: this.urlVideo,
                  });
                  //  ADMIN
                }
              })
            });

            this.photoMode = false;
            this.videoMode = false;
            this.isMediaVideoOK = false;
            this.myGroup.reset();
            this.isFinishLoading = false;
          }
        }

      }



      // POST THE WORLD ////////////////


      // POST THE FRIENDS //////////////
      else {

        if (this.writeMode) {

          localStorage.setItem('POSTFRIEND', this.messgeInput);
          let postFriendMsg = localStorage.getItem('POSTFRIEND');
          // JUST WORD

          // ADMIN

          this.db.list('/AllPostsAdmin/' + newid).update('infos', {
            id: newid,
            message: this.messgeInput,
            idUser: this.anAuth.auth.currentUser.uid,
            hasAvatar: this.currentData.hasAvatar,
            namePoster: this.currentData.name,
            date: Date.now(),
          });

          // ADMIN


          // EVERYONE
          this.db.list('/Users/' + this.currentData.id + '/PostsFriends/' + newid).update('infos', {
            id: newid,
            message: this.messgeInput,
            idUser: this.anAuth.auth.currentUser.uid,
            hasAvatar: this.currentData.hasAvatar,
            namePoster: this.currentData.name,
            date: Date.now(),
          });

          this.db.list(`Users/` + this.currentData.id + '/Myfriends').valueChanges().subscribe((data: any) => {
            data.map(myFriend => {
              this.db.list('/Users/' + myFriend.infosFriend.idUserFriend + '/PostsFriends/' + newid).update('infos', {
                id: newid,
                message: postFriendMsg,
                idUser: this.currentData.id,
                hasAvatar: this.currentData.hasAvatar,
                namePoster: this.currentData.name,
                date: Date.now(),
              });
            });
          });
          // EVERYONE


          this.messgeInput = "";
          this.writeMode = false;

        }
        // JUST WORD

        else {

          // JUST MEDIA
          if (this.photoMode) {

            this.purcentageNumber = 0;
            this.isUploadVideoOK = true;

            const idMedia = uuid();

            this.uploadTaskVideo = firebase.storage().ref(this.basePath + '/' + idMedia + "/" + this.imgPreview.name).put(this.imgPreview).then((result) => {
              this.purcentageNumber = 25;
              firebase.storage().ref().child(this.basePath + '/' + idMedia + "/" + this.imgPreview.name).getDownloadURL().then(url => {
                this.imgPostedReal = url;
                this.purcentageNumber = 50;
                if (this.imgPostedReal) {

                  this.purcentageNumber = 75;

                  this.db.list('/Users/' + this.currentData.id + '/PostsFriends/' + newid).update('infos', {
                    id: newid,
                    idUser: this.anAuth.auth.currentUser.uid,
                    hasAvatar: this.currentData.hasAvatar,
                    namePoster: this.currentData.name,
                    date: Date.now(),
                    imagePostName: this.imgPreview.name,
                    imgPosted: this.imgPostedReal,
                  }).then(_ => {
                    this.purcentageNumber = 100;
                    if (this.purcentageNumber == 100) {
                      this.isUploadVideoOK = false;
                    }
                  });

                  // OTHER USER
                  this.db.list(`Users/` + this.currentData.id + '/Myfriends').valueChanges().subscribe((data: any) => {
                    data.map(myFriend => {
                      this.db.list('/Users/' + myFriend.infosFriend.idUserFriend + '/PostsFriends/' + newid).update('infos', {
                        id: newid,
                        idUser: this.anAuth.auth.currentUser.uid,
                        hasAvatar: this.currentData.hasAvatar,
                        namePoster: this.currentData.name,
                        date: Date.now(),
                        imagePostName: this.imgPreview.name,
                        imgPosted: this.imgPostedReal,
                      });
                    });
                  });
                  // OTHER USER

                  // ADMIN

                  this.db.list('/AllPostsAdmin/' + newid).update('infos', {
                    id: newid,
                    idUser: this.anAuth.auth.currentUser.uid,
                    hasAvatar: this.currentData.hasAvatar,
                    namePoster: this.currentData.name,
                    date: Date.now(),
                    imagePostName: this.imgPreview.name,
                    imgPosted: this.imgPostedReal,
                  });

                  // ADMIN

                }


              });
            });

            this.photoMode = false;
            this.videoMode = false;
            this.isMediaVideoOK = false;
            this.myGroup.reset();
            this.isFinishLoading = false;
          } else {

            this.purcentageNumber = 0;
            this.isUploadVideoOK = true;

            const idMedia = uuid();

            this.uploadTaskVideo = firebase.storage().ref(this.basePathVideo + '/' + idMedia + "/" + this.videoPreview.name).put(this.videoPreview).then((result) => {
              this.purcentageNumber = 25;
              firebase.storage().ref().child(this.basePathVideo + '/' + idMedia + "/" + this.videoPreview.name).getDownloadURL().then(url => {
                this.urlVideo = url;
                this.purcentageNumber = 50;
                if (this.urlVideo) {

                  this.purcentageNumber = 75;

                  // ADMIN

                  this.db.list('/AllPostsAdmin/' + newid).update('infos', {
                    id: newid,
                    idUser: this.anAuth.auth.currentUser.uid,
                    hasAvatar: this.currentData.hasAvatar,
                    namePoster: this.currentData.name,
                    date: Date.now(),
                    videoPostName: this.videoPreview.name,
                    videoPosted: this.urlVideo,
                  });

                  // ADMIN

                  this.db.list('/Users/' + this.currentData.id + '/PostsFriends/' + newid).update('infos', {
                    id: newid,
                    idUser: this.anAuth.auth.currentUser.uid,
                    hasAvatar: this.currentData.hasAvatar,
                    namePoster: this.currentData.name,
                    date: Date.now(),
                    videoPostName: this.videoPreview.name,
                    videoPosted: this.urlVideo,
                  }).then(_ => {
                    this.purcentageNumber = 100;
                    if (this.purcentageNumber == 100) {
                      this.isUploadVideoOK = false;
                    }
                  });

                  // OTHER USER
                  this.db.list(`Users/` + this.currentData.id + '/Myfriends').valueChanges().subscribe((data: any) => {
                    data.map(myFriend => {
                      this.db.list('/Users/' + myFriend.infosFriend.idUserFriend + '/PostsFriends/' + newid).update('infos', {
                        id: newid,
                        idUser: this.anAuth.auth.currentUser.uid,
                        hasAvatar: this.currentData.hasAvatar,
                        namePoster: this.currentData.name,
                        date: Date.now(),
                        videoPostName: this.videoPreview.name,
                        videoPosted: this.urlVideo,
                      });
                    });
                  });
                  // OTHER USER



                }

              });
            });

            this.photoMode = false;
            this.videoMode = false;
            this.isMediaVideoOK = false;
            this.myGroup.reset();
            this.isFinishLoading = false;
          }

        }

      }
      // POST THE FRIENDS //////////////

      this.isMediaOK = false;
      this.isMediaVideoOK = false;

    }
    this.isFinishLoading = false;
  }

  mediaEventOn(media) {
    switch (media) {
      case 'photo':
        this.isPhotoBtn = false;
        this.isVideoBtn = true;
        break;
      case 'video':
        this.isPhotoBtn = true;
        this.isVideoBtn = false;
        break;
    }
  }

  mediaEventOff(media) {
    switch (media) {
      case 'photo':
        this.isPhotoBtn = false;
        this.isVideoBtn = false;
        break;
      case 'video':
        this.isPhotoBtn = false;
        this.isVideoBtn = false;
        break;
    }
  }


  getImagePost(e) {
    this.imgPreview = e.target.files[0];
    if (this.imgPreview.size > 3145728) {
      this.snotifyService.error(`Le fichier est trop lourd`, 'fichier lourd');
    } else {
      this.imgPreview = e.target.files[0];
      this.photoMode = true;
      this.videoMode = false;
      let typeFile = this.imgPreview.type.split('/')[0];
      let typeEncrypted: string = CryptoJS.AES.encrypt(JSON.stringify(typeFile), 'typeFilePass').toString();
      localStorage.setItem('TP', typeEncrypted);
      var reader = new FileReader();
      reader.onload = (event: any) => {
        this.url = event.target.result;
        this.messgeInput = ' ';
        this.isMediaOK = true;
        this.isMediaVideoOK = false;
        this.isFinishLoading = true;
        this.snotifyService.success(`Le fichier est prêt à etre envoyer`, 'Fichier');
      }
      reader.readAsDataURL(this.imgPreview);
    }
  }


  getVideoPost(e) {
    this.videoPreview = e.target.files[0];
    if (this.videoPreview.size > 3145728) {
      this.snotifyService.error(`Le fichier est trop lourd`, 'fichier lourd');
    } else {
      this.isMediaOK = false;
      var URL = window.URL;
      const idMedia = uuid();
      this.photoMode = false;
      this.videoMode = true;
      let typeFile = this.videoPreview.type.split('/')[0];
      let typeEncrypted: string = CryptoJS.AES.encrypt(JSON.stringify(typeFile), 'typeFilePass').toString();
      localStorage.setItem('TP', typeEncrypted);
      this.messgeInput = ' ';
      this.isMediaVideoOK = true;
      this.isFinishLoading = true;
      this.previewVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(this.videoPreview));
    }
  }

  detailMessage(message) {

    this.detailsMessageId = message.infos.id;
    this.detailImg = message.infos.imgPosted;
    this.creatorhasAvatar = message.infos.hasAvatar;
    this.detailVideos = message.infos.videoPosted;
    this.dateImgOrVideo = message.infos.date;
    this.detailCreatorImg = message.infos.photo;
    this.detailCreatorName = message.infos.namePoster;
    this.messageDetail = message.infos.message;


    if (this.postModeWorld) {

      this.allReadyLiked = false;

      // MESSGESS
      this.db.list(`Posts/${this.detailsMessageId}/AllMessages`).valueChanges().subscribe(data => {
        this.allMessDetails = data;
        this.allMessDetails.map(message => {
          if (message.hasAvatar) {
            firebase.storage().ref().child(`avatars/${message.idUser}/myavatar`).getDownloadURL().then(url => {
              message.avatarUser = url;
            });
          }
        });
      });

      this.db.list(`Posts/${this.detailsMessageId}/likes`).valueChanges().subscribe(data => {
        this.allLikesDetails = data;
        this.allLikesDetails.map(likeUser => {
          if (likeUser) {
            if (likeUser.whoslike.idUser == this.currentData.id) {
              this.allReadyLiked = true;
            }
            if (likeUser.whoslike.hasAvatar) {
              firebase.storage().ref().child(`avatars/${likeUser.whoslike.idUser}/myavatar`).getDownloadURL().then(url => {
                likeUser.whoslike.avatarUser = url;
              });
            }
          } else {
            this.allReadyLiked = false;
          }
        });
      });
      // MESSGESS
    } else {

      this.allReadyLiked = false;

      // MESSGESS FRIENDS
      this.db.list(`Users/${this.anAuth.auth.currentUser.uid}/PostsFriends/${this.detailsMessageId}/AllMessages`).valueChanges().subscribe(data => {
        this.allMessFriendsDetails = data;
        this.allMessFriendsDetails.map(message => {
          if (message.hasAvatar) {
            firebase.storage().ref().child(`avatars/${message.idUser}/myavatar`).getDownloadURL().then(url => {
              message.avatarUser = url;
            });
          }
        });
      });

      this.db.list(`Users/${this.anAuth.auth.currentUser.uid}/PostsFriends/${this.detailsMessageId}/likes`).valueChanges().subscribe(data => {
        this.allLikesDetails = data;
        this.allLikesDetails.map(likeUser => {
          if (likeUser) {
            if (likeUser.whoslike.idUser == this.currentData.id) {
              this.allReadyLiked = true;
            }
            if (likeUser.whoslike.hasAvatar) {
              firebase.storage().ref().child(`avatars/${likeUser.whoslike.idUser}/myavatar`).getDownloadURL().then(url => {
                likeUser.whoslike.avatarUser = url;
              });
            }
          } else {
            this.allReadyLiked = false;
          }
        });
      });
    }
    // MESSGESS FRIENDS

    this.scrollDown();
  }

  sendMessageDetails(messageForm) {

    localStorage.setItem('MSGFRIEND', messageForm.value.messageTextControl)

    // ADMIN

    this.db.list(`AllPostsAdmin/${this.detailsMessageId}/AllMessages`).push({
      idUser: this.anAuth.auth.currentUser.uid,
      hasAvatar: this.currentData.hasAvatar,
      namePoster: this.currentData.name,
      message: messageForm.value.messageTextControl,
      date: Date.now(),
    });

    // ADMIN


    if (this.postModeWorld) {
      this.db.list(`Posts/${this.detailsMessageId}/AllMessages`).push({
        idUser: this.anAuth.auth.currentUser.uid,
        hasAvatar: this.currentData.hasAvatar,
        namePoster: this.currentData.name,
        message: messageForm.value.messageTextControl,
        date: Date.now(),
      });
    } else {

      this.db.list(`Users/${this.anAuth.auth.currentUser.uid}/PostsFriends/${this.detailsMessageId}/AllMessages`).push({
        idUser: this.anAuth.auth.currentUser.uid,
        hasAvatar: this.currentData.hasAvatar,
        namePoster: this.currentData.name,
        message: messageForm.value.messageTextControl,
        date: Date.now(),
      });

      let MsgFriend = localStorage.getItem('MSGFRIEND');
      this.db.list(`Users/` + this.currentData.id + '/Myfriends').valueChanges().subscribe((data: any) => {
        data.map(friend => {
          this.db.list(`Users/${friend.infosFriend.idUserFriend}/PostsFriends/${this.detailsMessageId}/AllMessages`).push({
            idUser: this.anAuth.auth.currentUser.uid,
            hasAvatar: this.currentData.hasAvatar,
            namePoster: this.currentData.name,
            message: MsgFriend,
            date: Date.now(),
          });
        });
      });

    }
    this.messageForm.reset();
    this.scrollDown();
  }

  likeEvent(mode) {

    if (this.postModeWorld) {

      switch (mode) {
        case 'islike':
          // LIKE MODE
          if (!this.allReadyLiked) {
            this.db.list(`Posts/${this.detailsMessageId}/likes/${this.currentData.id}`).update('whoslike', {
              idUser: this.anAuth.auth.currentUser.uid,
              hasAvatar: this.currentData.hasAvatar,
              namePoster: this.currentData.name,
              date: Date.now(),
            });
          }
          break;

        case 'dislike':
          // DESLIKE MODE
          if (this.allReadyLiked) {
            this.db.list(`Posts/${this.detailsMessageId}/likes`).remove(this.anAuth.auth.currentUser.uid).then(data => {
              this.allReadyLiked = false;
            });
          }
          break;
      }

    } else {

      switch (mode) {
        case 'islike':
          // LIKE MODE
          if (!this.allReadyLiked) {

            this.db.list(`Users/${this.anAuth.auth.currentUser.uid}/PostsFriends/${this.detailsMessageId}/likes/${this.currentData.id}`).update('whoslike', {
              idUser: this.anAuth.auth.currentUser.uid,
              hasAvatar: this.currentData.hasAvatar,
              namePoster: this.currentData.name,
              date: Date.now(),
            });

            this.db.list(`Users/` + this.currentData.id + '/Myfriends').valueChanges().subscribe((data: any) => {
              data.map(myFriend => {
                this.db.list(`Users/${myFriend.infosFriend.idUserFriend}/PostsFriends/${this.detailsMessageId}/likes/${this.currentData.id}`).update('whoslike', {
                  idUser: this.anAuth.auth.currentUser.uid,
                  hasAvatar: this.currentData.hasAvatar,
                  namePoster: this.currentData.name,
                  date: Date.now(),
                });
              });
            });

          }
          break;

        case 'dislike':
          // DESLIKE MODE
          if (this.allReadyLiked) {

            this.db.list(`Users/${this.anAuth.auth.currentUser.uid}/PostsFriends/${this.detailsMessageId}/likes`).remove(this.anAuth.auth.currentUser.uid).then(data => {
              this.allReadyLiked = false;
            });

            this.db.list(`Users/` + this.currentData.id + '/Myfriends').valueChanges().subscribe((data: any) => {
              data.map(myFriend => {
                this.db.list(`Users/${myFriend.infosFriend.idUserFriend}/PostsFriends/${this.detailsMessageId}/likes`).remove(this.anAuth.auth.currentUser.uid).then(data => {
                  this.allReadyLiked = false;
                });
              });
            });

          }
          break;
      }

    }

  }

  showLikes(mode) {
    switch (mode) {
      case 'true':
        this.likeShow = true;
        break;
      case 'false':
        this.likeShow = false;
        break;
    }
  }

  setInfosIcon(mode) {
    switch (mode) {
      case 'public':
        this.showMessInfos = true;
        break;
      case 'private':
        this.showMessInfos = true;
        break;
    }
  }

  setInfosIconLeave(mode) {
    switch (mode) {
      case 'public':
        this.showMessInfos = false;
        break;
      case 'private':
        this.showMessInfos = false;
        break;
    }
  }

  ngOnDestroy() {
    this.subscribe = false;
  }


}
