interface Stance {
  id: number;
  name: string;
  dom: "front" | "back";
}


export const LANDING_STANCES: Stance[] = [
    {
        id: 1,
        name: "frontside",
        dom: "front",
        //front flip
    },
    {
        id: 2,
        name: "semi",
        dom: "front",
        //aerial semi
    },
    {
        id: 3,
        name: "mega",
        dom: "front",
        //cart mega
    },
    {
        id: 4,
        name: "backside",
        dom: "back",
        //backflip
    },
    {
        id: 5,
        name: "hyper",
        dom: "back",
        //540
    },
    {
        id: 6,
        name: "complete",
        dom: "back",
        //scoot
    },
];

export const TAKEOFFS: Stance[] = [
    {
        id: 1,
        name: "frontside",
        dom: "front",
        //front flip
    },
    {
        id: 2,
        name: "semi-frontswing",
        dom: "front",
        //fs raiz
    },
    {
        id: 3,
        name: "mega-frontswing",
        dom: "front",
        //axe to webster
    },
    {
        id: 4,
        name: "front-vanish",
        dom: "front",
        //td raiz
    },
    {
        id: 5,
        name: "regular",
        dom: "front",
        //cartwheel
    },
    {
        id: 6,
        name: "backside",
        dom: "back",
        //backflip
    },
    {
        id: 7,
        name: "swing",
        dom: "back",
        //cork
    },
    {
        id: 8,
        name: "wrap",
        dom: "back",
        //wrapfull
    },
    {
        id: 9,
        name: "back-vanish",
        dom: "back",
        
    },
    {
        id: 10,
        name: "boneless",
        dom: "back",
        //boneless cork
    },

];
export type TakeoffName = typeof TAKEOFFS[number]["name"];
export type LandingStanceName = typeof LANDING_STANCES[number]["name"];



export const transitions = (landingStance: LandingStanceName, takeoff: TakeoffName): string => {
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
            return "->";
        case "hyper-swing"://GMS
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
        case "complete-swing":
            return "swing";
        case "complete-back-vanish":
            return "vanish";
        default:
            return "---";
    }
};
