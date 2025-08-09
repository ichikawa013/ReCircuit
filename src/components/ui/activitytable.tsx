// components/ui/ActivityTable.tsx
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

export type ActivityType = "Sale" | "Donation";
export type StatusType = "pending" | "completed";

export interface ActivityRow {
  id: string;
  type: ActivityType;
  itemName: string;
  date: string;
  status: StatusType;
}

interface ActivityTableProps {
  data: ActivityRow[];
}

const ActivityTable = ({ data }: ActivityTableProps) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Type</TableHead>
        <TableHead>Item</TableHead>
        <TableHead>Date</TableHead>
        <TableHead>Status</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.length === 0 ? (
        <TableRow>
          <TableCell colSpan={4} className="text-muted-foreground text-center">
            No recent activity
          </TableCell>
        </TableRow>
      ) : (
        data.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.type}</TableCell>
            <TableCell>{row.itemName}</TableCell>
            <TableCell>{row.date}</TableCell>
            <TableCell
              className={
                row.status === "completed" ? "text-green-600 font-bold" : "text-orange-600 font-bold"
              }
            >
              {row.status}
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  </Table>
);

export default ActivityTable;
