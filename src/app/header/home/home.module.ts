import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { MomentModule } from 'angular2-moment';
import { NgProgressModule } from 'ngx-progressbar';
// ORIGINAL COMPONENT

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
export class HomeModule { }
