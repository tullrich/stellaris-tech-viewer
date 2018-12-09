import { Component, OnInit } from '@angular/core';
import { TechnologyLibraryService } from '../services/technology-library/technology-library.service';

@Component({
  selector: 'app-technology-web',
  templateUrl: './technology-web.component.html',
  styleUrls: ['./technology-web.component.scss']
})
export class TechnologyWebComponent implements OnInit {

  constructor(
    private store: TechnologyLibraryService
  ) { }

  ngOnInit() {
  }

}
