import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { AngularFireAuth } from 'angularfire2/auth';
import { MomentModule } from 'angular2-moment';
import { NgProgressModule } from 'ngx-progressbar';
// ORIGINAL COMPONENT

// SERVICES

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
        HttpClientModule,
        HttpModule,
        MomentModule,
        NgProgressModule,
    ]
})
export class ProfilModule { }