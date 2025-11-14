import { Trick } from "../types";
import k540 from "../../assets/540_icon.png";
import tornado from "../../assets/tornado_icon.png";
import round from "../../assets/round_icon.png";
import backflip from "../../assets/backflip_icon.png";
import bhs from "../../assets/bhs_icon.png";
import handstand from "../../assets/handstand_icon.png";
import scoot from "../../assets/scoot_icon.png";
import cartwheel from "../../assets/cartwheel_icon.png";
import hook from "../../assets/hook_icon.png";
import forwardRoll from "../../assets/forwardRoll_icon.png";
import pop360 from "../../assets/pop360_icon.png";
import corkRodeo from "../../assets/corkRodeo_icon.png";
import rocketboi from "../../assets/rocketboi_icon.png";
import aerial from "../../assets/aerial_icon.png";
import frontflip from "../../assets/frontflip_icon.png";
import sideflip from "../../assets/sideflip_icon.png";
import macaco from "../../assets/macaco_icon.png";
import backRoll from "../../assets/backwardRoll_icon.png";
import compasso from "../../assets/compasso_icon.png";
import diveCartwheel from "../../assets/dive_cartwheel_icon.png";
import diveRoll from "../../assets/diveroll_icon.png";
import gumbi from "../../assets/gumbi_icon.png";
import kipup from "../../assets/kipUp_icon.png";
import roundoff from "../../assets/roundoff_icon.png";
import oneHandedCartwheel from "../../assets/oneHanded_Cartwheel_icon.png";
import swipe from "../../assets/swipe_icon.png";
import popFailong from "../../assets/pop_failong_icon.png";
import scootHyper from "../../assets/hyperScoot_icon.png";
import pop360shuriken from "../../assets/pop360_shuriken.png";
import popTornado from "../../assets/Poptornado.png";
import skipHook from "../../assets/skipHook.png";
import bKick from "../../assets/butterflyKick.png";

