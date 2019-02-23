import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { CommunicationService } from '../../services/communication.service';
import { AuthService } from '../../services/auth.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireStorage } from 'angularfire2/storage';
import { AngularFireDatabase } from 'angularfire2/database';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import * as firebase from 'firebase/app';
import { switchMapTo } from 'rxjs-compat/operator/switchMapTo';
declare var jQuery: any;

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css']
})
export class ProfilComponent implements OnInit {

  @ViewChild('myInput') myInput: ElementRef;
  @ViewChild('inputNew') inputNew: ElementRef;
  @ViewChild('inputRtp') inputRtp: ElementRef;


  @ViewChild('locaInput') locaInput: ElementRef;
  @ViewChild('bioInput') bioInput: ElementRef;
  @ViewChild('ageInput') ageInput: ElementRef;

  public basePath: string = '/avatars';
  public subscribe: boolean = true;
  public currentData;

  public imgPreview;
  private urlImage;
  public mediaImportedOK: boolean;
  public trackVideo;

  public myImg;
  public myImgBackground;
  public changeImgMode: boolean;

  public passForm: FormGroup;
  public newPassControl: FormControl;
  public retapPassControl: FormControl;

  public newPassText;
  public retPassText;

  public webCameMode: boolean;

  public btnSaveIsOk: boolean;
  public uploadTask;
  public purcentageNumber: number = 0;
  public isUploadModeSpinner: boolean;

  public snapInitMode: boolean = true;
  public openCameraMode: boolean = false;

  public typeInputModeNew: string = 'password';
  public eyeModePassword: boolean = true;

  public typeInputModeRetp: string = 'password';
  public eyeModePasswordRtp: boolean = true;

  public somethingHasChange: boolean;
  public somethingHasChangeText: boolean;
  public goodPassWord: boolean;
  public wrongPassWord: boolean;

  public backgroundMode: boolean;
  public otherUserView: boolean;
  public getDatasLocal;
  public localIsOK: boolean;
  public localText: string;
  public itemsAsObjects: any[] = [];
  public itemsAsObjectsList;
  public visibleState: boolean;

