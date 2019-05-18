import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReloadDemoComponent } from './reload-demo.component';

describe('ReloadDemoComponent', () => {
  let component: ReloadDemoComponent;
  let fixture: ComponentFixture<ReloadDemoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReloadDemoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReloadDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
