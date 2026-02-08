import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentCharts } from './student-charts';

describe('StudentCharts', () => {
  let component: StudentCharts;
  let fixture: ComponentFixture<StudentCharts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentCharts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentCharts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