  constructor(
    private authService: AuthService,
    private anAuth: AngularFireAuth,
    private storage: AngularFireStorage,
    private communicationService: CommunicationService,
    private db: AngularFireDatabase,
    private builder: FormBuilder,
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
        this.getImage();
        this.getBackground();
        this.currentData.age != undefined ? this.ageInput.nativeElement.value = this.currentData.age : this.ageInput.nativeElement.value = '';
        this.currentData.localisation != undefined ? this.locaInput.nativeElement.value = this.currentData.localisation : this.locaInput.nativeElement.value = '';
        this.currentData.bio != undefined ? this.bioInput.nativeElement.value = this.currentData.bio : this.bioInput.nativeElement.value = "";
        if (this.currentData.hobbies) {
          this.itemsAsObjectsList = this.currentData.hobbies;
        } else {
          this.itemsAsObjectsList = [];
        }
        this.visibleState = this.currentData.visibility;
      });
    });
    this.initForm();
  }

  private initForm() {
    this.passForm = new FormGroup({
      newPassControl: new FormControl('', Validators.required),
      retapPassControl: new FormControl('', Validators.required)
    });

  }

  getImage() {
    this.openCameraMode = true;
    if (this.currentData.hasAvatar) {
      this.changeImgMode = true;
      let image: string = this.currentData.id;
      firebase.storage().ref().child(`avatars/${image}/myavatar`).getDownloadURL().then(url => {
        this.changeImgMode = false;
        this.myImg = url;
      });
    }
  }

  getBackground() {
    this.openCameraMode = true;
    if (this.currentData.hasBackground) {
      this.changeImgMode = true;
      let image: string = this.currentData.id;
      firebase.storage().ref().child(`wallPapers//${image}/mybackground`).getDownloadURL().then(url => {
        this.changeImgMode = false;
        this.myImgBackground = url;
      });
    }
  }

  takePictureFunction(stopMode) {
    this.webCameMode = true;
    let video: any
    this.snapInitMode = false;
    if (!this.snapInitMode) {
      video = document.getElementById('video');
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
          video.src = window.URL.createObjectURL(stream);
          video.play();
          if (stopMode) {
            this.trackVideo = stream.getTracks()[0];
            this.trackVideo.stop();
          }
        });
      }
    }
  }

  takeRealPicture() {
    let canvas: any = document.getElementById('canvas');
    let context = canvas.getContext('2d');
    let video = document.getElementById('video');
    context.drawImage(video, 0, 0, 440, 280);
    canvas.toBlob(data => {
      if (data != null) {
        this.imgPreview = data;
        this.btnSaveIsOk = true;
      }
    })
  }

  getImgByDesktop(e) {
    this.webCameMode = false;
    this.imgPreview = e.target.files[0];
    var reader = new FileReader();
    reader.onload = (event: any) => {
      this.urlImage = event.target.result;
      if (this.urlImage) {
        this.mediaImportedOK = true;
        this.btnSaveIsOk = true;
      }
    }
    reader.readAsDataURL(this.imgPreview);
  }

  changeBackground(mode) {
    switch (mode) {
      case 'background':
        this.backgroundMode = true;
        break;
      case 'avatar':
        this.backgroundMode = false;
        break;
    }
  }

  changeTypeInput(type) {
    switch (type) {
      // NEW PASSWORD FIRST STEP
      case 'newO':
        this.typeInputModeNew = 'text';
        this.eyeModePassword = false;
        break;
      case 'newC':
        this.typeInputModeNew = 'password';
        this.eyeModePassword = true;
        break;
      // NEW PASSWORD FIRST STEP

      // RETAPE NEW PASSWORD SECOND STEP
      case 'retO':
        this.typeInputModeRetp = 'text';
        this.eyeModePasswordRtp = false;
        break;

      case 'retC':
        this.typeInputModeRetp = 'password';
        this.eyeModePasswordRtp = true;
        break;
      // RETAPE NEW PASSWORD SECOND STEP
    }
  }

  checkAgeInput(e) {
    if (e.target.value.trim() != '') {
      this.somethingHasChangeText = true;
    } else {
      this.somethingHasChangeText = false;
    }
  }

  selectLocalisation(local) {
    this.locaInput.nativeElement.value = "";
    this.locaInput.nativeElement.value = local.nom;
    this.localIsOK = false;
    this.bioInput.nativeElement.value;
    this.somethingHasChangeText = true;
  }

  checkBio(e) {
    if (e.target.value.trim() != '') {
      this.somethingHasChangeText = true;
    } else {
      this.somethingHasChangeText = false;
    }
  }

  checkLocationInput(e) {
    if (e.target.value.trim() != '') {
      setTimeout(() => {
        this.authService.getAllLocalisationData(e.target.value).subscribe(data => {
          this.getDatasLocal = data;
          this.localIsOK = true;
        });
      }, 2000);
    } else {
      this.localIsOK = false;
    }
  }

  checkPassWord(mode, valueInput) {
    let passwordREGEX = /^(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{8,100}$/i;
    switch (mode) {
      case 'new':
        this.newPassText = valueInput.target.value;
        break;

      case 'retp':
        this.retPassText = valueInput.target.value;
        break;
    }

    if (this.newPassText == this.retPassText) {
      this.wrongPassWord = true;
      this.goodPassWord = false;
      if (passwordREGEX.test(this.newPassText)) {
        this.wrongPassWord = false;
        this.goodPassWord = true;
      }
    } else {
      this.wrongPassWord = true;
      this.goodPassWord = false;
    }
  }

  onItemAdded(e) {
    this.somethingHasChangeText = true;
  }

  onItemRemoved(e) {
    this.somethingHasChangeText = true;
  }
  saveDateUser() {

    if (this.currentData.localisation != this.locaInput.nativeElement.value) {
      this.db.list(`Users/`).update(this.currentData.id, {
        localisation: this.locaInput.nativeElement.value,
      });
    }

    if (this.currentData.localisation != this.bioInput.nativeElement.value) {
      this.db.list(`Users/`).update(this.currentData.id, {
        bio: this.bioInput.nativeElement.value,
      });
    }

    if (this.currentData.localisation != this.ageInput.nativeElement.value) {
      this.db.list(`Users/`).update(this.currentData.id, {
        age: this.ageInput.nativeElement.value,
      });
    }

    this.db.list(`Users/`).update(this.currentData.id, {
      hobbies: this.itemsAsObjectsList,
    });

    this.somethingHasChangeText = false;
  }


  changeInfos() {
    this.anAuth.auth.currentUser.updatePassword(this.newPassText).then(_ => {
      this.goodPassWord = false;
      this.inputNew.nativeElement.value = "";
      this.inputRtp.nativeElement.value = "";
    })
  }

  viewInSearch(state) {

    switch (state) {

      case 'visible':
        setTimeout(() => {
          this.db.list(`Users/`).update(this.currentData.id, {
            visibility: false,
          });
        }, 1000);
        break;

      case 'invisible':
        setTimeout(() => {
          this.db.list(`Users/`).update(this.currentData.id, {
            visibility: true,
          });
        }, 1000);
        break;
    }

  }

  saveFile() {
    // AVATAR MODE
    if (!this.backgroundMode) {
      this.isUploadModeSpinner = true;
      this.uploadTask = firebase.storage().ref(this.basePath + '/' + this.currentData.id + "/" + 'myavatar').put(this.imgPreview).then((result) => {
        this.purcentageNumber = 25;
        this.purcentageNumber = 50;
        firebase.storage().ref().child(this.basePath + '/' + this.currentData.id + "/" + 'myavatar').getDownloadURL().then(url => {
          this.purcentageNumber = 75;
          if (this.purcentageNumber == 75) {
            if (url != null) {
              this.db.list(`Users/`).update(this.currentData.id, {
                hasAvatar: true,
                photo: url
              }).then(_ => {
                this.isUploadModeSpinner = false;
                jQuery("#myModal").modal("hide");
                this.snapInitMode = true;
                this.mediaImportedOK = false;
                this.btnSaveIsOk = false;
                this.myInput.nativeElement.value = "";
                this.purcentageNumber = 100;
                let stopMode = true;
                this.takePictureFunction(stopMode);
              })
            }
          }
        });
      });
    } else {
      // BACKGROUND MODE
      this.isUploadModeSpinner = true;
      this.uploadTask = firebase.storage().ref('wallPapers' + '/' + this.currentData.id + "/" + 'mybackground').put(this.imgPreview).then((result) => {
        this.purcentageNumber = 25;
        this.purcentageNumber = 50;
        firebase.storage().ref().child('wallPapers' + '/' + this.currentData.id + "/" + 'mybackground').getDownloadURL().then(url => {
          this.purcentageNumber = 75;
          if (this.purcentageNumber == 75) {
            if (url != null) {
              this.db.list(`Users/`).update(this.currentData.id, {
                hasBackground: true,
                photoBackground: url
              }).then(_ => {
                this.isUploadModeSpinner = false;
                jQuery("#myModal").modal("hide");
                this.snapInitMode = true;
                this.mediaImportedOK = false;
                this.btnSaveIsOk = false;
                this.myInput.nativeElement.value = "";
                this.purcentageNumber = 100;
                let stopMode = true;
                this.takePictureFunction(stopMode);
              })
            }
          }
        });
      });
    }

  }

  ngOnDestroy() {
    this.subscribe = false;
  }

}
