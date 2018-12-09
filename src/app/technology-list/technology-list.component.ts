import { Component, OnInit } from '@angular/core';
import { TechnologyLibraryService } from '../services/technology-library/technology-library.service';

@Component({
  selector: 'app-technology-list',
  templateUrl: './technology-list.component.html',
  styleUrls: ['./technology-list.component.scss']
})
export class TechnologyListComponent implements OnInit {

  constructor(
    private store: TechnologyLibraryService
  ) { }

  ngOnInit() {
  }

}
