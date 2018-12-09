import { Component } from '@angular/core';
import { TechnologyLibraryService } from './services/technology-library/technology-library.service';
import { Technology } from "./models/technology.model";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'stellaris-tech-viewer';

  constructor(
    private store: TechnologyLibraryService
  )
  {
  }
}
