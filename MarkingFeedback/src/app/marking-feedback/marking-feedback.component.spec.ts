import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkingFeedbackComponent } from './marking-feedback.component';

describe('MarkingFeedbackComponent', () => {
  let component: MarkingFeedbackComponent;
  let fixture: ComponentFixture<MarkingFeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarkingFeedbackComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkingFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
