import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedigreeViewerComponent } from './pedigree-viewer.component';

describe('PedigreeViewerComponent', () => {
  let component: PedigreeViewerComponent;
  let fixture: ComponentFixture<PedigreeViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PedigreeViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PedigreeViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
