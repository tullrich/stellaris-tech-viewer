import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { TechnologyListComponent } from './technology-list/technology-list.component';
import { TechnologyWebComponent } from './technology-web/technology-web.component';

const appRoutes: Routes = [
  {
    path: 'list',
    component: TechnologyListComponent,
  },
  {
    path: 'web',
    component: TechnologyWebComponent,
  },
  {
    path: '',
    redirectTo: '/web',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/'
  },
];

@NgModule({
  declarations: [
    AppComponent,
    TechnologyListComponent,
    TechnologyWebComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(
      appRoutes,
      {
        useHash: true,
        //enableTracing: true // <-- debugging purposes only
      }
    )
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
