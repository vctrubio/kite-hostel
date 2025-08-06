import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { userRole } from "@/drizzle/migrations/schema";

interface ReferenceBookingCardProps {
  bookingCreatedAt: string;
  bookingStartDate: string;
  packageCapacity: number;
  packagePrice: number;
  teacherName: string | null;
  note: string | null;
  referenceId: string | null;
  role: typeof userRole._.enumValues[number];
}

export function ReferenceBookingCard({
  bookingCreatedAt,
  bookingStartDate,
  packageCapacity,
  packagePrice,
  teacherName,
  note,
  referenceId,
  role,
}: ReferenceBookingCardProps) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{teacherName || note || "Booking Reference"}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="mb-2">
          <h3 className="text-md font-semibold mb-1">Booking Details</h3>
          <div className="flex items-center justify-between text-sm">
            <p className="font-medium">Created:</p>
            <p>{format(new Date(bookingCreatedAt), "PPP")}</p>
          </div>
          <div className="flex items-center justify-between text-sm">
            <p className="font-medium">Start Date:</p>
            <p>{format(new Date(bookingStartDate), "PPP")}</p>
          </div>
        </div>

        <div className="mb-2">
          <h3 className="text-md font-semibold mb-1">Package Details</h3>
          <div className="flex items-center justify-between text-sm">
            <p className="font-medium">Capacity:</p>
            <p>{packageCapacity} students</p>
          </div>
          <div className="flex items-center justify-between text-sm">
            <p className="font-medium">Price:</p>
            <p>€{packagePrice}</p>
          </div>
        </div>

        {referenceId && (
          <div className="flex items-center justify-between text-sm mb-2">
            <p className="font-medium">Reference ID:</p>
            <p className="text-xs">{referenceId}</p>
          </div>
        )}

        <div className="flex items-center justify-between text-sm mb-2">
          <p className="font-medium">Role:</p>
          <p>{role}</p>
        </div>

        {teacherName && (
          <div className="flex items-center justify-between text-sm mb-2">
            <p className="font-medium">Teacher:</p>
            <p>{teacherName}</p>
          </div>
        )}

        {note && (
          <div className="flex items-center justify-between text-sm">
            <p className="font-medium">Note:</p>
            <p>{note}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
