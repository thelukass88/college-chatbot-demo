import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatChart } from './chat-chart';

describe('ChatChart', () => {
  let component: ChatChart;
  let fixture: ComponentFixture<ChatChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