const TRICKS_DATA_RAW: Trick[] = [
  {
    id: "round_kick",
    name: "Round Kick",
    icon: round,
    types: ["kick"],
    prerequisites: [],
    difficulty: 0,
    description:
      "the practitioner lifts their knee, pivots on their supporting foot," +
      "and extends their leg in a circular motion to strike with the shin or top of the foot",
    tutorialUrl: "https://youtu.be/O3jxtY8OTMc?si=sDN6dcydpTaAtuQV",
  },
  {
    id: "tornado_kick",
    name: "Tornado Kick",
    icon: tornado,
    types: ["kick"],
    prerequisites: ["round_kick"],
    difficulty: 1,
    description: "a jumping roundhouse kick from a cheat-step setup",
    tutorialUrl: "https://youtu.be/b0kc_Xu7qQQ?si=hUFeyGDzmRP2Kma1",
  },
  {
    id: "540_kick",
    name: "540 Kick",
    icon: k540,
    types: ["kick"],
    prerequisites: ["tornado_kick", "swipe"],
    difficulty: 2,
    description: "A tornado kick landed in a hyper-stance",
    tutorialUrl: "https://youtu.be/HV4UYZVUS4s?si=uTcJn1I9LQTkBKD1",
  },
  {
    id: "backflip",
    name: "Backflip",
    icon: backflip,
    types: ["flip"],
    prerequisites: ["back_roll"],
    difficulty: 2,
    description: "A backwards 360° somersault in the air",
    tutorialUrl: "https://youtu.be/X9rHyckeTtg?si=eCkbCOcwsW6xNv5u",
  },
  {
    id: "back_handspring",
    name: "Back Handspring",
    icon: bhs,
    types: ["flip"],
    prerequisites: ["handstand"],
    difficulty: 2,
    description:
      "a 360° backwards somersault where the practitioner touches the ground with" +
      " their hands after half the rotation",
    tutorialUrl: "https://www.youtube.com/watch?v=mJgjlYwvLkw",
  },
  {
    id: "handstand",
    name: "Handstand",
    icon: handstand,
    types: ["transition"],
    prerequisites: [],
    difficulty: 0,
    description: "standing on hands, with legs extended vertically.",
    tutorialUrl:
      "https://www.youtube.com/watch?https://www.youtube.com/watch?v=KNC5lkoE2Fs&t=6s=mJgjlYwvLkw",
  },
  {
    id: "scoot",
    name: "Scoot",
    icon: scoot,
    types: ["transition"],
    prerequisites: [],
    difficulty: 0,
    description:
      "a 180° turn on one hand, from a kneeling position to standing",
    tutorialUrl: "https://www.youtube.com/watch?v=BaSU6o-FcOs",
  },
  {
    id: "cartwheel",
    name: "Cartwheel",
    icon: cartwheel,
    types: ["transition"],
    prerequisites: [],
    difficulty: 0,
    description:
      "a sideways acrobatic move where the body rotates" +
      " over the hands with legs raised, resembling a turning wheel",
    tutorialUrl: "https://youtu.be/GAbIx6oQAv4?si=Bq0mkOHVgZipA4kQ",
  },
  {
    id: "hook_kick",
    name: "Hook Kick",
    icon: hook,
    types: ["kick"],
    prerequisites: [],
    difficulty: 0,
    description:
      "a powerful turning kick where the fighter spins their body, extends the leg outward, and then hooks it back to " +
      "strike the target—usually with the heel—using the momentum from the spin for added speed and impact.",
    tutorialUrl: "https://youtu.be/SQl5Eu2LalA?si=gayUaoxsoGB1cBkZ",
  },
  {
    id: "forward_roll",
    name: "Forward Roll",
    icon: forwardRoll,
    types: ["roll", "flip"],
    prerequisites: [],
    difficulty: 0,
    description:
      "a basic gymnastic move where the practitioner tucks their head and rolls forward over their back",
    tutorialUrl: "https://www.youtube.com/watch?v=pIb9DvCQ7dU",
  },
  {
    id: "pop_360",
    name: "Pop 360",
    icon: pop360,
    types: ["kick"],
    prerequisites: ["hook_kick"],
    difficulty: 0,
    description:
      "starting with his back to the target, the practitioner jumps and " +
      "after a 180° spin, performs an outside crescent or hook kick.",
    tutorialUrl: "https://youtube.com/shorts/oG13xxzFGB0?si=rDU5iWhvVf2qVf8W",
  },
  {
    id: "cork_rodeo",
    name: "Cork Rodeo",
    icon: corkRodeo,
    types: ["flip", "twist"],
    prerequisites: ["cork"],
    difficulty: 4,
    description:
      "a cork with a rodeo grab, grabbing the hook kick " +
      "leg at the ankle and pulling it back into an arched position.",
    tutorialUrl: "https://www.youtube.com/watch?v=UNFAGNGyZeQ",
  },
  {
    id: "rocketboi",
    name: "Rocketboi",
    icon: rocketboi,
    types: ["flip"],
    prerequisites: ["backflip"],
    difficulty: 3,
    description:
      "A Backflip Pike with one hand reaching across the legs and the " +
      "other hand reaching behind.",
    tutorialUrl: "https://www.youtube.com/watch?v=bf8C4_8btQM",
  },
  {
    id: " aerial",
    name: "Aerial",
    icon: aerial,
    types: ["flip", "transition"],
    prerequisites: ["cartwheel"],
    difficulty: 2,
    description: "A no handed cartwheel.",
    tutorialUrl: "https://www.youtube.com/watch?v=dSntnWrIdz4",
  },
  {
    id: "frontflip",
    name: "Frontflip",
    icon: frontflip,
    types: ["flip"],
    prerequisites: ["dive_roll"],
    difficulty: 2,
    description: "a forward 360° somersault in the air.",
    tutorialUrl: "https://www.youtube.com/watch?v=l-JK_sO5ZnE",
  },
  {
    id: "sideflip",
    name: "Sideflip",
    icon: sideflip,
    types: ["flip"],
    prerequisites: [],
    difficulty: 2,
    description: "a sideways 360 somersault in the air.",
    tutorialUrl: "https://www.youtube.com/watch?v=00UsLr4LcMs",
  },
  {
    id: "macaco",
    name: "Macaco",
    icon: macaco,
    types: ["transition"],
    prerequisites: ["scoot", "cartwheel"],
    difficulty: 1,
    description:
      "Starting from a low crouch, one hand is placed on the ground" +
      " behind the body, and the legs swing over the head in a sweeping motion, launching the hips over.",
    tutorialUrl: "https://www.youtube.com/watch?v=sekDHtCi7QA",
  },
  {
    id: "backwards_roll",
    name: "Backwards Roll",
    icon: backRoll,
    types: ["flip"],
    prerequisites: [],
    difficulty: 0,
    description:
      "a basic gymnastic move where the practitioner tucks their head and rolls backward over their back.",
    tutorialUrl: "https://www.youtube.com/watch?v=U_scqEjjZbM",
  },
  {
    id: "compasso",
    name: "Compasso",
    icon: compasso,
    types: ["kick"],
    prerequisites: ["hook_kick"],
    difficulty: 0,
    description: " a hook kick with the opposite leg touching the ground.",
    tutorialUrl: "https://www.youtube.com/watch?v=2PTkgrZ3Q7A",
  },
  {
    id: "dive_cartwheel",
    name: "Dive Cartwheel",
    icon: diveCartwheel,
    types: ["transition", "flip"],
    prerequisites: ["cartwheel"],
    difficulty: 1,
    description:
      "a cartwheel where the practitioner jumps onto their hands when entering the cartwheel.",
    tutorialUrl: "https://www.youtube.com/shorts/lOSjFr2QjkU",
  },
  {
    id: "dive_roll",
    name: "Dive Roll",
    icon: diveRoll,
    types: ["flip"],
    prerequisites: ["forward_roll"],
    difficulty: 1,
    description: " a forward roll where the practitioner jumps into the roll.",
    tutorialUrl: "https://www.youtube.com/watch?v=m7wNLOlh5Mo",
  },
  {
    id: "gumbi",
    name: "Gumbi",
    icon: gumbi,
    types: ["transition"],
    prerequisites: ["cartwheel"],
    difficulty: 1,
    description: "a modified, arched-back cartwheel.",
    tutorialUrl: "https://www.youtube.com/watch?v=C3sIOHWAQoc",
  },
  {
    id: "kipup",
    name: "Kip Up",
    icon: kipup,
    types: ["transition"],
    prerequisites: ["forward_roll"],
    difficulty: 1,
    description:
      "a transition from lying on the back to a standing position, using a powerful kick of the legs and a push from the hands.",
    tutorialUrl: "https://www.youtube.com/watch?v=T9Cq4NcvTQ4",
  },
  {
    id: "roundoff",
    name: "Roundoff",
    icon: roundoff,
    types: ["transition"],
    prerequisites: ["cartwheel", "handstand"],
    difficulty: 1,
    description:
      "similar to a cartwheel, but the landing is done on both feet simultaneously, facing the opposite direction of arrival.",
    tutorialUrl: "https://www.youtube.com/watch?v=y1OoqEAb4OY",
  },
  {
    id: "one_handed_cartwheel",
    name: "One Handed Cartwheel",
    icon: oneHandedCartwheel,
    types: ["transition"],
    prerequisites: ["cartwheel"],
    difficulty: 0,
    description: "A cartwheel performed using only one hand.",
    tutorialUrl: "https://www.youtube.com/watch?v=QvJveqtCe-0",
  },
  {
    id: "swipe",
    name: "Swipe",
    icon: swipe,
    types: ["kick"],
    prerequisites: ["round_kick"],
    difficulty: 0,
    description:
      "A round kick where the practitioner jumps during the kick, then lands on the kicking leg.",
    tutorialUrl: "https://youtu.be/3bSLmzItjlA?si=HFUpsgyPhh6rDc9O",
  },
  {
    id: "pop_failong",
    name: "Pop Failong",
    icon: popFailong,
    types: ["kick"],
    prerequisites: ["pop_tornado", "pop_360_shuriken"],
    difficulty: 1,
    description: "A pop 360 shuriken with a round kick as well.",
    tutorialUrl: "https://www.youtube.com/watch?v=OtJ8Fk8pZEM",
  },
  {
    id: "scoot_hyper",
    name: "Scoot Hyper",
    icon: scootHyper,
    types: ["transition"],
    prerequisites: ["scoot"],
    difficulty: 1,
    description: "A scoot landed in a hyper-stance.",
    tutorialUrl: "https://www.youtube.com/watch?v=y6OAyEW3oJM",
  },
  {
    id: "pop_360_shuriken",
    name: "Pop 360 Shuriken",
    icon: pop360shuriken,
    types: ["kick"],
    prerequisites: ["pop_360"],
    difficulty: 1,
    description: "A pop 360 landing on the kicking leg.",
    tutorialUrl: "https://www.youtube.com/watch?v=HwWPw6Hgx_Q",
  },
  {
    id: "pop_tornado",
    name: "Pop Tornado",
    icon: popTornado,
    types: ["kick"],
    prerequisites: ["tornado_kick", "pop_360"],
    difficulty: 1,
    description: "A tornado kick from a pop setup. (jumping off both feet)",
    tutorialUrl: "https://www.youtube.com/watch?v=UYEVnH1WN0E",
  },
  {
    id: "skip_hook",
    name: "Skip Hook",
    icon: skipHook,
    types: ["kick"],
    prerequisites: ["hook_kick"],
    difficulty: 0,
    description:
      "The practitioner lifts his other leg and then skip onto it while performing a hook kick.",
    tutorialUrl: "https://www.youtube.com/shorts/s2KYPGhcuSA",
  },
  {
    id: "butterfly_kick",
    name: "Butterfly Kick",
    icon: bKick,
    types: ["kick"],
    prerequisites: ["swipe"],
    difficulty: 1,
    description:
      " an aerial move that involves a sideways jump and kick, " +
      "resembling a sideways cartwheel without hands, where the body rotates horizontally through the air." +
      " The practitioner kicks one leg up and over while the other leg provides a push-off, with the body held horizontally.",
    tutorialUrl: "https://www.youtube.com/watch?v=bu_F7trIlrs&t=12s",
  },
  {
    id: "swing_failong",
    name: "Swing Failong",
    icon: require("../../assets/swingFailong.png"),
    types: ["kick"],
    prerequisites: ["swipe", "pop_failong"],
    difficulty: 1,
    description:
      "A failong (shuriken followed by a round kick) from a back swing.\n Called also triple-kick or flick-flack",
    tutorialUrl: "https://www.youtube.com/watch?v=jx1tC2VFUkE",
  },
  {
    id: "cartwheel_switch",
    name: "Cartwheel Switch",
    icon: require("../../assets/Cartwheel_switch.png"),
    types: ["transition"],
    prerequisites: ["cartwheel"],
    difficulty: 1,
    description:
      "A cartwheel where the parctitioner switches there legs mid-way, landing on the leg the started in front.",
    tutorialUrl: "https://www.youtube.com/watch?v=vkkpKbb3XIA",
  },
  {
    id: "front_sweep",
    name: "Front Sweep",
    icon: require("../../assets/frontSweep_icon.png"),
    types: ["kick"],
    prerequisites: ["round_kick"],
    difficulty: 1,
    description:
      "A  very low round kick aimed for the target's lower calf or ankle.",
    tutorialUrl: "https://www.youtube.com/watch?v=gil8H175vSI",
  },
  {
    id: "back_sweep",
    name: "Back Sweep",
    icon: require("../../assets/backSweep_icon.png"),
    types: ["kick"],
    prerequisites: ["hook_kick"],
    difficulty: 1,
    description:
      "A very low hook kick aimed for the target's lower calf or ankle.",
    tutorialUrl: "https://www.youtube.com/watch?v=RvhimhGiym8",
  },
  {
    id: "side_kick",
    name: "Side Kick",
    icon: require("../../assets/sideKick_icon.png"),
    types: ["kick"],
    prerequisites: [],
    difficulty: 0,
    description:
      "The practitioner pivots on his supporting foot, rotates his hips, and drives his leg out in a straight line to the side.",
    tutorialUrl: "https://www.youtube.com/watch?v=XSfqGkoUkqQ",
  },
  {
    id: "flying_side_kick",
    name: "Flying Side Kick",
    icon: require("../../assets/flyingSideKick_icon.png"),
    types: ["kick"],
    prerequisites: ["side_kick"],
    difficulty: 1,
    description:
      "The practitioner pivots on his supporting foot, rotates his hips, and drives his leg out in a straight line to the side.",
    tutorialUrl: "https://www.youtube.com/watch?v=50RAVxgTeCY",
  },
  {
    id: "narabong",
    name: "Narabong",
    icon: require("../../assets/narabong_icon.png"),
    types: ["kick"],
    prerequisites: ["tornado_kick", "skip_hook"],
    difficulty: 1,
    description: "A tornado kick straight into a skip hook.",
    tutorialUrl: "https://www.youtube.com/shorts/x1vya4rH0sg",
  },
  {
    id: "o_kick",
    name: "O-Kick",
    icon: require("../../assets/okick_icon.png"),
    types: ["kick", "transition"],
    prerequisites: ["one_handed_cartwheel", "compasso"],
    difficulty: 1,
    description:
      "A cartwheel performed on one hand (commonly on the far hand), with a hook kick at the end.",
    tutorialUrl: "https://www.youtube.com/watch?v=litZcT0NCjc",
  },
  {
    id: "front_walkover",
    name: "Front Walkover",
    icon: require("../../assets/frontWalkover_icon.png"),
    types: ["transition"],
    prerequisites: ["handstand"],
    difficulty: 1,
    description:
      "A handstand that transitions smoothly into a one-legged bridge, then pushes back up gracefully to a standing position.",
    tutorialUrl: "https://www.youtube.com/watch?v=ZWUNWRfL6C8",
  },
  {
    id: "back_walkover",
    name: "Back Walkover",
    icon: require("../../assets/backWalkover_icon.png"),
    types: ["transition"],
    prerequisites: ["handstand"],
    difficulty: 1,
    description:
      "From a standing position the practitioner raises one leg and bends backwards transitioning to a handstand position" +
      "through a one legged bridge and then contniues back to standing.",
    tutorialUrl: "https://www.youtube.com/watch?v=dLbDyBambPc",
  },
  {
    id: "front_handspring",
    name: "Front handspring",
    icon: require("../../assets/frontHandspring_icon.png"),
    types: ["flip", "transition"],
    prerequisites: ["handstand"],
    difficulty: 2,
    description:
      "An acrobatic move where a person leaps forward from an upright position, uses their hands to momentarily support their" +
      " body as they invert, and then pushes off the ground with their hands to spring back to an upright position",
    tutorialUrl: "https://www.youtube.com/watch?v=ZRjqUUT453c",
  },
  {
    id: "au_batido",
    name: "Au Batido",
    icon: require("../../assets/auBatido_new.png"),
    types: ["kick", "transition"],
    prerequisites: ["one_handed_cartwheel", "handstand"],
    difficulty: 1,
    description:
      "A capoeira move where a practitioner performs a handstand and then freezes, kicking out one leg to the front while twisting " +
      'the hips.\nIt is literally translated as "broken cartwheel" and is also known as the "L-kick" in breakdancing. ',
    tutorialUrl: "https://www.youtube.com/watch?v=iULIWAZ1G_c",
  },
  {
    id: "flash_kick",
    name: "Flash Kick",
    icon: require("../../assets/flashKick_icon.png"),
    types: ["kick", "flip"],
    prerequisites: ["backflip"],
    difficulty: 3,
    description: "A backflip with a front kick executed half way through.",
    tutorialUrl: "https://www.youtube.com/watch?v=O4N6r0z5nBw",
  },
  {
    id: "gainer",
    name: "Gainer",
    icon: require("../../assets/gainer_icon.png"),
    types: ["flip"],
    prerequisites: ["backflip"],
    difficulty: 3,
    description: "A backflip performed off of one leg (from a back swing).",
    tutorialUrl: "https://www.youtube.com/watch?v=xyzq_ldkK2Q",
  },
  {
    id: "btwist_shuriken",
    name: "Btwist Shuriken",
    icon: require("../../assets/btwistShuriken_icon.png"),
    types: ["twist", "kick"],
    prerequisites: ["btwist", "pop_360_shuriken"],
    difficulty: 3,
    description:
      "A Btwist in which the rotation comes from an outside cresent (A shuriken).",
    tutorialUrl: "https://www.youtube.com/watch?v=37JicKEixLs",
  },
  {
    id: "raiz",
    name: "Raiz",
    icon: require("../../assets//raiz_icon.png"),
    types: ["transition", "flip"],
    prerequisites: ["tornado_kick", "gumbi"],
    difficulty: 2,
    description:
      "The trick begins with a stepping motion, followed by an explosive kick from" +
      ' the supporting leg, a strong body arch ("eagle"), and the leg sweeping over the head.\n' +
      "Can also be thought of a no handed gumbi.",
    tutorialUrl: "https://www.youtube.com/watch?v=5J39uRaPaaI&t=29s",
  },
  {
    id: "touchdown_round",
    name: "Touchdown Round",
    icon: require("../../assets/touchdownRound_icon.png"),
    types: ["kick"],
    prerequisites: ["round_kick"],
    difficulty: 0,
    description:
      "A round kick performed while touching the opposing hand to the ground.",
    tutorialUrl: "https://www.youtube.com/watch?v=Zq6TycUyMBQ",
  },
  {
    id: "cheat_720",
    name: "Cheat 720",
    icon: require("../../assets/cheat720_icon.png"),
    types: ["kick", "twist"],
    prerequisites: ["skip_hook", "tornado_kick"],
    difficulty: 1,
    description:
      'From a "cheat" setup, the practitioner spins vertically once, then executes a hook kick before landing.' +
      "\n 720° degrees of rotation are completed when including the cheat step and take off.",
    tutorialUrl: "https://www.youtube.com/watch?v=H0X8Vtob2m0",
  },
  {
    id: "double_leg",
    name: "Double Leg",
    icon: require("../../assets/dleg_icon.png"),
    types: ["flip"],
    prerequisites: ["pop_360_shuriken"],
    difficulty: 2,
    description:
      "An outside flip that takes off of two feet and with piked legs and has" +
      " varying degrees of rotation. Not to be confused with a piked sideflip, the hips never rise over the chest in a doubleleg.",
    tutorialUrl: "https://www.youtube.com/watch?v=RrvbIXSzT9Y",
  },
  {
    id: "machine",
    name: "Machine",
    icon: require("../../assets/machine_icon.png"),
    types: ["transition"],
    prerequisites: ["cartwheel"],
    difficulty: 1,
    description:
      "A kind of cartwheel where the legs and hands are placed in an opposite order, creating a 360 flat spin movement.",
    tutorialUrl: "https://www.youtube.com/watch?v=NzSMOA6-868",
  },
  {
    id: "lazyboi",
    name: "Lazyboi",
    icon: require("../../assets/lazyboi_icon.png"),
    types: ["transition"],
    prerequisites: ["tornado", "compasso"],
    difficulty: 1,
    description:
      "A layed back, no-kick, tornado.\noften performed with the hands behind the head or on the hips.",
    tutorialUrl: "https://www.youtube.com/watch?v=Bb8tUbg09ME",
  },
  {
    id: "touchdown_raiz",
    name: "Touchdown Raiz",
    icon: require("../../assets/touchDown_Raiz_icon.png"),
    types: ["transition", "flip"],
    prerequisites: ["raiz"],
    difficulty: 2,
    description:
      "A raiz where the leading hand touches the ground before the feet.",
    tutorialUrl: "https://www.youtube.com/watch?v=hFVmKVHsGho",
  },
  {
    id: "cork",
    name: "Cork",
    icon: require("../../assets/cork_icon.png"),
    types: ["twist", "flip"],
    prerequisites: ["gainer"],
    difficulty: 3,
    description:
      "A gainer with a full twist.\neven though it does not say so in the prerequisites, it's recommended you know at least one twisting move before trying this one.",
    tutorialUrl: "https://www.youtube.com/watch?v=r_VnnEcCtp8",
  },
  {
    id: "rodeo_flash",
    name: "Rodeo Flash",
    icon: require("../../assets/RodeoFlash_icon.png"),
    types: ["flip"],
    prerequisites: ["flash_kick"],
    difficulty: 3,
    description:
      "A flash kick, with an added one/two arm grab of the other leg, pulling it behind the back into an arched position.\n" +
      "this below is not a tutorial but just the only video i found.",
    tutorialUrl: "https://www.youtube.com/watch?app=desktop&v=lxKKRWuLhZ8",
  },
  {
    id: "backside_720",
    name: "Backside 720",
    icon: require("../../assets/bs720_icon.png"),
    types: ["kick", "twist"],
    prerequisites: ["pop_360"],
    difficulty: 1,
    description:
      "Starting with the back to the direction of movement(DOM), the practitioner jumps and spins 450° and then" +
      " performs a hook kick towards the target.",
    tutorialUrl: "https://www.youtube.com/watch?v=yArws74DOXk",
  },
  {
    id: "backside_900",
    name: "Backside 900",
    icon: require("../../assets/bs900_icon.png"),
    types: ["kick", "twist"],
    prerequisites: ["backside_720", "pop_tornado"],
    difficulty: 2,
    description:
      "Starting in a backside position, the practitioner  jumps and spins 540° degrees and then" +
      " performs a round kick towards the target.",
    tutorialUrl: "https://www.youtube.com/watch?v=jm8lRz8ed4M",
  },
  {
    id: "pop_720",
    name: "Pop 720",
    icon: require("../../assets/pop720_icon.png"),
    types: ["kick", "twist"],
    prerequisites: ["pop_360", "backside_720"],
    difficulty: 2,
    description:
      "From a setup, the practitioner jumps and spins 540° degrees and then" +
      " performs a hook kick towards the target.",
    tutorialUrl: "https://www.youtube.com/watch?v=0A5R0VejgJQ",
  },
  {
    id: "illusion_twist",
    name: "Illusion Twist",
    icon: require("../../assets/illusionTwist_icon.png"),
    types: ["kick", "twist"],
    prerequisites: ["pop_360", "backside_720", "butterfly_kick"],
    difficulty: 2,
    description:
      "A pop 360 turbo from a Butterfly-Kick setup.\n A lot of people see this as a Butterfly" +
      " Twist variation, but there is actually no twist happening, hence the name “illusion”.",
    tutorialUrl: "https://www.youtube.com/watch?v=4Vp4oX0qVTI",
  },
  {
    id: "webster",
    name: "Webster",
    icon: require("../../assets/webster_icon.png"),
    types: ["flip"],
    prerequisites: ["forward_roll"],
    difficulty: 2,
    description:
      "A front flip taking off of one leg while swinging the other leg backwards.",
    tutorialUrl: "https://www.youtube.com/watch?v=_VM9PJ1wZF4",
  },
  {
    id: "parafuso",
    name: "Parafuso",
    icon: require("../../assets/parafuso_icon.png"),
    types: ["flip", "kick"],
    prerequisites: ["tornado_kick"],
    difficulty: 2,
    description:
      "A Double Leg from a cheat setup.\nThe legs start apart and come together mid air, landing together.",
    tutorialUrl: "https://www.youtube.com/watch?v=mMRmjm85ZcE",
  },
  {
    id: "cartwheel_helicoptero",
    name: "Cartwheel Helicoptero",
    icon: require("../../assets/helicoptero_icon.png"),
    types: ["transition"],
    prerequisites: ["cartwheel_switch"],
    difficulty: 2,
    description:
      "A Cartwheel where the practitioner swings one leg down and the other one up, both in a circular motion, landing on the starting leg.",
    tutorialUrl: "https://www.youtube.com/watch?v=d9SRfzi8fWw&t=123s",
  },
  {
    id: "master_scoot",
    name: "Master Scoot",
    icon: require("../../assets/masterScoot_icon.png"),
    types: ["transition", "flip"],
    prerequisites: ["scoot", "dive_cartwheel"],
    difficulty: 1,
    description:
      "A two handed scoot from an inward swing of the leading leg(master swing).",
    tutorialUrl: "https://www.youtube.com/watch?v=heNft_5ukkU&t=230s",
  },
  {
    id: "moon_kick",
    name: "Moon Kick",
    icon: require("../../assets/moonKick_icon.png"),
    types: ["kick", "flip"],
    prerequisites: ["aerial_hook", "slant_gainer"],
    difficulty: 2,
    description: "A slant gainer with a hook kick.",
    tutorialUrl: "https://www.youtube.com/watch?v=zedUQyqHdrM",
  },
  {
    id: "piked_backflip",
    name: "Piked Backflip",
    icon: require("../../assets/pikedBackflip_icon.png"),
    types: ["flip"],
    prerequisites: ["backflip"],
    difficulty: 2,
    description: "A backflip in a piked position.",
    tutorialUrl: "https://www.youtube.com/watch?v=ZY2qjQEeeCU",
  },
  {
    id: "crowd_awakener",
    name: "Crowd Awakener",
    icon: require("../../assets/crowdAwakener_icon.png"),
    types: ["kick"],
    prerequisites: ["pop_360", "tornado_kick"],
    difficulty: 1,
    description: "A 180° turn into a split kick from a pop or cheat setup.",
    tutorialUrl: "https://www.youtube.com/watch?v=KM6Wsh74LEQ",
  },
  {
    id: "valdez",
    name: "Valdez",
    icon: require("../../assets/valdez_icon.png"),
    types: ["flip", "transition"],
    prerequisites: ["back_handspring"],
    difficulty: 2,
    description: "A one handed Back Handspring.",
    tutorialUrl: "https://www.youtube.com/watch?v=A7lzmG8e84c",
  },
  {
    id: "flyspring",
    name: "Flyspring",
    icon: require("../../assets/flyspring_icon.png"),
    types: ["flip", "transition"],
    prerequisites: ["front_handspring", "dive_roll"],
    difficulty: 2,
    description: "A Front Handspring performed off of two feet.",
    tutorialUrl: "https://www.youtube.com/watch?v=_gK5vijqgv8",
  },
  {
    id: "coin_drop",
    name: "Coin Drop",
    icon: require("../../assets/coinDrop_icon.png"),
    types: ["flip", "transition"],
    prerequisites: ["machine", "star_kipup"],
    difficulty: 2,
    description:
      "Starting the same way as a machine,\n the practitioner slides onto his back, then through" +
      " a circular motion, similar to a star kipup, he bounces back up.",
    tutorialUrl: "https://www.youtube.com/watch?v=CnCc3yJBNEs",
  },
  {
    id: "btwist",
    name: "Btwist",
    icon: require("../../assets/btwist_icon.png"),
    types: ["twist"],
    prerequisites: ["butterfly_kick"],
    difficulty: 2,
    description: "A butterfly kick with a 360° spin.",
    tutorialUrl: "https://www.youtube.com/watch?v=F88oPiATPq8",
  },
  {
    id: "butterfly_hook",
    name: "Butterfly Hook",
    icon: require("../../assets/butterflyHook_icon.png"),
    types: ["kick"],
    prerequisites: ["butterfly_kick", "skip_hook"],
    difficulty: 1,
    description: "A butterfly kick with a hook kick at the end.",
    tutorialUrl: "https://www.youtube.com/watch?v=_GFD5TjWfbA",
  },
  {
    id: "headspring",
    name: "Headspring",
    icon: require("../../assets/headspring_icon.png"),
    types: ["flip"],
    prerequisites: ["handstand", "forward_roll"],
    difficulty: 1,
    description:
      "A forward flip that starts by going into a headstand then kicking over to land on the feet.",
    tutorialUrl: "https://www.youtube.com/watch?v=ifqi_v1Nf0o",
  },
  {
    id: "spyder",
    name: "Spyder",
    icon: require("../../assets/spyder_icon.png"),
    types: ["transition"],
    prerequisites: ["machine"],
    difficulty: 1,
    description: "A no-handed Machine.",
    tutorialUrl: "https://www.youtube.com/watch?v=iOl0tIdLAk8&t=15s",
  },
  {
    id: "arabian",
    name: "Arabian",
    icon: require("../../assets/arabian_icon.png"),
    types: ["flip"],
    prerequisites: ["frontflip", "backflip"],
    difficulty: 2,
    description:
      "A backflip during which the practioner does a 180° twist tand then tucks into a frontflip.",
    tutorialUrl: "https://www.youtube.com/watch?v=YiYf_vzz3ng",
  },
  {
    id: "cheat_720_double",
    name: "Cheat 720 Double",
    icon: require("../../assets/cheat720Double_icon.png"),
    types: ["kick", "twist"],
    prerequisites: ["cheat_720"],
    difficulty: 2,
    description:
      "A Cheat 720 with two kicks, kick an outside cresent / hook kick during the takeoff and the regular hook kick at the end.",
    tutorialUrl: "https://www.youtube.com/watch?v=9ms_CQ6nrsY&t=2s",
  },
];

export const TRICKS_DATA = TRICKS_DATA_RAW.sort((a, b) =>
  a.name.localeCompare(b.name)
);
