import { Component, OnInit } from '@angular/core';
import { TechnologyLibraryService } from '../services/technology-library/technology-library.service';
import * as dagre from "dagre";
import * as _ from "lodash";

@Component({
  selector: 'app-technology-web',
  templateUrl: './technology-web.component.html',
  styleUrls: ['./technology-web.component.scss']
})
export class TechnologyWebComponent implements OnInit {
  g: dagre.graphlib.Graph;
  nodes: dagre.Node[];
  edges: dagre.GraphEdge[];

  constructor(
    private store: TechnologyLibraryService
  ) { }

  ngOnInit() {
    this.g = new dagre.graphlib.Graph();
    this.g.setGraph({
      marginx: 50,
      marginy: 50,
      rankdir: 'RL',

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
          if (preReq.id) {
            this.g.setEdge(t.id, preReq.id);
          }
        });
      }
    });

    dagre.layout(this.g);

    this.nodes = this.g.nodes().map((v) => this.g.node(v));
    this.edges = this.g.edges().map((e) => this.g.edge(e));
  }

  layoutNode(n: dagre.Node) {
    return {
      'left.px': n.x - n.width/2.0,
      'top.px': n.y - n.height/2.0,
      'width.px': n.width,
      'height.px': n.height
    }
  }

  strokeEdge(e: dagre.GraphEdge) {
    return _.reduce(
      e.points
      , (accumulator, point, index) => {
        if (index === 0) {
          return `M ${point.x} ${point.y} `;
        } else {
          return accumulator + `L ${point.x} ${point.y} `;
        }
      }
      , ''
    );
  }
}
