import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AngularFireAuth } from 'angularfire2/auth';
import { SnotifyService } from 'ng-snotify';

@Component({
  selector: 'app-authentification',
  templateUrl: './authentification.component.html',
  styleUrls: ['./authentification.component.css']
})
export class AuthentificationComponent implements OnInit {

  private loginCurrent: boolean = true;
  private currentDate: number = new Date().getFullYear();
  private welKomeEvent: Subscription;
  private ToastEvent: boolean = false;

  public authForm: FormGroup;
  private emailControl: FormControl;
  private passwordControl: FormControl;
  public hasError: boolean;
  public nameCreatedUser: boolean;
  public loadingState: boolean;
  public modeBan: boolean;

  constructor(
    private builder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private anAuth: AngularFireAuth,
    private snotifyService: SnotifyService
  ) { }

  ngOnInit() {
    this.initFormAUTH();
    this.getRegisterEvent(event);
  }

  initFormAUTH() {
    this.emailControl = new FormControl('', Validators.required);
    this.passwordControl = new FormControl('', Validators.required);
    this.authForm = this.builder.group({
      emailControl: this.emailControl,
      passwordControl: this.passwordControl,
    });
    if (localStorage.getItem('BAN')) {
      this.modeBan = true;
      setTimeout(() => {
        this.modeBan = false;
        localStorage.removeItem('BAN');
      }, 5000);
    }
  }

  authButton(loginForm: FormGroup) {

    this.loadingState = true;
    this.hasError = false

    this.anAuth.auth.signInWithEmailAndPassword(
      loginForm.value.emailControl,
      loginForm.value.passwordControl
    ).then((res) => {
      this.authService.authSuccessfully(this.loadingState);
    }).catch((err) => {
      this.hasError = true;
      this.loadingState = false;
    });
  }

  goToRegister() {
    this.router.navigate(['inscription']);
  }

  getRegisterEvent(e) {
    e != null ? this.nameCreatedUser = true : this.nameCreatedUser = false;
  }

}
