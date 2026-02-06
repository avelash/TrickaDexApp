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
"frontside" | //frontflip
 "semi-frontswing" | // fs raiz
  "mega-frontswing" | //axe to webster
   "front-vanish" | //raiz
    "regular" | // cartwheel
     "backside" | //backflip
     "fake-backside" | //backside 720
     "master-swing" | //GMS
      "swing" | //corkscrew
       "wrap" | //wrapfull
        "back-vanish" | //cheat 720
         "boneless"; //boneless cork





export const transitions = (landingStance: LandingStance, takeoff: Takeoff): string => {
    switch (`${landingStance}-${takeoff}`) {
        //landing dom = front
     case "frontside-frontside":
        return "punch";
     case "frontside-regular":
        return "step-out";
     case "semi-semi-frontswing":
        return "frontswing";
     case "semi-regular":
        return "step-out";
     case "mega-mega-frontswing":
        return "misleg";
     case "mega-front-vanish":
        return "vanish";
    case "fake-mega-swing":
        return "swing";
    case "fake-mega-front-vanish":
        return "vanish";

        //landing dom = back
        case "backside-backside":
            return "punch";
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
            return "pop";
        case "complete-swing":
            return "swing";
        case "complete-back-vanish":
            return "vanish";
        default:
            return "---";
    }
};
