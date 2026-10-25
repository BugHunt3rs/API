import ChemicalCargoStatus, {
  type ChemicalCargoStatusKey,
} from "@/domain/status/ChemicalCargoStatus";

export default function getStatusKey(description: string) {
  return (Object.keys(ChemicalCargoStatus) as ChemicalCargoStatusKey[]).find(
    (key) => ChemicalCargoStatus[key] === description,
  );
}
