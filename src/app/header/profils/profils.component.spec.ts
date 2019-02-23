import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilsComponent } from './profils.component';

describe('ProfilsComponent', () => {
  let component: ProfilsComponent;
  let fixture: ComponentFixture<ProfilsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfilsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
