import ChemicalCargoStatus, {
  type ChemicalCargoStatusKey,
} from "@/domain/status/ChemicalCargoStatus";

const CANNOT_MOVE_REASON = {
  STATUS_BLOCKED: "Cargo status is blocked",
  STATUS_CANCELED: "Cargo status is canceled",
  TRANSITION_NOT_ALLOWED: "Status transition not allowed",
};

const ALLOWED_CHEMICAL_CARGO_MOVEMENTS: Record<
  ChemicalCargoStatusKey,
  string[]
> = {
  registered: [ChemicalCargoStatus.underAnalyses, ChemicalCargoStatus.canceled],
  underAnalyses: [
    ChemicalCargoStatus.underInspection,
    ChemicalCargoStatus.canceled,
  ],
  underInspection: [
    ChemicalCargoStatus.released,
    ChemicalCargoStatus.blocked,
    ChemicalCargoStatus.canceled,
  ],
  released: [ChemicalCargoStatus.moving, ChemicalCargoStatus.canceled],
  blocked: [ChemicalCargoStatus.canceled],
  moving: [ChemicalCargoStatus.done],
  done: [],
  canceled: [],
};

export function canMoveChemicalCargo(
  from: ChemicalCargoStatusKey,
  to: ChemicalCargoStatusKey,
) {
  const cannotMoveReasons: string[] = [];
  let canMove = false;

  switch (from) {
    case "canceled":
      cannotMoveReasons.push(CANNOT_MOVE_REASON.STATUS_CANCELED);
      break;
    case "blocked":
      canMove = to === "canceled";
      if (!canMove) cannotMoveReasons.push(CANNOT_MOVE_REASON.STATUS_BLOCKED);
      break;
    default:
      canMove = ALLOWED_CHEMICAL_CARGO_MOVEMENTS[from].includes(
        ChemicalCargoStatus[to],
      );
      if (!canMove) {
        cannotMoveReasons.push(CANNOT_MOVE_REASON.TRANSITION_NOT_ALLOWED);
      }
  }

  return { canMove, cannotMoveReasons };
}
