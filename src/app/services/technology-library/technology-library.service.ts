import { Injectable } from '@angular/core';
import { Technology } from '../../models/technology.model';
import { TECH_DEFINES } from './tech-defines';
import * as _ from 'lodash';

declare var require;

@Injectable({
  providedIn: 'root'
})
export class TechnologyLibraryService {
  localization = require('./localizations/technology_l.english.json');
  techs: Technology[];

  constructor() {
    let techMap = _.merge(
      require('./data/00_eng_tech.json'),
      require('./data/00_eng_tech_repeatable.json'),
      require('./data/00_eng_weapon_tech.json'),
      require('./data/00_phys_tech.json'),
      require('./data/00_phys_tech_repeatable.json'),
      require('./data/00_phys_weapon_tech.json'),
      require('./data/00_soc_tech.json'),
      require('./data/00_soc_tech_repeatable.json'),
      require('./data/00_soc_weapon_tech.json'),
      require('./data/00_synthetic_dawn_tech.json')
    );

    this.techs = _.chain(techMap)
      .toPairs()
      .filter(([id, val]) => typeof(val) === "object")
      .map(([id, val]) => {
        return {
          id: id,
          name: this.localizeString(id),
          description: this.localizeString(id+"_desc"),
          category: this.parseCategory(val.category),
          tier: +val.tier,
          cost: this.resolveDefine(val.cost),
          weight: this.resolveDefine(val.weight),
          is_rare: val.is_rare,
          start_tech: val.start_tech,
          area: val.area
        }
      })
      .value();

    _.forEach(this.techs, (tech) => {
      if (tech.prerequisites) {
        tech.prerequisites = _.map(tech.prerequisites, (prereq) => techMap[prereq]||prereq);
      }
    });

    console.log(this.techs);
  }

  parseCategory(categories: string[]|undefined) {
    if (categories && categories.length == 1) {
      return this.localizeString(categories[0]);
    }
    return "";
  }

  resolveDefine(valOrDefine: string|number) {
    if (typeof(valOrDefine) === "string") {
      if (valOrDefine.startsWith("@")) {
        return TECH_DEFINES[valOrDefine]||valOrDefine;
      }
    }
    // Is a value
    return valOrDefine;
  }

  localizeString(key: string) {
    return this.localization[key]||key;
  }

  getAreaClass(tech: Technology) {
    switch(tech.area) {
      case 'engineering': return "tech-eng";
      case 'physics': return "tech-phys";
      case 'society': return "tech-soc";
      default: return '';
    }
  }
}
