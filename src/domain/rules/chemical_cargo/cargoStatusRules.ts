import ChemicalCargoStatus from "@/domain/status/ChemicalCargoStatus";

const CANNOT_MOVE_REASON = {
  STATUS_BLOCKED: "Cargo status is blocked",
  STATUS_CANCELED: "Cargo status is canceled",
  TRANSITION_NOT_ALLOWED: "Status transition not allowed",
};

type ChemicalCargoStatusKey = keyof typeof ChemicalCargoStatus;

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

export function canMoveChemicalCargo(from: string, to: string) {
  const fromKey = (
    Object.keys(ChemicalCargoStatus) as ChemicalCargoStatusKey[]
  ).find((key) => ChemicalCargoStatus[key] === from);

  const canMove = fromKey
    ? ALLOWED_CHEMICAL_CARGO_MOVEMENTS[fromKey].includes(to)
    : false;
  const cannotMoveReasons: string[] = [];

  if (!canMove) {
    switch (from) {
      case ChemicalCargoStatus.blocked:
        cannotMoveReasons.push(CANNOT_MOVE_REASON.STATUS_BLOCKED);
        break;
      case ChemicalCargoStatus.canceled:
        cannotMoveReasons.push(CANNOT_MOVE_REASON.STATUS_CANCELED);
        break;
      default:
        cannotMoveReasons.push(CANNOT_MOVE_REASON.TRANSITION_NOT_ALLOWED);
    }
  }

  return { canMove, cannotMoveReasons };
}
