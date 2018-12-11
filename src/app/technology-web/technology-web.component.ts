import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Technology } from '../models/technology.model';
import { TechnologyLibraryService } from '../services/technology-library/technology-library.service';
import * as _ from "lodash";

declare var ELK;
declare var Worker;
const elk = new ELK({
  workerUrl: 'assets/script/elk-worker.min.js',
  workerFactory: function(url: string) { return new Worker(url); }
});

const MINIMAP_DIMS = { x: 350.0, y: 350.0 };

@Component({
  selector: 'app-technology-web',
  templateUrl: './technology-web.component.html',
  styleUrls: ['./technology-web.component.scss']
})
export class TechnologyWebComponent implements OnInit {
  @ViewChild('viewport') viewport: ElementRef;
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
        'elk.layered.unnecessaryBendpoints': true,
        'elk.layered.mergeEdges': true,
        'elk.alignment': 'CENTER',
        'elk.aspectRatio': 1.0,
        'elk.layered.highDegreeNodes.treatment': true,
        'elk.layered.highDegreeNodes.threshold': 4,
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

  layoutNode(n: any) {
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
      'transform': 'scale(' + MINIMAP_DIMS.x/this.g.width + ', ' + MINIMAP_DIMS.y/this.g.height + ')',
      'transform-origin': 'left top'
    }
  }

  minimapViewportStyle() {
    let ele = this.viewport.nativeElement;
    return {
      'left.px': MINIMAP_DIMS.x*ele.scrollLeft/ele.scrollWidth,
      'top.px': MINIMAP_DIMS.y*ele.scrollTop/ele.scrollHeight,
      'width.px': MINIMAP_DIMS.x*ele.offsetWidth/ele.scrollWidth,
      'height.px': MINIMAP_DIMS.y*ele.offsetHeight/ele.scrollHeight
    }
  }

  onScroll(e: Event) {
    //console.log(e);
  }
}
