
/*
  "area": "engineering",
  "tier": 0,
  "category": [
    "voidcraft"
  ],
  "prerequisites": [
    "tech_starbase_2"
  ],
  "start_tech": true,
  "potential": {
    "is_gestalt": true
  }
*/
export interface Technology {
  id: string;
  name: string;
  description: string;
  tier: number;
  catagory: string;
  start_tech: boolean;
  is_rare: boolean;
  area: string;

  prerequisites: Technology[];
  potential: (boolean|string)[];
}
