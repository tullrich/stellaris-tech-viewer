import { Component, OnInit } from '@angular/core';
import { TechnologyLibraryService } from '../services/technology-library/technology-library.service';
import * as dagre from "dagre";
import * as _ from "lodash";

const LOW_WEIGHT_TECHS = {
  "tech_colonial_centralization": true,
  "tech_galactic_administration": true,
  "tech_food_processing_1": true,
  "tech_gene_crops": true,
  "tech_colonization_1": true
};

@Component({
  selector: 'app-technology-web',
  templateUrl: './technology-web.component.html',
  styleUrls: ['./technology-web.component.scss']
})
export class TechnologyWebComponent implements OnInit {
  g: dagre.graphlib.Graph;
  nodes: dagre.Node[];
  edges: dagre.Edge[];

  constructor(
    private store: TechnologyLibraryService
  ) { }

  ngOnInit() {
    this.g = new dagre.graphlib.Graph({
      directed: true
    });
    this.g.setGraph({
      marginx: 50,
      marginy: 50,
      rankdir: 'LR',
      ranksep: 200,
      nodesep: 35,
      edgesep: 10,
      compound: true,
    });
    this.g.setDefaultEdgeLabel(function() { return {}; });

    // Add nodes
    this.store.techs.forEach((t) => {
      this.g.setNode(t.id, { tech: t, width: 300, height: 75 });
    })

    // Add edges
    this.store.techs.forEach((t) => {
      if (t.prerequisites) {
        t.prerequisites.forEach((preReq) => {
          if (preReq.id && (LOW_WEIGHT_TECHS[preReq.id] === undefined)) {
            this.g.setEdge(preReq.id, t.id, { weight: 1 });
          }
        });
      }
    });

    dagre.layout(this.g);

    this.nodes = this.g.nodes().map((v) => this.g.node(v));
    this.edges = this.g.edges();
  }

  layoutNode(n: dagre.Node) {
    return {
      'left.px': n.x - n.width/2.0,
      'top.px': n.y - n.height/2.0,
      'width.px': n.width,
      'height.px': n.height
    }
  }

  strokeEdge(e: dagre.Edge) {
    if (false) {
      let eDef = this.g.edge(e);
      return _.reduce(
        eDef.points
        , (accumulator, point, index) => {
          if (index === 0) {
            return `M ${point.x} ${point.y} `;
          } else {
            return accumulator + `L ${point.x} ${point.y} `;
          }
        }
        , ''
      );
    } else {
      let start = this.g.node(e.v);
      let end = this.g.node(e.w);
      return `M ${start.x + start.width/2} ${start.y} L ${end.x - end.width/2} ${end.y}`;
    }
  }
}
