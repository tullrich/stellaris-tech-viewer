import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Technology } from '../models/technology.model';
import { WebCacheService } from '../services/web-cache/web-cache.service';
import { TechnologyLibraryService } from '../services/technology-library/technology-library.service';
import * as _ from "lodash";

declare var ELK;
declare var Worker;

const MINIMAP_DIMS = { x: 250.0, y: 250.0 };

@Component({
  selector: 'app-technology-web',
  templateUrl: './technology-web.component.html',
  styleUrls: ['./technology-web.component.scss']
})
export class TechnologyWebComponent implements OnInit, OnDestroy {
  @ViewChild('viewport') viewport: ElementRef;
  elk: any;
  g: any;
  nodes: any[];
  edges: any[];
  zoom = .6;
  filters = new Set();

  constructor(
    private store: TechnologyLibraryService,
    private cache: WebCacheService
  ) { }

  ngOnInit() {
    this.generateWeb();
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    if (this.elk) {
      this.elk.terminateWorker();
    }
  }

  generateWeb() {
    if (this.elk) {
      this.elk.terminateWorker();
      this.elk = undefined;
    }
    this.g = undefined;
    this.nodes = undefined;
    this.edges = undefined;

    let cached = this.cache.getWeb(Array.from(this.filters.values()));
    if (cached) {
      console.log("Cache found!");
      this.g = cached.graph;
      this.nodes = cached.nodes;
      this.edges = cached.edges;
      return;
    }

    this.elk = new ELK({
      workerUrl: 'assets/script/elk-worker.min.js',
      workerFactory: function(url: string) { return new Worker(url); }
    });

    let partitionFor = (t: Technology) => {
      if (t.tier == -2) {
        return 5; // repeatable
      }
      return t.tier||0;
    };

    let tech_set = new Set();
    let collectPrereqs_r = (t: Technology) => {
      tech_set.add(t)
      t.prerequisites.forEach((pr) => collectPrereqs_r(pr));
    };
    _.filter(this.store.techs, (t) => !this.filters.has(t.area))
      .map((t) => collectPrereqs_r(t));
    let techs = Array.from(tech_set.values());

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
        'elk.layered.contentAlignment': 'V_TOP',
        'elk.padding': '[left=100, top=200, right=300, bottom=300]'
      },
      children: techs.map((t) => ({ id: t.id, width: 250, height: 70, tech: t, layoutOptions: { 'elk.partitioning.partition': partitionFor(t) } })),
      edges: _.flatMap(techs, (t) => {
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

    this.elk.layout(graph)
       .then((graph) => {
         console.log(graph);
         this.g = graph;
         this.nodes = graph.children;
         this.edges = graph.edges;
         // this.cache.write({
         //   graph: this.g,
         //   nodes: this.nodes,
         //   edges: this.edges
         // });
       })
       .catch(console.error)
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
  }

  onMinimapMousemove(e: MouseEvent) {
    if (e.buttons & 1) {
      let ele = this.viewport.nativeElement;
      ele.scrollLeft = ele.scrollWidth*e.offsetX/MINIMAP_DIMS.x - ele.offsetWidth/2.0;
      ele.scrollTop = ele.scrollHeight*e.offsetY/MINIMAP_DIMS.y - ele.offsetHeight/2.0;
    }
  }

  incrementZoom(value: number) {
    let newZoom = Math.min(Math.max(this.zoom + value, .2), 1.0);
    if (newZoom != this.zoom) {
      let ele = this.viewport.nativeElement;
      let normScrollX = (ele.scrollLeft-ele.offsetWidth/2.0)/ele.scrollWidth;
      let normScrollY = (ele.scrollTop-ele.offsetHeight/2.0)/ele.scrollHeight;
      this.zoom = newZoom;
      ele.scrollLeft = normScrollX*ele.scrollWidth;
      ele.scrollTop = normScrollY*ele.scrollHeight;
    }
  }

  toggleFilter(filter: string) {
    if (this.filters.has(filter)) {
      this.filters.delete(filter);
    } else {
      this.filters.add(filter);
    }
    this.generateWeb();
  }
}
