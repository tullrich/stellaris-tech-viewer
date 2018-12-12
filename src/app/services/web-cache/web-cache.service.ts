import { Injectable } from '@angular/core';
import { TechnologyLibraryService } from '../technology-library/technology-library.service';
import * as _ from 'lodash';

declare var require;

@Injectable({
  providedIn: 'root'
})
export class WebCacheService {
  precached: { graph: any, nodes: any[], edges: any[] };

  constructor(
    private store: TechnologyLibraryService
  ) {
    let cached = require('./precached/web_eps.json');
    this.precached = {
      graph: cached.graph,
      nodes: cached.nodes.map((node) => {
        return _.assign(node, {
          tech: this.store.getById(node.id)
        });
      }),
      edges: cached.edges
    };
  }

  write({graph, nodes, edges }:{ graph: any, nodes: any[], edges: any[] }) {
    console.log('Write');
    console.log(JSON.stringify({
      graph: { height: graph.height, width: graph.width },
      nodes: nodes.map((n) => ({
        id: n.id,
        width: n.width,
        height: n.height,
        x: n.x,
        y: n.y
      })),
      edges: edges.map((e) => ({
        id: e.id,
        sections: e.sections
      }))
    }, null, 2));
  }

  getWeb(filters: string[]) {
    if (filters.length == 0) {
      return this.precached;
    }
  }
}
