interface Stance {
  id: number;
  name: string;
  dom: "front" | "back" | "half-back" | "half-front";
}

export type LandingStance = 
"frontside" | //frontflip
 "semi" | //aerial semi
  "mega" | //aerial mega
   "backside" | //backflip
    "hyper" | // flashkick
     "complete" | // scoot
      "fake-mega";// tornado
      
export type Takeoff = 
"frontside" | //frontflip, pop kicks
   "front-vanish" | //raiz, gumbi
    "regular" | // cartwheel, btwist
     "backside" | //backflip, 
     "fake-backside" | //backside 720
     "master-swing" | //GMS
      "swing" | //corkscrew
       "wrap" | //wrapfull
        "back-vanish" ;//cheat 720;



export const allowedTakeoffs = (landingStance: LandingStance): Takeoff[] => {
    switch (landingStance) {
        case "frontside":
            return ["frontside", "regular"];
        case "semi":
            return ["front-vanish", "regular"];
        case "mega":
            return ["regular", "front-vanish"];
        case "backside":
            return ["backside", "fake-backside"];
        case "hyper":
            return ["frontside", "front-vanish", "regular", "fake-backside", "master-swing", "wrap", "back-vanish"];
        case "complete":
            return ["regular", "backside", "fake-backside", "swing", "back-vanish", "master-swing"];
        case "fake-mega":
            return ["swing", "front-vanish", "back-vanish"];
        default:
            return [];
    }
};
export const allowedAfterLandings = (Takeoff: Takeoff): LandingStance[] => {
    switch (Takeoff) {
        case "frontside":
            return ["frontside","hyper"];
        case "front-vanish":
            return ["semi","mega","hyper","fake-mega"];
        case "regular":
            return ["frontside","semi","mega","hyper","complete"];
        case "backside":
            return ["backside","complete"];
        case "fake-backside":
            return ["backside","complete","hyper"];
        case "master-swing":
            return ["complete","hyper"];
        case "swing":
            return ["complete","fake-mega"];
        case "wrap":
            return ["hyper"];
        case "back-vanish":
            return ["complete","fake-mega","hyper"];
        default:
            return [];
    }
};

export const transitions = (landingStance: LandingStance, takeoff: Takeoff): string => {
    switch (`${landingStance}-${takeoff}`) {
        //landing dom = front
     case "frontside-frontside":
        return "punch";
     case "frontside-regular":
        return "step-out";
     case "semi-front-vanish":
        return "frontswing";
     case "semi-regular":
        return "step-out";
     case "mega-regular":
        return "misleg";
     case "mega-front-vanish":
        return "vanish";
    case "fake-mega-swing":
        return "swing";
    case "fake-mega-front-vanish":
        return "vanish";
    case "fake-mega-back-vanish":
        return "vanish";

        //landing dom = back
        case "backside-backside":
            return "punch";
        case "backside-fake-backside":
            return "";
        //hyper
        case "hyper-frontside":
            return "re-direct";
        case "hyper-semi-frontswing":
            return "carry-through";
        case "hyper-front-vanish":
            return "re-direct";
        case "hyper-regular":
            return "";
        case "hyper-fake-backside":
            return "";
        case "hyper-master-swing"://GMS
            return "swing";
        case "hyper-wrap":
            return "wrap";
        case "hyper-back-vanish":
            return "re-direct";
        case "hyper-boneless":
            return "boneless";
        //complete
        case "complete-regular":
            return "reverse";
        case "complete-backside":
            return "pop";
        case "complete-fake-backside":
            return "";
        case "complete-swing":
            return "swing";
        case "complete-master-swing":
            return "vanish";
        case "complete-back-vanish":
            return "vanish";
        default:
            return "---";
    }
};
