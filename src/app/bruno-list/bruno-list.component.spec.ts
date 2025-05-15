import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrunoListComponent } from './bruno-list.component';

describe('BrunoListComponent', () => {
  let component: BrunoListComponent;
  let fixture: ComponentFixture<BrunoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrunoListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrunoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
