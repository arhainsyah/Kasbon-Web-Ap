import type { Debt } from "@/lib/types";
import DebtItem from "@/components/DebtItem";

interface Props {
  debts: Debt[];
  busyId: string | null;
  onToggleSettled: (debt: Debt) => void;
  onEdit: (debt: Debt) => void;
  onDelete: (debt: Debt) => void;
}

export default function DebtList({ debts, busyId, ...handlers }: Props) {
  return (
    <ul className="space-y-3">
      {debts.map((d) => (
        <DebtItem key={d.id} debt={d} busy={busyId === d.id} {...handlers} />
      ))}
    </ul>
  );
}