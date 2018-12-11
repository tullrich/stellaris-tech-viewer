import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Technology } from '../models/technology.model';
import { TechnologyLibraryService } from '../services/technology-library/technology-library.service';
import * as _ from "lodash";

declare var ELK;
const elk = new ELK()

@Component({
  selector: 'app-technology-web',
  templateUrl: './technology-web.component.html',
  styleUrls: ['./technology-web.component.scss']
})
export class TechnologyWebComponent implements OnInit {
  g: any;
  nodes: any[];
  edges: any[];

  constructor(
    private store: TechnologyLibraryService
  ) { }

  ngOnInit() {
    let i = 0;
    const graph = {
      id: "root",
      layoutOptions: {
        'elk.algorithm': 'layered',
        'elk.layered.mergeEdges': true,
        'elk.alignment': 'TOP',
        'elk.layered.highDegreeNodes.treatment': true,
        'elk.layered.highDegreeNodes.threshold': 6,
        'elk.direction': 'RIGHT',
        'elk.partitioning.activate': true,
        // 'elk.spacing.edgeEdge': 150.0,
        'elk.spacing.nodeNode': 30.0,
        // 'elk.spacing.edgeNode': 150.0,
        // 'elk.spacing.portsSurrounding': 150.0,
        'elk.spacing.componentComponent': 30.0,
        // 'elk.spacing.portPort': 150.0,
        //'elk.layered.spacing.edgeNodeBetweenLayers': 150.0,
        'elk.layered.spacing.nodeNodeBetweenLayers': 30.0,
        //'elk.layered.nodePlacement.bk.fixedAlignment': 'LEFTUP',
        'elk.layered.compaction.connectedComponents': true,
        'elk.separateConnectedComponents': false,
        'elk.layered.contentAlignment': 'V_TOP'
      },
      children:  this.store.techs.map((t) => ({ id: t.id, width: 168, height: 42, tech: t, layoutOptions: { 'elk.partitioning.partition': t.tier||0 } })),
      edges: _.flatMap(this.store.techs, (t) => {
        if (t.prerequisites.length > 0) {
          //  return [{ id: `edge_`, sources: t.prerequisites.map((pr) => pr.id), targets: [t.id] }];
          return _.transform(t.prerequisites, (result, preReq) => {
            if (preReq.id) {
              result.push({ id: `e${i++}`, sources: [preReq.id], targets: [t.id] });
            }
          }, []);
        }
        return [];
      })
    }
    elk.knownLayoutOptions()
      .then(console.log)

    elk.layout(graph)
       .then((graph) => {
         console.log(graph);
         this.g = graph;
         this.nodes = graph.children;
         this.edges = graph.edges;
       })
       .catch(console.error)
  }

  ngAfterViewInit() {
  }

  layoutNode(n: dagre.Node) {
    return {
      'left.px': n.x,
      'top.px': n.y,
      'width.px': n.width,
      'height.px': n.height
    }
  }

  strokeEdge(e: any) {
    if (e.sections.length <= 0) {
      return '';
    }
    let section = e.sections[0];
    let start = section.startPoint;
    let end = section.endPoint;

    let out = `M ${start.x} ${start.y} `;
    out +=  _.reduce(
      section.bendPoints
      , (accumulator, point, index) => {
        return accumulator + `L ${point.x} ${point.y} `;
      }
      , ''
    );
    return out + `L ${end.x} ${end.y}`;
  }

  edgeColor(e: any) {
    return 'black';
    // let end = this.g.node(e.w).tech;
    // switch(end.area) {
    //   case 'engineering': return "#E29C4388";
    //   case 'physics': return "#4396E288";
    //   case 'society': return "#5ACA9C88";
    //   default: return 'black';
    // }
  }

  tierString(t: Technology) {
    return (t.tier == 0) ? "Starting Tech" : `Tier: ${t.tier}`;
  }

  minimapStyle() {
    return {
      'transform': 'scale(' + 350/this.g.width + ', ' + 350/this.g.height + ')',
      'transform-origin': 'left top'
    }
  }
}
