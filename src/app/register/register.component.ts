import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { SnotifyService } from 'ng-snotify';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  @Output() registerEvent = new EventEmitter();

  public loginCurrent: boolean = true;
  public registerCurrent: boolean = false;
  public currentDate: number = new Date().getFullYear();

  public registerForm: FormGroup;
  public nameControl: FormControl;
  public emailControl: FormControl;
  public passwordControl: FormControl;
  public repasswordControl: FormControl;

  public spinnerIs: boolean;

  public registrationOK: boolean;
  public emailExist: boolean;
  public passIsDiff: boolean;
  public passIsNotCorect: boolean;

  constructor(
    private builder: FormBuilder,
    private anAuth: AngularFireAuth,
    private authService: AuthService,
    private router: Router,
    private snotifyService: SnotifyService,
    private db: AngularFireDatabase,
  ) { }

  ngOnInit() {
    this.initFormAUTH();
  }

  initFormAUTH() {
    this.nameControl = new FormControl('', Validators.required);
    this.emailControl = new FormControl('', Validators.required);
    this.passwordControl = new FormControl('', Validators.required);
    this.repasswordControl = new FormControl('', Validators.required);
    this.registerForm = this.builder.group({
      nameControl: this.nameControl,
      emailControl: this.emailControl,
      passwordControl: this.passwordControl,
      repasswordControl: this.repasswordControl
    });
  }

  authButton(registerForm: FormGroup) {
    if (this.passwordControl.value == this.repasswordControl.value) {
      this.passIsDiff = false;
      this.spinnerIs = true;
      this.anAuth.auth.createUserWithEmailAndPassword(
        registerForm.value.emailControl,
        registerForm.value.passwordControl
      ).then((res) => {
        let hasAvatar: boolean = false;
        this.registrationOK = true;
        this.registerEvent.emit(this.registrationOK);
        this.db.database
          .ref('Users')
          .child(this.anAuth.auth.currentUser.uid)
          .update({
            id: this.anAuth.auth.currentUser.uid,
            email: this.anAuth.auth.currentUser.email,
            name: registerForm.value.nameControl,
            hasAvatar: hasAvatar,
            visibility: true,
            banMode: false
          }).then(_ => {
            this.router.navigate(['authentification']);
          });
        this.spinnerIs = false;
      }).catch(err => {
        if (err.message == 'The email address is already in use by another account.') {
          this.emailExist = true;
        } else if (err.message == "Password should be at least 6 characters") {
          this.passIsNotCorect = true;
        }
      });
    } else {
      this.passIsDiff = true;
    }
  }

  checkEmail(e) {
    if (e.target.value.trim()) {
      this.emailExist = false;
    }
  }

  loginButton() {
    this.router.navigate(['authentification']);
  }


}
