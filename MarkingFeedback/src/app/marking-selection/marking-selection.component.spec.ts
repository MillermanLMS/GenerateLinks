import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkingSelectionComponent } from './marking-selection.component';

describe('MarkingSelectionComponent', () => {
  let component: MarkingSelectionComponent;
  let fixture: ComponentFixture<MarkingSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarkingSelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkingSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
